#!/bin/bash
#
# E2E 一键测试脚本
# 用法: ./scripts/e2e-test.sh [smoke|api|ui|all]
# 默认运行 api 测试
#

set -e

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

TEST_TYPE=${1:-api}

# 检查服务
check_services() {
    log "检查服务状态..."
    curl -sf -X POST "http://localhost:8080/auth/login?username=sentinel&password=sentinel" > /dev/null 2>&1 \
        || error "Dashboard 未运行，请先: docker compose up -d"
    curl -sf "http://localhost:8081/actuator/health" > /dev/null 2>&1 \
        || error "Token Server 未运行"
    log "服务正常"
}

# 运行测试
run_tests() {
    cd dashboard-frontend
    log "运行 $TEST_TYPE 测试..."
    case $TEST_TYPE in
        smoke) pnpm exec playwright test smoke --project=api ;;
        api)   pnpm exec playwright test --project=api ;;
        ui)    pnpm exec playwright test --project=chromium ;;
        all)   pnpm exec playwright test ;;
        *)     error "未知类型: $TEST_TYPE (可选: smoke|api|ui|all)" ;;
    esac
}

check_services
run_tests
