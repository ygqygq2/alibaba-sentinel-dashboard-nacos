#!/bin/bash
# E2E 测试脚本
# 使用方法: ./run_tests.sh [conda环境名]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Conda 环境名称，默认为 playwright
CONDA_ENV="${1:-playwright}"

echo "========================================="
echo "Sentinel Dashboard E2E 测试"
echo "========================================="

# 检查 conda 是否可用
if command -v conda &> /dev/null; then
    echo "✓ 检测到 conda"
    
    # 检查环境是否存在
    if conda env list | grep -q "^${CONDA_ENV} "; then
        echo "✓ 使用已有环境: $CONDA_ENV"
    else
        echo "→ 创建新环境: $CONDA_ENV"
        conda create -n "$CONDA_ENV" python=3.11 -y
    fi
    
    # 激活环境
    echo "→ 激活 conda 环境..."
    eval "$(conda shell.bash hook)"
    conda activate "$CONDA_ENV"
else
    echo "⚠ 未检测到 conda，使用系统 Python"
fi

# 安装依赖
echo "→ 安装 Python 依赖..."
pip install -q -r requirements.txt

# 安装 Playwright 浏览器
echo "→ 检查 Playwright 浏览器..."
if ! playwright install --dry-run chromium 2>/dev/null | grep -q "already installed"; then
    echo "→ 安装 Chromium..."
    playwright install chromium
fi

# 检查服务是否运行
echo "→ 检查服务状态..."
DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:8080}"

if ! curl -sf "$DASHBOARD_URL" > /dev/null 2>&1; then
    echo "✗ Sentinel Dashboard 未运行: $DASHBOARD_URL"
    echo ""
    echo "请先启动服务:"
    echo "  cd $(dirname "$SCRIPT_DIR") && docker-compose up -d"
    exit 1
fi
echo "✓ Dashboard 可访问: $DASHBOARD_URL"

# 运行测试
echo ""
echo "========================================="
echo "开始运行 E2E 测试..."
echo "========================================="

mkdir -p test-results

pytest -v test_dashboard.py

echo ""
echo "========================================="
echo "✓ 测试完成！"
echo "报告: $SCRIPT_DIR/test-results/report.html"
echo "========================================="
