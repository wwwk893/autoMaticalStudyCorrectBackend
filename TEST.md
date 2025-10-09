# 验收与测试清单

> 以下为 v1 契约与可靠性需求的验收要点，CI 中的 Jest、Supertest 与 Schemathesis 用例需覆盖对应场景。

## 1. OpenAPI 契约
- [ ] `openapi/v1/openapi.yaml` 可被前端脚本拉取并生成 SDK
- [ ] WebSocket 事件枚举与 REST Schema 与实现保持一致

## 2. 统一错误模型
- [ ] 任意 4xx/5xx 响应均符合 `{ code, message, traceId }`
- [ ] traceId 支持透传 `X-Trace-Id`，未提供时自动生成

## 3. 鉴权与会话
- [ ] 教师与机构账号按照租户隔离，审计字段 `createdBy/updatedBy` 完整
- [ ] `POST /auth/weapp/login`：
  - [ ] 首次绑定创建租户内会话
  - [ ] 重复绑定（同教师）返回既有会话
  - [ ] 冲突绑定（不同教师）返回 `AUTH_WEAPP_ALREADY_BOUND`

## 4. 上传策略
- [ ] 预签名上传返回带 TTL 的直传 URL
- [ ] Content-Type/大小/页数超限返回统一错误
- [ ] 回调验签需包含签名与时间戳，超时拒绝

## 5. 队列可靠性
- [ ] submissionId 去重，重复提交不会重复入队
- [ ] 失败任务指数退避，超过阈值进入 DLQ 并触发告警
- [ ] 阶段耗时指标（queued/ocr/parsed/graded/reported）可在监控面板查看 P50/P95

## 6. 评分策略
- [ ] `ChineseShortAnswer`、`EnglishFillBlank`、`MathExpr` 策略遵循 `IScoringStrategy`
- [ ] 输出 `{ score, why[], normalizedAnswer }`
- [ ] 英文大小写/标点策略可配置，数学等价可接入 SymPy

## 7. 导入导出
- [ ] 班级花名册支持 CSV/Excel 导入
- [ ] 成绩单/讲评稿导出包含错因 TopN、知识点雷达、分数分布

## 8. 合规与安全
- [ ] 内容安全扫描命中策略立即拒绝，日志脱敏且不含原文
- [ ] 审计表、软删除、数据保留策略可追踪
- [ ] 教师/机构维度限流命中时返回标准错误码

## 9. 可观测性
- [ ] OpenTelemetry Trace + Prometheus Metrics 完整接入
- [ ] Grafana 仪表盘提供 P95 总耗时 < 10s、失败率 <1% 告警

## 10. 实时通道
- [ ] WebSocket 事件推送与轮询接口一致
- [ ] 小程序/Flutter 任一客户端可获取进度

## 11. SLO 与灰度
- [ ] SLO 配置记录评分完成 P95 < 10s
- [ ] 灰度发布脚本支持教师 ID 哈希 10%→30%→100% 以及一键回滚
- [ ] 灰度演练记录在案
