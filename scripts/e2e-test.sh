#!/bin/bash
#
# E2E 一键测试脚本
# 用法: ./scripts/e2e-test.sh [smoke|api|ui|all] [--headed]
# 默认运行 api 测试（无头模式）
#
# 示例:
#   ./scripts/e2e-test.sh api          # API 测试（无头）
#   ./scripts/e2e-test.sh ui           # UI 测试（无头，CI 用）
#   ./scripts/e2e-test.sh ui --headed  # UI 测试（有头，本地调试）
#   ./scripts/e2e-test.sh all          # 全部测试
#

set -e

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 解析参数
TEST_TYPE=${1:-api}
HEADED=""
for arg in "$@"; do
    [[ "$arg" == "--headed" ]] && HEADED="--headed"
done

# 检查后端服务
check_backend() {
    log "检查后端服务..."
    curl -sf -X POST "http://localhost:8080/auth/login?username=sentinel&password=sentinel" > /dev/null 2>&1 \
        || error "Dashboard 未运行，请先: docker compose up -d"
    curl -sf "http://localhost:8081/actuator/health" > /dev/null 2>&1 \
        || error "Token Server 未运行"
    log "后端服务正常"
}

# 检查前端服务（UI 测试需要）
check_frontend() {
    if [[ "$TEST_TYPE" == "ui" || "$TEST_TYPE" == "all" ]]; then
        log "检查前端服务..."
        curl -sf "http://localhost:3000" > /dev/null 2>&1 \
            || error "前端服务未运行，请先: cd dashboard-frontend && pnpm dev"
        log "前端服务正常"
    fi
}

# 运行测试
run_tests() {
    cd dashboard-frontend
    log "运行 $TEST_TYPE 测试 ${HEADED:+(有头模式)}..."
    case $TEST_TYPE in
        smoke) pnpm exec playwright test --project=api --grep smoke ;;
        api)   pnpm exec playwright test --project=api ;;
        ui)    pnpm exec playwright test --project=chromium $HEADED ;;
        all)   pnpm exec playwright test $HEADED ;;
        *)     error "未知类型: $TEST_TYPE (可选: smoke|api|ui|all)" ;;
    esac
    log "测试报告: cd dashboard-frontend && pnpm test:e2e:report"
}

check_backend
check_frontend
run_tests
