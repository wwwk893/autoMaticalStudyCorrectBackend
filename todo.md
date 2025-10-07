# 自动批作业后端 TODO

## ✅ 已完成
- [x] 初始化 NestJS 多包结构（apps/api、apps/worker、packages/common）并配置 TypeScript/ESLint/Prettier。
- [x] 搭建 API 网关骨架：健康检查、提交接口、Swagger/OpenAPI、全局验证。
- [x] 建立 BullMQ 队列与 Worker 进程示例处理链路，演示 OCR→Parse→Grade→Report 流程。
- [x] 提供示例 DTO（CreateSubmissionDto、SubmissionStatusDto 等）供 API 与 Worker 复用。

## ⏭️ 待完成
- [ ] 接入真实的数据存储（PostgreSQL Prisma/TypeORM、Redis cache）并实现持久化状态。
- [ ] 补充业务模块（Auth、Org/Class、Assignment、Media 等）与领域模型。
- [ ] 实现 WebSocket 推送与队列事件回填，完善状态流转。
- [ ] 引入可观测性组件（logging、metrics、tracing）及配置。
- [ ] 编写单元/集成测试与 CI/CD 流水线脚本。
- [ ] 补充基础设施脚本（Dockerfile、Helm chart、环境变量模板）。
