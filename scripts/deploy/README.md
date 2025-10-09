# 灰度发布与回滚流程

1. **生成候选发布包**：
   ```bash
   npm run build
   docker build -t automark-api:candidate -f Dockerfile.api .
   ```
2. **按教师 ID 哈希流量**：
   ```bash
   ./scripts/deploy/hash-rollout.sh 0.1  # 10%
   ./scripts/deploy/hash-rollout.sh 0.3  # 30%
   ./scripts/deploy/hash-rollout.sh 1    # 100%
   ```
3. **监控 SLO**：Grafana 仪表盘 `AutoMark Pipeline`，若 P95 > 10s 或失败率 > 1% 触发告警。
4. **快速回滚**：
   ```bash
   ./scripts/deploy/rollback.sh automark-api:previous
   ```
5. **演练记录**：在 `docs/playbooks/rollout.md` 中记录时间、参与人、结果。
