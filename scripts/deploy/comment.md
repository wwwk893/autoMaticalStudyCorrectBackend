# Deployment Scripts

Automation helpers for progressive rollouts and emergency rollback workflows.

## Files
- **`README.md`**
  - Documents rollout prerequisites, hash-based canary strategy (10% → 30% → 100%), and rollback procedures.
- **`hash-rollout.sh`**
  - Shell script that maps teacher IDs to rollout buckets using consistent hashing, gradually increasing traffic allocation.
- **`rollback.sh`**
  - Provides a single command to revert deployments to the previous stable release and notify on-call engineers.

## Usage
- Execute `hash-rollout.sh <env>` to begin staged rollout; monitor Grafana SLO dashboards during each increment.
- Trigger `rollback.sh` if SLOs degrade beyond thresholds; script restores prior artifacts and records the action in audit logs.
