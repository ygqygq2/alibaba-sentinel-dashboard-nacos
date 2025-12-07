# Sentinel Dashboard 构建 Makefile
# ================================
# 所有构建和测试都通过 Docker 容器执行，无需本地安装 mvn/node 等工具

.PHONY: help build up up-build down restart restart-build logs ps clean \
        test test-api test-ui test-smoke test-all \
        fe-check fe-type fe-lint fe-test dev-fe

# 目录定义
SCRIPTS := ./scripts

# 默认目标
.DEFAULT_GOAL := help

# ========================================
# 帮助信息
# ========================================
help:
	@echo "Sentinel Dashboard 命令（全部通过 Docker 容器执行）"
	@echo "=================================================="
	@echo ""
	@echo "🐳 服务管理:"
	@echo "  make build         - 构建所有镜像（前端 + Dashboard + Token Server）"
	@echo "  make up            - 启动所有服务（不构建）"
	@echo "  make up-build      - 构建并启动所有服务"
	@echo "  make down          - 停止并删除服务"
	@echo "  make restart       - 重启服务（不构建）"
	@echo "  make restart-build - 重新构建并启动"
	@echo "  make logs          - 查看服务日志"
	@echo "  make ps            - 查看服务状态"
	@echo "  make clean         - 清理所有（包括卷和镜像）"
	@echo ""
	@echo "🧪 E2E 测试:"
	@echo "  make test       - 运行 API 测试（默认）"
	@echo "  make test-api   - 运行 API 测试"
	@echo "  make test-ui    - 运行 UI 测试（CI 模式，访问 8080）"
	@echo "  make test-smoke - 运行冒烟测试"
	@echo "  make test-all   - 运行全部测试"
	@echo ""
	@echo "🔍 前端检查:"
	@echo "  make fe-check   - 运行所有前端检查（type + lint + test）"
	@echo "  make fe-type    - 前端类型检查"
	@echo "  make fe-lint    - 前端 Lint 检查"
	@echo "  make fe-test    - 前端单元测试"
	@echo ""
	@echo "💻 本地开发:"
	@echo "  make dev-fe     - 启动前端开发服务器（需要本地 pnpm）"
	@echo ""
	@echo "环境变量:"
	@echo "  USE_CHINA_MIRROR=true  使用中国镜像加速（默认开启）"

# ========================================
# 服务管理（调用 scripts/dev.sh）
# ========================================
build:
	@$(SCRIPTS)/dev.sh build

up:
	@$(SCRIPTS)/dev.sh up

up-build:
	@$(SCRIPTS)/dev.sh up-build

down:
	@$(SCRIPTS)/dev.sh down

restart:
	@$(SCRIPTS)/dev.sh restart

restart-build:
	@$(SCRIPTS)/dev.sh restart-build

logs:
	@$(SCRIPTS)/dev.sh logs

ps:
	@$(SCRIPTS)/dev.sh ps

clean:
	@$(SCRIPTS)/dev.sh clean

# ========================================
# E2E 测试（调用 scripts/dev.sh test）
# ========================================
test: test-api

test-api:
	@$(SCRIPTS)/dev.sh test api

test-ui:
	@$(SCRIPTS)/dev.sh test ui --ci

test-smoke:
	@$(SCRIPTS)/dev.sh test smoke

test-all:
	@$(SCRIPTS)/dev.sh test all --ci

# ========================================
# 前端检查（调用 scripts/dev.sh check）
# ========================================
fe-check:
	@$(SCRIPTS)/dev.sh check all

fe-type:
	@$(SCRIPTS)/dev.sh check type

fe-lint:
	@$(SCRIPTS)/dev.sh check lint

fe-test:
	@$(SCRIPTS)/dev.sh check test

# ========================================
# 本地开发（需要本地安装 pnpm）
# ========================================
dev-fe:
	@echo "🚀 启动前端开发服务器..."
	@cd dashboard-frontend && pnpm dev
