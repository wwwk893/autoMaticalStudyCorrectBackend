# Flutter 自动批作业APP：原型图 + 技术选型 + 目录与架构（v1）

> 目标：面向“拍照→OCR→解析→判分→报告”的移动端应用。本文给出**可落地**的原型草图、Flutter 技术选型、目录结构与分层架构，并附关键代码骨架。

---

## 1. 信息架构 & 用户流程

```
学生/教师 → 登录/选择班级 → 作业列表 → (学生) 拍照提交 → 状态订阅 → 判分结果/解析
                                     ↘ (教师) 建作业/录答案 → 查看统计
```

**关键状态流**

```
queued → ocr → parsed → graded → reported
```

App 通过 WebSocket 订阅 `submissionId` 的状态并实时更新 UI。

---

## 2. 原型图（低保真草图）

> 说明：ASCII 线框图仅用于产品结构讨论，后续可导入 Figma/Flutter UI 实现。

### 2.1 学生端

**A. 作业列表**

```
┌────────────────────────────────────┐
│  标题：本周作业(语文/数学)        [🔍] │
├────────────────────────────────────┤
│ [卡片] 语文·古诗词默写 — 截止 10/08 │
│  状态：未提交  [去提交]              │
├────────────────────────────────────┤
│ [卡片] 数学·等式/算式 — 截止 10/09  │
│  状态：已提交  分数：85  [查看]      │
└────────────────────────────────────┘
```

**B. 拍照与预处理**

```
┌────────────────────────────────────┐
│  提交：语文·古诗词默写               │
│  [ 相机取景 ]  边缘检测/透视校正提示 │
│  [ 重新拍 ]  [ 批量模式 ]           │
├────────────────────────────────────┤
│ [缩略图1][缩略图2][+ 添加]          │
│ [下一步：区域标注/上传]             │
└────────────────────────────────────┘
```

**C. 上传与进度**

```
┌────────────────────────────────────┐
│  正在提交…  60%                    │
│  状态：ocr → parsed (WebSocket)    │
│  [取消] [后台上传]                  │
└────────────────────────────────────┘
```

**D. 判分结果（语文）**

```
┌────────────────────────────────────┐
│  结果：87/100  用时：18s            │
│  第1题(1分/行)：                     │
│   标准：春眠不觉晓                    │
│   你的：春眠不觉**小**      (错字 高亮) │
│  [行对比] [错因标签：误写/缺字]       │
├────────────────────────────────────┤
│  第2题…                              │
│  [查看解析]  [知识点统计]            │
└────────────────────────────────────┘
```

**E. 判分结果（数学）**

```
┌────────────────────────────────────┐
│  结果：等式等价 ✅                    │
│  校验：在样本点( x=1.2, x=-0.5 )均成立 │
│  你的： (x+1)^2                      │
│  标准： x^2+2x+1                     │
│  [等价说明] [查看演算]               │
└────────────────────────────────────┘
```

### 2.2 教师端（移动端）

```
┌────────────────────────────────────┐
│  班级：六(1)班  [切换]               │
├──────────────── 学生正确率 ────────────────┤
│  语文(本周)： 78%   数学： 71%         │
│  [新建作业] [导入答案] [统计/导出]      │
└────────────────────────────────────┘
```

---

## 3. Flutter 技术选型（MVP→增强）

* **框架/基础**：Flutter 3.22+、Dart 3、Material 3、暗色模式
* **路由**：`go_router`（声明式导航、深链）
* **状态管理**：`riverpod`/`hooks_riverpod` + `AsyncNotifier`（或 `StateNotifier`）
* **网络**：`dio`（拦截器/重试/取消） + `retrofit`（可选，类型安全）
* **序列化**：`freezed` + `json_serializable`（不可变数据模型/模式匹配）
* **本地存储**：`hive`（离线缓存/上传队列）+ `flutter_secure_storage`（Token）
* **图片/相机**：`camera`、`image_picker`、`image`（裁切/去噪/压缩）
* **OCR 前处理**：边缘检测/透视矫正（前端仅做轻预处理；OCR 主要在后端）
* **实时通信**：`web_socket_channel`（订阅提交进度）
* **断点续传**：`dio` + 后端 S3/OSS 直传（预签名 URL）
* **多环境**：`flutter_dotenv` + Flavors（dev/stg/prod）
* **国际化**：`intl` + `flutter_localizations`
* **日志/监控**：`logger`、`sentry_flutter`（可选）
* **测试**：`flutter_test`、`mocktail`、`golden_toolkit`（金样图）

> 可选增强：如需端上即时“粗判”，可接 `google_mlkit_text_recognition` 做快速反馈，但**以服务端OCR为准**。

---

## 3.1 英文作业兼容（前端与判分展示）

**目标**：在不改变整体架构前提下，新增对英文作业（拼写、词组/句子默写、填空）的识别与判分，沿用拍照→OCR→解析→判分→报告流程。

### A. 题型与判分策略（English）

* **Spelling / Word List**：按 word-level 精确/模糊匹配；可设置每词容错阈值（编辑距离）。
* **Sentence Dictation / Quote**：按 token 序列比对；可配置大小写与标点策略（忽略/严格）。
* **Fill-in-the-Blank**：支持同义词/词形变化（variants/regex），并可配置大小写/标点政策。

### B. OCR 路由

* 题型为英文时优先选择拉丁/手写优化的 OCR 通道（云厂商或自建）。
* （可选）端上快速识别仅作即时提示，最终以服务端结果为准。

### C. 英文标准化（Normalization）

* 统一：大小写（可选）、智能引号/破折号→ASCII、全/半角、空白折叠、（可选）去除变音符。
* 常见 OCR 混淆映射：l↔1、O↔0、rn↔m、cl↔d、B↔8、S↔5（在低置信度时启用）。
* 英式/美式拼写映射（可选）：colour↔color、organise↔organize 等（作业配置开关）。

### D. 前端 UI 表达

* word-level 高亮：正确（正常）、错词（红底/下划线）、多写（删除线）、少写（灰色占位）、标点错误（蓝色边框）。
* 统计：WER（词错误率）、常见错拼 TopN、标点/大小写错误计数。

### E. AnswerKey 扩展（与后端共享的 schema 思路）

```json
{
  "type": "en_text",
  "policy": { "caseSensitive": false, "ignorePunct": true, "allowBritish": true, "maxTyposPerWord": 1 },
  "lines": [
    { "text": "To be, or not to be", "variants": ["to be or not to be"] },
    { "text": "that's the question", "variants": ["that is the question"] }
  ]
}
```

### F. 语言标记与切换

* 作业/题目增加 `language: zh|en|auto`；`auto` 时由服务端根据 OCR 返回语言/脚本判定。
* 前端据语言切换：UI 文案、默认标准化策略、错因标签与统计口径。

### G. 指标与验收（English）

* 识别：英文手写/印刷体 WER、低置信度比例。
* 判分：拼写题准确率、句子题 WER、错误类别分布。
* 体验：P95 端到端时延、弱网重试成功率。

---

## 4. 工程目录（feature-first + clean architecture）

```
lib/
├─ app/
│  ├─ app.dart                 # MaterialApp、主题、GoRouter 注入
│  └─ di.dart                  # ProviderScope、全局依赖装配
├─ core/
│  ├─ config/                  # 环境配置、常量、路由命名
│  ├─ error/                   # AppException、ErrorMapper
│  ├─ network/                 # Dio/Retrofit 客户端、拦截器、WebSocket
│  ├─ storage/                 # Hive/secure storage 封装
│  ├─ utils/                   # 文本标准化/图像工具/格式化
│  └─ widgets/                 # 通用组件(按钮/占位/空态)
├─ features/
│  ├─ auth/
│  │  ├─ data/    (dto, repo impl)
│  │  ├─ domain/  (entity, repo, usecase)
│  │  └─ presentation/ (pages, providers, widgets)
│  ├─ assignment/
│  ├─ submission/
│  │  ├─ data/    (上传队列, WS 订阅, API)
│  │  ├─ domain/  (Submission, 状态机, 用例)
│  │  └─ presentation/ (拍照/预览/进度/结果)
│  └─ analytics/
├─ l10n/                      # 多语言
├─ main.dart
└─ main_dev.dart|main_stg.dart|main_prod.dart  # Flavors 入口

assets/
├─ fonts/  images/  icons/
```

---

## 5. 分层架构（Clean Architecture）

```
Presentation (Flutter UI, Riverpod providers)
   ↑  依赖
Domain (Entities, Value Objects, Repositories接口, UseCases)
   ↑  依赖
Data   (DTO, Mappers, RemoteDataSource/API, LocalDataSource)
```

**要点**

* `Domain` 不依赖 Flutter；保持纯 Dart，可测试性高。
* `Data` 持有具体实现（Dio/Hive/WS），通过接口注入到 `Domain`。
* `Presentation` 只与 `UseCase`/`Entity` 交互，由 Provider 串联生命周期。

---

## 6. 关键数据模型（Dart / freezed 示例）

```dart
@freezed
class Submission with _$Submission {
  const factory Submission({
    required String id,
    required String assignmentId,
    required String studentId,
    required SubmissionStatus status, // queued/ocr/parsed/graded/reported
    @Default([]) List<ImageAsset> images,
    ScoreReport? report,
  }) = _Submission;
}

enum SubmissionStatus { queued, ocr, parsed, graded, reported }

@freezed
class ScoreReport with _$ScoreReport {
  const factory ScoreReport({
    required int total,
    required int obtained,
    required List<ItemResult> items,
  }) = _ScoreReport;
}
```

---

## 7. 网络层与拦截器（Dio）

```dart
class ApiClient {
  final Dio dio;
  ApiClient(String baseUrl, {String? token})
      : dio = Dio(BaseOptions(baseUrl: baseUrl)) {
    dio.interceptors.addAll([
      InterceptorsWrapper(onRequest: (o, h) {
        if (token != null) o.headers['Authorization'] = 'Bearer $token';
        return h.next(o);
      }),
      LogInterceptor(responseBody: false),
    ]);
  }

  Future<PresignResp> presignUpload(String filename, int size) async {
    final r = await dio.post('/media/presign', data: {
      'filename': filename,
      'size': size,
    });
    return PresignResp.fromJson(r.data);
  }
}
```

---

## 8. 路由（go_router）与导航

```dart
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomePage()),
    GoRoute(path: '/assignments', builder: (_, __) => const AssignmentListPage()),
    GoRoute(path: '/submit/:id', builder: (c, s) => SubmitPage(id: s.pathParameters['id']!)),
    GoRoute(path: '/result/:sid', builder: (c, s) => ResultPage(submissionId: s.pathParameters['sid']!)),
  ],
);
```

---

## 9. Riverpod：提交流程 Provider（骨架）

```dart
@riverpod
class SubmissionController extends _$SubmissionController {
  @override
  Future<Submission?> build() async => null;

  Future<String> create({required String assignmentId, required List<File> images}) async {
    // 1) 直传对象存储: presign → dio.put → 得到 keys
    // 2) 创建 submission（POST /submissions）→ 返回 submissionId
    // 3) 建立 WS 订阅，更新 state
    return 'submissionId';
  }

  Stream<SubmissionStatus> subscribe(String submissionId) {
    // WebSocket 订阅服务端状态
    // 更新 state = state.copyWith(status: ...)
    throw UnimplementedError();
  }
}
```

---

## 10. 拍照与预处理（要点）

* **取景引导**：对齐边缘、光线过暗提示；批量连拍模式。
* **轻预处理**：压缩、去噪、透视矫正；控制单张上传大小（如 <1.5MB）。
* **可选模板标注**：教师端为“题区/答案区”画框，客户端带上坐标，后端可对区域做有针对的 OCR。

---

## 11. UI 组件与风格

* **设计语言**：Material 3、强调易读/对比（Correct✅/错误❌高亮）。
* **语文结果高亮**：`RichText + TextSpan` 渲染错字（红底/下划线），缺漏（灰色占位），多写（删除线）。
* **数学等价说明**：展示 2~3 个采样点验证表格，增加可解释性。

---

## 12. 多环境与配置

* `main_dev.dart / main_stg.dart / main_prod.dart` 区分 API 域名、日志级别。
* `.env`：`API_BASE_URL, WS_URL, S3_BUCKET, FEATURE_FLAGS`。
* 构建：`--dart-define-from-file=.env.prod`。

---

## 13. 权限与发布清单

* Android：`CAMERA`, `READ/WRITE_EXTERNAL_STORAGE`（按需）、`INTERNET`。
* iOS：`NSCameraUsageDescription`、`NSPhotoLibraryAddUsageDescription`。
* 应用分发：内部测试（Firebase App Distribution/TestFlight）→ 灰度 → 正式。

---

## 14. 里程碑

* **M0**：骨架搭建（目录、路由、主题、依赖注入、网络层）
* **M1**：拍照/批量上传/WS 状态订阅（闭环）
* **M2**：结果页（语文高亮/数学等价说明）+ 缓存与失败重试
* **M3**：教师端作业管理 + 题区模板标注 + 报表
* **M4**：离线判分兜底（可选）、UI 打磨、监控与埋点

---

### 附：依赖清单（示例）

```
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.0.0
  flutter_riverpod: ^3.0.0
  hooks_riverpod: ^3.0.0
  dio: ^5.7.0
  retrofit: ^4.0.0
  json_annotation: ^4.9.0
  freezed_annotation: ^2.4.0
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  camera: ^0.11.0
  image_picker: ^1.1.0
  image: ^4.2.0
  web_socket_channel: ^3.0.0
  intl: ^0.19.0
  logger: ^2.0.0

dev_dependencies:
  build_runner: ^2.4.0
  freezed: ^2.4.0
  json_serializable: ^6.8.0
  flutter_test:
    sdk: flutter
```