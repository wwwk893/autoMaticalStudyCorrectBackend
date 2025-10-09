#!/usr/bin/env bash
set -euo pipefail
IMAGE=${1:?"Usage: rollback.sh <image>"}
echo "Rolling back to ${IMAGE}..."
# Placeholder for kubectl rollout undo
