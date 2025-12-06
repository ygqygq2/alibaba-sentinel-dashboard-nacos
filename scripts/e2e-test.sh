#!/bin/bash
#
# E2E 一键测试脚本
# 用法: ./scripts/e2e-test.sh [smoke|api|ui|all] [--headed] [--ci]
# 默认运行 api 测试（无头模式）
#
# 模式:
#   本地开发: UI 测试访问 localhost:3000（需要 pnpm dev）
#   CI 模式:  UI 测试访问 localhost:8080（前端已打包进 Dashboard）
#
# 示例:
#   ./scripts/e2e-test.sh api              # API 测试
#   ./scripts/e2e-test.sh ui               # UI 测试（本地，需要前端 dev server）
#   ./scripts/e2e-test.sh ui --ci          # UI 测试（CI，访问打包后的前端）
#   ./scripts/e2e-test.sh ui --headed      # UI 测试（有头模式，本地调试）
#   ./scripts/e2e-test.sh all              # 全部测试
#   ./scripts/e2e-test.sh all --ci         # 全部测试（CI 模式）
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
CI_MODE=""
for arg in "$@"; do
    [[ "$arg" == "--headed" ]] && HEADED="--headed"
    [[ "$arg" == "--ci" ]] && CI_MODE="true"
done

# CI 模式设置环境变量
if [[ -n "$CI_MODE" ]]; then
    export CI=true
fi

# 检查后端服务
check_backend() {
    log "检查后端服务..."
    curl -sf -X POST "http://localhost:8080/auth/login?username=sentinel&password=sentinel" > /dev/null 2>&1 \
        || error "Dashboard 未运行，请先: docker compose up -d"
    curl -sf "http://localhost:8081/actuator/health" > /dev/null 2>&1 \
        || error "Token Server 未运行"
    log "后端服务正常"
}

# 检查前端服务（UI 测试需要，仅本地模式）
check_frontend() {
    if [[ "$TEST_TYPE" == "ui" || "$TEST_TYPE" == "all" ]]; then
        if [[ -n "$CI_MODE" ]]; then
            log "CI 模式: UI 测试将访问 localhost:8080（打包后的前端）"
        else
            log "检查前端开发服务..."
            curl -sf "http://localhost:3000" > /dev/null 2>&1 \
                || error "前端服务未运行，请先: cd dashboard-frontend && pnpm dev\n       或使用 --ci 模式测试打包后的前端"
            log "前端服务正常"
        fi
    fi
}

# 运行测试
run_tests() {
    cd dashboard-frontend
    local mode_hint=""
    [[ -n "$CI_MODE" ]] && mode_hint="CI 模式, "
    [[ -n "$HEADED" ]] && mode_hint="${mode_hint}有头模式"
    [[ -z "$mode_hint" ]] && mode_hint="本地模式"
    
    log "运行 $TEST_TYPE 测试 ($mode_hint)..."
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
