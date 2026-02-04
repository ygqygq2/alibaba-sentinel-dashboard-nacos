#!/bin/bash
#
# 开发环境一键脚本
# 用法: ./scripts/dev.sh [命令]
#
# 服务管理:
#   build     - 仅构建镜像
#   up        - 构建并启动服务（默认）
#   down      - 停止并删除服务
#   restart   - 重新构建并启动
#   logs      - 查看日志
#   ps        - 查看服务状态
#   clean     - 清理所有（包括卷）
#
# 前端检查:
#   check [type|lint|test|all]  - 前端检查（默认 all）
#
# E2E 测试:
#   test [smoke|api|ui|all] [--headed] [--ci]  - E2E 测试（默认 api）
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/dashboard-frontend"

cd "$PROJECT_ROOT"

# ========================================
# 环境变量配置（中国大陆使用镜像加速）
# ========================================
export USE_CHINA_MIRROR="${USE_CHINA_MIRROR:-true}"

# ========================================
# 颜色输出
# ========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ========================================
# Docker Compose 命令兼容性检测（优先使用 v2）
# ========================================
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    info "使用 Docker Compose v2"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    warn "使用旧版 docker-compose，建议升级到 v2"
else
    error "未找到 docker compose 或 docker-compose 命令"
fi

# ========================================
# 服务管理命令
# ========================================

do_build() {
    info "构建镜像 (USE_CHINA_MIRROR=${USE_CHINA_MIRROR})..."
    local log_file="/tmp/docker-build-$$.log"
    
    # 禁用 BuildKit 以避免网络超时问题
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
    
    info "Step 1/4: 构建前端镜像..."
    if ! $DOCKER_COMPOSE build frontend >> "$log_file" 2>&1; then
        error "前端构建失败，查看日志: $log_file"
        tail -50 "$log_file"
        exit 1
    fi
    
    # 确保前端镜像已存在
    if ! docker image inspect sentinel/frontend:local > /dev/null 2>&1; then
        error "前端镜像构建后仍不存在"
        exit 1
    fi
    info "✓ 前端镜像已准备: sentinel/frontend:local"
    
    info "Step 2/4: 构建 Dashboard 镜像..."
    if ! $DOCKER_COMPOSE build sentinel-dashboard >> "$log_file" 2>&1; then
        error "Dashboard 构建失败，查看日志: $log_file"
        tail -50 "$log_file"
        exit 1
    fi
    info "✓ Dashboard 镜像已准备: sentinel/dashboard:local"
    
    info "Step 3/4: 构建 Token Server 镜像..."
    if ! $DOCKER_COMPOSE build token-server >> "$log_file" 2>&1; then
        error "Token Server 构建失败，查看日志: $log_file"
        tail -50 "$log_file"
        exit 1
    fi
    info "✓ Token Server 镜像已准备: sentinel/token-server:local"
    
    info "Step 4/4: 构建 Token Client 镜像..."
    if ! $DOCKER_COMPOSE build token-client >> "$log_file" 2>&1; then
        error "Token Client 构建失败，查看日志: $log_file"
        tail -50 "$log_file"
        exit 1
    fi
    info "✓ Token Client 镜像已准备: sentinel/token-client:local"
    
    info "所有镜像构建完成"
    rm -f "$log_file"
}

do_up() {
    info "启动服务..."
    $DOCKER_COMPOSE up -d
    info "等待服务就绪..."
    sleep 5
    do_ps
    info "Dashboard: http://localhost:8080 (sentinel/sentinel)"
}

do_up_build() {
    do_build
    do_up
}

do_down() {
    info "停止服务..."
    $DOCKER_COMPOSE down
}

do_restart() {
    do_down
    do_up
}

do_restart_build() {
    do_build
    do_restart
}

do_logs() {
    local service="${1:-}"
    if [ -n "$service" ]; then
        $DOCKER_COMPOSE logs -f "$service"
    else
        $DOCKER_COMPOSE logs -f
    fi
}

do_ps() {
    $DOCKER_COMPOSE ps
}

do_clean() {
    warn "这将删除所有容器和数据卷！"
    read -p "确认继续？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $DOCKER_COMPOSE down -v --rmi local
        info "清理完成"
    else
        info "已取消"
    fi
}

# ========================================
# 前端检查命令
# ========================================

do_check() {
    local check_type="${1:-all}"
    cd "$FRONTEND_DIR" || error "前端目录不存在"
    
    case "$check_type" in
        type)
            info "类型检查..."
            pnpm type-check 2>&1 | grep -E "error TS|找到 [0-9]+ 个错误" || echo "✅ 无类型错误"
            ;;
        lint)
            info "Lint 检查..."
            pnpm lint 2>&1 | tail -5
            ;;
        test)
            info "单元测试..."
            pnpm test --run 2>&1 | grep -E "^( ✓| ✗| PASS| FAIL|Test Files|Tests|Duration)"
            ;;
        all)
            do_check type && do_check lint && do_check test
            ;;
        *)
            error "未知检查类型: $check_type (可选: type|lint|test|all)"
            ;;
    esac
}

# ========================================
# E2E 测试命令
# ========================================

do_test() {
    local test_type="${1:-api}"
    shift || true
    
    # 解析参数
    local headed=""
    local ci_mode=""
    for arg in "$@"; do
        [[ "$arg" == "--headed" ]] && headed="--headed"
        [[ "$arg" == "--ci" ]] && ci_mode="true"
    done
    
    # CI 模式设置环境变量
    [[ -n "$ci_mode" ]] && export CI=true
    
    # 检查后端服务
    info "检查后端服务..."
    curl -sf -X POST "http://localhost:8080/auth/login?username=sentinel&password=sentinel" > /dev/null 2>&1 \
        || error "Dashboard 未运行，请先: make up"
    curl -sf "http://localhost:8081/actuator/health" > /dev/null 2>&1 \
        || error "Token Server 未运行，请先: make up"
    info "后端服务正常"
    
    # 检查前端服务（UI 测试需要，仅本地模式）
    if [[ "$test_type" == "ui" || "$test_type" == "all" ]]; then
        if [[ -n "$ci_mode" ]]; then
            info "CI 模式: UI 测试将访问 localhost:8080（打包后的前端）"
        else
            info "检查前端开发服务..."
            curl -sf "http://localhost:3000" > /dev/null 2>&1 \
                || error "前端服务未运行，请先: cd dashboard-frontend && pnpm dev\n       或使用 --ci 模式测试打包后的前端"
            info "前端服务正常"
        fi
    fi
    
    # 运行测试
    cd "$FRONTEND_DIR"
    local mode_hint=""
    [[ -n "$ci_mode" ]] && mode_hint="CI 模式, "
    [[ -n "$headed" ]] && mode_hint="${mode_hint}有头模式"
    [[ -z "$mode_hint" ]] && mode_hint="本地模式"
    
    # 设置测试类型环境变量（用于配置正确的 DASHBOARD_URL）
    export TEST_TYPE="$test_type"
    
    info "运行 $test_type 测试 ($mode_hint)..."
    case "$test_type" in
        smoke) pnpm exec playwright test --project=api e2e/specs/smoke.spec.ts ;;
        api)   pnpm exec playwright test --project=api ;;
        ui)    pnpm exec playwright test --project=chromium $headed ;;
        all)   pnpm exec playwright test $headed ;;
        *)     error "未知测试类型: $test_type (可选: smoke|api|ui|all)" ;;
    esac
    info "测试报告: cd dashboard-frontend && pnpm test:e2e:report"
}

# ========================================
# 帮助信息
# ========================================

show_help() {
    echo "用法: $0 [命令] [参数]"
    echo ""
    echo "🐳 服务管理:"
    echo "  build          仅构建镜像"
    echo "  up             启动服务 (默认，不构建)"
    echo "  up-build       构建并启动服务"
    echo "  down           停止并删除服务"
    echo "  restart        重启服务（不构建）"
    echo "  restart-build  重新构建并启动"
    echo "  logs [service] 查看日志"
    echo "  ps             查看服务状态"
    echo "  clean          清理所有（包括卷和镜像）"
    echo ""
    echo "🔍 前端检查:"
    echo "  check [type|lint|test|all]  前端检查（默认 all）"
    echo ""
    echo "🧪 E2E 测试:"
    echo "  test [smoke|api|ui|all] [--headed] [--ci]"
    echo "    smoke        冒烟测试"
    echo "    api          API 测试（默认）"
    echo "    ui           UI 测试"
    echo "    all          全部测试"
    echo "    --headed     有头模式（显示浏览器）"
    echo "    --ci         CI 模式（UI 测试访问 8080）"
    echo ""
    echo "环境变量:"
    echo "  USE_CHINA_MIRROR=true  使用阿里云镜像 (默认: true)"
}

# ========================================
# 主入口
# ========================================

case "${1:-up}" in
    build)         do_build ;;
    up)            do_up ;;
    up-build)      do_up_build ;;
    down)          do_down ;;
    restart)       do_restart ;;
    restart-build) do_restart_build ;;
    logs)          do_logs "$2" ;;
    ps)            do_ps ;;
    clean)         do_clean ;;
    check)         do_check "$2" ;;
    test)          shift; do_test "$@" ;;
    help|--help|-h) show_help ;;
    *)
        error "未知命令: $1"
        show_help
        exit 1
        ;;
esac
