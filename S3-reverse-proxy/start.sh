#!/usr/bin/env bash
set -euo pipefail
: "${S3_BASE_URL:?Need S3_BASE_URL}"   
export PORT=${PORT:-8000}
node index.js
