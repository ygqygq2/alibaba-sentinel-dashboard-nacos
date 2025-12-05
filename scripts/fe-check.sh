#!/bin/bash
# 前端检查脚本 - 类型检查、lint、测试
cd "$(dirname "$0")/../dashboard-frontend" || exit 1

case "$1" in
  type)
    echo "=== 类型检查 ==="
    pnpm type-check 2>&1 | grep -E "error TS|找到 [0-9]+ 个错误" || echo "✅ 无类型错误"
    ;;
  lint)
    echo "=== Lint 检查 ==="
    pnpm lint 2>&1 | tail -5
    ;;
  test)
    echo "=== 运行测试 ==="
    pnpm test --run 2>&1 | grep -E "^( ✓| ✗| PASS| FAIL|Test Files|Tests|Duration)" 
    ;;
  all)
    $0 type && $0 lint && $0 test
    ;;
  *)
    echo "用法: $0 {type|lint|test|all}"
    ;;
esac
