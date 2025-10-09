#!/usr/bin/env bash
set -euo pipefail
PERCENT=${1:-0.1}
SALT=${ROLLING_HASH_SALT:-local-salt}
cat <<DOC
# 灰度规则
- 使用教师 ID + SALT=${SALT}
- 计算 sha256 哈希并转为 [0,1)
- 当值 < ${PERCENT} 时命中灰度
DOC
