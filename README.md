# 自动批作业平台后端

本仓库提供 NestJS 单体（API + Worker）在本地的一键化体验环境，覆盖鉴权、上传、判分、报表等核心模块的脚手架。请先阅读 `.env.example` 并复制为 `.env` 后再执行以下步骤。

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```
2. **准备环境变量**
   ```bash
   cp .env.example .env
   ```
3. **启动依赖服务**（PostgreSQL、Redis、MinIO、OpenTelemetry Collector、Grafana）
   ```bash
   make up
   ```
4. **填充示例数据**（教师/机构/班级/作业种子）
   ```bash
   make seed
   ```
5. **运行 API 网关与 Worker**
   ```bash
   npm run start:api
   npm run start:worker
   ```

> 如需停止并清理依赖容器，执行 `make down`。

## 目录结构

```
apps/           Nest 应用（api, worker）
packages/       共享 DTO、策略与监控能力
src/            全局过滤器、日志、策略实现
openapi/        OpenAPI v1 契约与事件枚举
scripts/        数据种子与灰度发布脚本
``` 

## 本地工具链

- **Prometheus** 暴露在 http://localhost:9090
- **Grafana** 默认账号 `admin/admin`，仪表盘位于 `Provisioned Dashboards/AutoMark`
- **OpenAPI 契约**：`openapi/v1/openapi.yaml`
- **Schemathesis**：使用 `make contract-test` 执行 REST/WS 契约回归

## 测试与质量

```bash
npm run lint              # 代码规范
npm run test              # Jest 单测
npm run test:e2e          # Supertest + Prisma SQLite
make contract-test        # Schemathesis 合同测试
```

> CI 将在合并前执行上述指令，全部通过方可发布。

## 部署

- **docker-compose** 适用于本地 PoC
- **scripts/deploy** 提供灰度（10%→30%→100%）与快速回滚脚本
- **环境变量** 详见 `.env.example`，包含对象存储、消息队列、内容安全策略等配置

更多深入文档请参阅 `TODO.md` 中的架构说明与规划。
