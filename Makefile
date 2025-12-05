# Sentinel Dashboard 构建 Makefile
# ================================

.PHONY: all clean frontend backend build dev test help

# 目录定义
ROOT_DIR := $(shell pwd)
FRONTEND_DIR := $(ROOT_DIR)/dashboard-frontend
BACKEND_DIR := $(ROOT_DIR)/sentinel-dashboard
WEBAPP_DEST := $(BACKEND_DIR)/src/main/webapp/resources

# 默认目标
all: build

# 帮助信息
help:
	@echo "Sentinel Dashboard 构建命令"
	@echo "=========================="
	@echo "  make build      - 完整构建（前端 + 后端）"
	@echo "  make frontend   - 仅构建前端"
	@echo "  make backend    - 仅构建后端 JAR"
	@echo "  make dev        - 启动前端开发服务器"
	@echo "  make test       - 运行所有测试"
	@echo "  make test-fe    - 运行前端测试"
	@echo "  make test-be    - 运行后端测试"
	@echo "  make clean      - 清理构建产物"
	@echo "  make install    - 安装前端依赖"

# 安装前端依赖
install:
	@echo "📦 安装前端依赖..."
	cd $(FRONTEND_DIR) && pnpm install

# 构建前端并复制到后端 webapp
frontend:
	@echo "🔨 构建前端..."
	cd $(FRONTEND_DIR) && pnpm build
	@echo "📋 复制到 webapp..."
	rm -rf $(WEBAPP_DEST)
	mkdir -p $(WEBAPP_DEST)
	cp -r $(FRONTEND_DIR)/dist/* $(WEBAPP_DEST)/

# 构建后端 JAR
backend:
	@echo "🔨 构建后端 JAR..."
	cd $(BACKEND_DIR) && mvn clean package -DskipTests

# 完整构建
build: frontend backend
	@echo "✅ 构建完成: $(BACKEND_DIR)/target/sentinel-dashboard.jar"

# 前端开发服务器
dev:
	@echo "🚀 启动前端开发服务器..."
	cd $(FRONTEND_DIR) && pnpm dev

# 前端测试
test-fe:
	@echo "🧪 运行前端测试..."
	cd $(FRONTEND_DIR) && pnpm test --run

# 后端测试
test-be:
	@echo "🧪 运行后端测试..."
	cd $(BACKEND_DIR) && mvn test

# 所有测试
test: test-fe test-be

# 前端类型检查
type-check:
	@echo "🔍 类型检查..."
	cd $(FRONTEND_DIR) && pnpm type-check

# 前端 lint
lint:
	@echo "🔍 Lint 检查..."
	cd $(FRONTEND_DIR) && pnpm lint

# 清理
clean:
	@echo "🧹 清理构建产物..."
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(WEBAPP_DEST)
	cd $(BACKEND_DIR) && mvn clean
