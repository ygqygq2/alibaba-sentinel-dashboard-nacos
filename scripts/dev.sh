#!/bin/bash
#
# 开发环境一键启动脚本
# 用法: ./scripts/dev.sh [命令]
#   命令:
#     build   - 仅构建镜像
#     up      - 构建并启动服务
#     down    - 停止并删除服务
#     restart - 重新构建并启动
#     logs    - 查看日志
#     ps      - 查看服务状态
#     clean   - 清理所有（包括卷）
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ========================================
# 命令函数
# ========================================

do_build() {
    info "构建镜像 (USE_CHINA_MIRROR=${USE_CHINA_MIRROR})，请稍候..."
    local log_file="/tmp/docker-build-$$.log"
    if docker-compose build --build-arg USE_CHINA_MIRROR="${USE_CHINA_MIRROR}" > "$log_file" 2>&1; then
        info "构建完成"
        rm -f "$log_file"
    else
        error "构建失败，查看日志: $log_file"
        tail -50 "$log_file"
        exit 1
    fi
}

do_up() {
    do_build
    info "启动服务..."
    docker-compose up -d --quiet-pull 2>/dev/null
    info "等待服务就绪..."
    sleep 5
    do_ps
    info "Dashboard: http://localhost:8080 (sentinel/sentinel)"
}

do_down() {
    info "停止服务..."
    docker-compose down -q 2>/dev/null || docker-compose down
}

do_restart() {
    do_down
    do_up
}

do_logs() {
    local service="${1:-}"
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

do_ps() {
    docker-compose ps
}

do_clean() {
    warn "这将删除所有容器和数据卷！"
    read -p "确认继续？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi local
        info "清理完成"
    else
        info "已取消"
    fi
}

do_test() {
    info "运行 E2E 测试..."
    "$SCRIPT_DIR/e2e-test.sh"
}

show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  build     仅构建镜像"
    echo "  up        构建并启动服务 (默认)"
    echo "  down      停止并删除服务"
    echo "  restart   重新构建并启动"
    echo "  logs      查看日志 (可选: logs <service>)"
    echo "  ps        查看服务状态"
    echo "  clean     清理所有（包括卷和镜像）"
    echo "  test      运行 E2E 测试"
    echo "  help      显示帮助"
    echo ""
    echo "环境变量:"
    echo "  USE_CHINA_MIRROR=true  使用阿里云 Maven 镜像 (默认: true)"
}

# ========================================
# 主入口
# ========================================

case "${1:-up}" in
    build)
        do_build
        ;;
    up)
        do_up
        ;;
    down)
        do_down
        ;;
    restart)
        do_restart
        ;;
    logs)
        do_logs "$2"
        ;;
    ps)
        do_ps
        ;;
    clean)
        do_clean
        ;;
    test)
        do_test
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "未知命令: $1"
        show_help
        exit 1
        ;;
esac
