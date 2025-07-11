#!/usr/bin/env bash
set -euo pipefail
: "${GIT_REPO_URL:?Need to set GIT_REPO_URL}"
: "${PROJECT_ID:?Need to set PROJECT_ID}"
: "${REDIS_URL:?Need to set REDIS_URL}"
: "${S3_BUCKET:?Need to set S3_BUCKET}"
: "${AWS_REGION:?Need to set AWS_REGION}"
: "${AWS_ACCESS_KEY_ID:?Need to set AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?Need to set AWS_SECRET_ACCESS_KEY}"
git clone --depth 1 "$GIT_REPO_URL" /home/app/output
cd /home/app/output
exec node /home/app/cli.js deploy
