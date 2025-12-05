#!/bin/bash
# 快速检查脚本 - 减少输出

cd "$(dirname "$0")/.."

echo "=== 类型检查 ==="
pnpm type-check 2>&1 | grep -E "error TS|Found [0-9]+ error" || echo "✅ 类型检查通过"

echo ""
echo "=== 运行测试 ==="
pnpm test --run 2>&1 | tail -5

echo ""
echo "=== Lint 检查 ==="
pnpm lint 2>&1 | grep -E "error|warning|problem" | head -5 || echo "✅ Lint 检查通过"
