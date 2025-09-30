# 后端架构设计文档（NestJS · 自动批作业系统）v1

> 目标：支撑“拍照→OCR→解析→判分→报告”的自动批作业业务，支持中英文、语文（古诗/句子）、数学（算式/等式等价），具备弹性扩展、成本可控、可观测与安全合规。

---

## 0. 摘要（Scope & 非功能性目标）

* **可用性**：99.9%（月不可用 ≤ 43min），核心提交/查询路径无单点。
* **时延目标**：P50 ≤ 8s，P95 ≤ 25s（单页作业，云 OCR）；自建 OCR 视资源波动可 P95 ≤ 35s。
* **吞吐**：峰值 20rps 的提交创建，判分任务可水平扩展（N×Worker）。
* **一致性**：最终一致；判分流水线异步，状态通过轮询/WS 订阅。
* **数据安全**：S3/OSS 仅短时可读写的预签名 URL，所有资产私有；审计与访问控制按班级/组织维度授权。
* **可观测**：日志、指标、分布式追踪；关键 SLI/告警齐备。

---

## 1. 架构总览

```
Mobile App(Flutter)
   │  REST / WebSocket
   ▼
API Gateway (NestJS Monolith: HTTP+WS)
   ├─ Auth/RBAC/Org/Class/Assignment/Submission APIs
   ├─ Media: S3/OSS presign, upload callbacks
   ├─ Orchestrator: 投递 BullMQ 队列
   └─ OpenAPI/Swagger, Admin health

Redis (queues, cache)  ←→  BullMQ Workers (NestJS)
   ├─ OCR Worker     → OCR Providers (Cloud / PaddleOCR)
   ├─ Parse Worker   → 文本/数学解析器
   ├─ Grade Worker   → 文本模糊匹配 / Math 等价
   └─ Report Worker  → 汇总统计/知识点画像

Math Service (可选 Python+SymPy, FastAPI)  ←→  GradeWorker

PostgreSQL (RDS)
   ├─ 业务表（用户/作业/题目/答案/提交/结果/报表/审计）
   └─ 事件表（状态流转、任务事件）

Object Storage (S3/OSS/COS)
   ├─ 原图/裁切图/遮罩
   └─ OCR JSON / 可视化标注
```

> **部署拓扑**：API 与 Worker 可分开部署为两个镜像（同代码库不同进程），按流量与任务量独立横向扩容。

---

## 2. 模块与职责（NestJS）

* **AuthModule**：JWT/OAuth、组织-班级-角色（teacher/student/admin）授权；多租户隔离。
* **User/Org/ClassModule**：基础主数据。
* **AssignmentModule**：作业/题目/答案键（AnswerKey Schema，支持 zh/en & math）。
* **SubmissionModule**：提交创建、状态查询、WebSocket 推送、审计记录。
* **MediaModule**：预签名上传、回调校验、图片安全扫描（可挂钩审核）。
* **OcrModule**：OCR Provider 适配（Baidu/Tencent/Azure/PaddleOCR/Mathpix 等），路由策略与回退。
* **GradingModule**：中文/英文文本比对（标准化+模糊匹配+word-diff），数学结果/等价判定；可插拔策略。
* **AnalyticsModule**：报表聚合（题/知识点/学生/班级维度），错因库与词典。
* **QueueModule**：BullMQ 队列（`ocr`, `parse`, `grade`, `report`），重试与死信管理。
* **WsGateway**：Submission 状态主题推送（`submission:{id}`）。
* **ObservabilityModule**：Metric/Tracing/Logging（OpenTelemetry + Prometheus）。

---

## 3. 核心数据模型（PostgreSQL）

> 采用“业务主表 + JSONB 配置/详情”的混合建模，便于扩展。

### 3.1 表概览

* `users(id, org_id, role, name, email, ...)`
* `classes(id, org_id, name, teacher_id, ...)`
* `assignments(id, class_id, title, deadline, ...)`
* `questions(id, assignment_id, type, language, points, knowledge_tags, order, ...)`
* `answer_keys(id, question_id, schema_jsonb)`
* `submissions(id, assignment_id, student_id, status, created_at, updated_at)`
* `submission_images(id, submission_id, s3_key, meta_jsonb)`
* `item_results(id, submission_id, question_id, score, correct, details_jsonb)`
* `reports(id, submission_id, total, obtained, stats_jsonb)`
* `assets(id, type, s3_key, meta_jsonb)`
* `audit_logs(id, actor_id, action, target_type, target_id, payload_jsonb, created_at)`
* `job_events(id, submission_id, job_type, status, info_jsonb, created_at)`

### 3.2 AnswerKey Schema（示例）

```json
{
  "text_zh": {
    "normalize": { "stripPunct": true, "simp": true, "z2h": true },
    "lines": [ { "text": "春眠不觉晓", "maxTypos": 1 } ]
  },
  "text_en": {
    "policy": { "caseSensitive": false, "ignorePunct": true, "allowBritish": true, "maxTyposPerWord": 1 },
    "lines": [ { "text": "to be or not to be" } ]
  },
  "math": {
    "form": "equation|value",
    "expr": "x^2 + 2x + 1",
    "epsilon": 1e-6,
    "vars": ["x"]
  }
}
```

---

## 4. 关键流程（时序）

### 4.1 学生提交 → 判分流水线

```
POST /submissions (images S3 key[]) → status=queued
  ↓ push queue: ocr:{submissionId}
OCR Worker
  → 选择 Provider（按题型/语言/ROI）
  → 产出 OCR JSON（含置信度、版面坐标）
  → 存 S3 & DB（submission.ocr_payload_ref）
  ↓ push parse:{submissionId}
Parse Worker
  → 按题目类型解析：文本行/表达式/等式
  → 标准化（中/英）与结构化
  ↓ push grade:{submissionId}
Grade Worker
  → 文本：行/词级 diff、阈值判定
  → 数学：数值或等价判定（必要时调用 SymPy）
  → 生成 item_results，累积分数
  ↓ push report:{submissionId}
Report Worker
  → 聚合统计、错因标签、知识点画像
  → 更新 reports & submissions.status=reported
WS 推送：queued→ocr→parsed→graded→reported
```

### 4.2 教师建作业

```
POST /assignments → POST /assignments/:id/questions → POST /questions/:id/answer-key
```

### 4.3 失败重试与补偿

* 队列重试：指数退避（如 3, 9, 27s），上限 N 次后入 **DLQ**（死信队列），后台可手动/定时回放。
* 幂等性：`POST /submissions` 接收 `Idempotency-Key` 头，结合 `studentId+assignmentId+hash(images)` 去重。
* OCR 低置信度：降级到第二 Provider；或回退“人工复核”标记。

---

## 5. API 设计（摘要）

### 5.1 鉴权

* `POST /auth/login` → `{ token, user }`
* Bearer JWT（短期）+ Refresh（长期）；角色/班级基于 JWT claim。

### 5.2 作业/题目/提交

* `POST /assignments` (teacher)
* `POST /assignments/:id/questions` (teacher)
* `POST /questions/:id/answer-key` (teacher)
* `POST /media/presign` → `{ uploadUrl, key }`
* `POST /submissions` (student) `{ assignmentId, images:[{key}] }` → `{ submissionId, status }`
* `GET /submissions/:id` → `{ status, report? }`
* `WS /submissions/:id/stream` → 状态流与进度

### 5.3 错误码（示例）

* `A001` 未授权；`A002` 权限不足
* `M401` 媒体签名失败；`M409` 重复上传
* `S422` 提交无效；`G500` 判分失败；`O408` OCR超时

> Swagger/OpenAPI 由代码注解生成；重要 DTO 使用 `class-validator` + `class-transformer` 校验。

---

## 6. Grading 策略

### 6.1 中文文本

* 规范化：全半角/标点/空白；（可选）简繁；异体字映射。
* 比对：按行 LCS/Levenshtein；每行 `maxTypos`；可配置允许变体（regex/枚举）。

### 6.2 英文文本

* 规范化：大小写、智能引号/破折号→ASCII、空白折叠、（可选）去变音；英/美式拼写映射开关。
* word-level diff：错词/多写/少写/标点/大小写错误分类；统计 WER。

### 6.3 数学

* **结果型**：表达式求值，比较数值（`epsilon`）。
* **等式等价**：Node 端 mathjs 随机采样自变量校验；复杂表达式走 SymPy `simplify(lhs - rhs)==0`。
* 单位/格式标准化（分数、小数、指数）。

---

## 7. OCR 策略

* Provider 策略：按题型、语言、图片清晰度、置信度阈值动态路由；失败回退次优 Provider。
* 版面与 ROI：支持教师模板定义题区/答题区坐标，OCR 时裁切提升精度与成本效率。
* 输出统一：内部统一为 `OcrDocument` 协议（段落/行/词，置信度/坐标/语言标签）。

---

## 8. 安全与合规

* **访问控制**：组织/班级/作业维度 RBAC；对象存储私有桶 + 预签名最短 TTL（60~300s）。
* **敏感信息处理**：学生姓名/学号可遮罩；图片脱敏（可选规则引擎）。
* **审计**：重要查询/下载/导出行为留痕；管理员可追踪。
* **数据保留**：原图/中间件产物保留策略（如 180 天归档/清理）。
* **速率限制**：IP/User 维度限流；防批量撞库与滥用。

---

## 9. 可观测性与运维

* **日志**：结构化 JSON（requestId、submissionId、jobId、provider、latency、result）。
* **指标**：

  * 业务：提交量、成功率、平均耗时、OCR 置信度、判分准确率（抽样人工标注校正）。
  * 系统：队列深度、任务失败率、重试次数、P95 时延。
* **追踪**：OpenTelemetry（HTTP→队列→Worker→外部服务）全链路 Trace。
* **告警**：队列积压阈值、OCR 超时比例、API 5xx比例、P95 时延异常。

---

## 10. 部署与配置

* **容器**：两个入口命令

  * `yarn start:api`（Gateway）
  * `yarn start:worker`（Workers）
* **环境变量**（示例）

```
NODE_ENV=production
API_PORT=8080
DB_URL=postgres://...
REDIS_URL=redis://...
S3_ENDPOINT=...
S3_BUCKET=...
JWT_SECRET=...
OCR_PROVIDERS=baidu,tencent,paddle
MATH_SERVICE_URL=http://math:8000
WS_PUBLIC_URL=wss://api.example.com
```

* **K8s/Helm 参数要点**：API/Worker 分别的 HPA（CPU/QueueDepth 指标）；节点亲和避免噪声。

---

## 11. 目录结构（后端仓库）

```
apps/
  api/              # Nest HTTP+WS（可与 worker 共用代码包）
  worker/           # Nest BullMQ Worker 进程
packages/
  common/           # DTO、entities、utils、answer-key schema
  grading/          # 文本/数学判分库（纯 TS）
  ocr-adapters/     # 各 OCR Provider 适配
  math-client/      # 与 Python SymPy 服务的 SDK（可选）

infra/              # Dockerfile、helm charts、k8s manifests
scripts/            # 数据迁移、回放、基准测试
```

---

## 12. 关键代码骨架（片段）

### 12.1 BullMQ 队列定义

```ts
// queue.module.ts
@Module({ providers: [QueueService], exports: [QueueService] })
export class QueueModule {}

@Injectable()
export class QueueService {
  ocr = new Queue('ocr', { connection: { url: process.env.REDIS_URL! } });
  parse = new Queue('parse', { connection: { url: process.env.REDIS_URL! } });
  grade = new Queue('grade', { connection: { url: process.env.REDIS_URL! } });
  report = new Queue('report', { connection: { url: process.env.REDIS_URL! } });
}
```

### 12.2 WebSocket 推送

```ts
@WebSocketGateway({ namespace: 'submissions', cors: true })
export class SubmissionsGateway {
  @WebSocketServer() server: Server;
  notify(id: string, status: string, payload?: unknown) {
    this.server.to(id).emit('status', { status, payload });
  }
}
```

### 12.3 英文标准化（Node 端）

```ts
export function normalizeEn(s: string, opts?: { lower?: boolean; stripPunct?: boolean; deaccent?: boolean }) {
  let t = s.normalize('NFC');
  const map: Record<string, string> = { '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '\u00A0': ' ' };
  for (const [k, v] of Object.entries(map)) t = t.split(k).join(v);
  if (opts?.deaccent) t = removeDiacritics(t); // 依赖 diacritics
  if (opts?.lower !== false) t = t.toLowerCase();
  if (opts?.stripPunct) t = t.replace(/[\p{P}]+/gu, ' ');
  return t.replace(/\s+/g, ' ').trim();
}
```

---

## 13. 测试与验收

* **单元**：判分算法（中/英/数）边界与随机测试；OCR 适配器 mock；API 校验。
* **集成**：端到端提交→报告；对队列重试/超时/回退路径。
* **基线数据集**：200+ 真实扫描样本，覆盖不同纸张/光照/倾斜。
* **回归**：引入新 Provider/算法时对照金标集比较准确率/时延。

---

## 14. 成本与扩展

* **成本杠杆**：

  * 优先识别 ROI 裁切区，减少 OCR 代价。
  * 低置信度/长文本走自建 OCR；高置信度或高并发走云厂商（弹性）。
  * 结果缓存与幂等去重，避免重复判分。
* **扩展点**：

  * 口算拍照（arithmetics）与选择题 OCR；
  * 版面理解（表格/题号自动定位）；
  * 教师纠错回写→错因库持续学习。

---

## 15. 风险与缓解

* OCR 质量波动 → Provider 级 A/B 与回退；置信度阈值与人工复核入口。
* 数学等价误判 → 增加样本点校验与简化器双重验证；边界条件（分母为0）过滤。
* 队列积压 → HPA + 队列水位告警；优先级队列（短作业优先）。
* 隐私合规 → 访问边界、日志脱敏、数据保留策略与合规审计。

---

## 16. 版本规划（Roadmap）

* **v1（MVP）**：通用 OCR + 中文文本 + 数学结果/基本等价；英文文本（基础）。
* **v1.5**：教师模板 ROI、错误可视化增强、SymPy 服务接入。
* **v2**：自建 PaddleOCR 集群、复杂公式 OCR（Mathpix）、组织级报表、权限细粒度与审计导出。