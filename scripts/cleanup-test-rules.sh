#!/bin/bash
#===============================================================================
# 测试数据清理脚本
# 功能：删除所有测试相关的规则（流控、降级、参数、系统、授权）
# 用法：./scripts/cleanup-test-rules.sh [DASHBOARD_URL] [APP_NAME]
#===============================================================================

set -e

# 配置
DASHBOARD_URL="${1:-http://localhost:8080}"
APP="${2:-${APP:-sentinel-token-server}}"
USERNAME="${SENTINEL_USERNAME:-sentinel}"
PASSWORD="${SENTINEL_PASSWORD:-sentinel}"

echo "📋 开始清理测试数据..."
echo "Dashboard: $DASHBOARD_URL"
echo "应用名称: $APP"
echo

# 登录并获取 Cookie
echo "🔐 登录 Dashboard..."
COOKIE=$(curl -s -c - -X POST "${DASHBOARD_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${USERNAME}&password=${PASSWORD}" \
  | grep -oP 'sentinel_dashboard_cookie\s+\K\S+' || echo "")

if [ -z "$COOKIE" ]; then
  echo "❌ 登录失败！请检查用户名密码是否正确"
  exit 1
fi

echo "✅ 登录成功"
echo

# 测试数据匹配模式
TEST_PATTERNS=(
  "/api/test"
  "/e2e"
  "test-"
  "-test-"
  "/api/degrade/slow"
  "/api/degrade/error"
  "/api/degrade/exception"
  "/api/flow/"
  "/api/protected"
  "/api/param"
  "hotspot"
)

# 函数：检查资源名是否匹配测试模式
is_test_resource() {
  local resource="$1"
  for pattern in "${TEST_PATTERNS[@]}"; do
    if [[ "$resource" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}


# 1. 清理流控规则
echo "🧹 清理流控规则..."
FLOW_RULES=$(curl -s -X GET "${DASHBOARD_URL}/v2/flow/rules?app=${APP}" \
  -b "sentinel_dashboard_cookie=${COOKIE}")

FLOW_COUNT=0
if [ "$FLOW_RULES" != "null" ] && [ -n "$FLOW_RULES" ]; then
  FLOW_IDS=$(echo "$FLOW_RULES" | jq -r '.data[]? | "\(.id)|\(.resource)"' 2>/dev/null)
  while IFS='|' read -r id resource; do
    if is_test_resource "$resource"; then
      echo "  删除流控规则: $resource (ID: $id)"
      curl -s -X DELETE "${DASHBOARD_URL}/v2/flow/rule/${id}?app=${APP}" \
        -b "sentinel_dashboard_cookie=${COOKIE}" > /dev/null
      FLOW_COUNT=$((FLOW_COUNT + 1))
    fi
  done <<< "$FLOW_IDS"
fi
echo "✅ 清理了 $FLOW_COUNT 条流控规则"

# 2. 清理降级规则
echo "🧹 清理降级规则..."
DEGRADE_RULES=$(curl -s -X GET "${DASHBOARD_URL}/v2/degrade/rules?app=${APP}" \
  -b "sentinel_dashboard_cookie=${COOKIE}")

DEGRADE_COUNT=0
if [ "$DEGRADE_RULES" != "null" ] && [ -n "$DEGRADE_RULES" ]; then
  DEGRADE_IDS=$(echo "$DEGRADE_RULES" | jq -r '.data[]? | "\(.id)|\(.resource)"' 2>/dev/null)
  while IFS='|' read -r id resource; do
    if is_test_resource "$resource"; then
      echo "  删除降级规则: $resource (ID: $id)"
      curl -s -X DELETE "${DASHBOARD_URL}/v2/degrade/rule/${id}?app=${APP}" \
        -b "sentinel_dashboard_cookie=${COOKIE}" > /dev/null
      DEGRADE_COUNT=$((DEGRADE_COUNT + 1))
    fi
  done <<< "$DEGRADE_IDS"
fi
echo "✅ 清理了 $DEGRADE_COUNT 条降级规则"

# 3. 清理热点参数规则
echo "🧹 清理热点参数规则..."
PARAM_RULES=$(curl -s -X GET "${DASHBOARD_URL}/paramFlow/rules?app=${APP}" \
  -b "sentinel_dashboard_cookie=${COOKIE}")

PARAM_COUNT=0
if [ "$PARAM_RULES" != "null" ] && [ -n "$PARAM_RULES" ]; then
  PARAM_IDS=$(echo "$PARAM_RULES" | jq -r '.data[]? | "\(.id)|\(.resource)"' 2>/dev/null)
  while IFS='|' read -r id resource; do
    if is_test_resource "$resource"; then
      echo "  删除热点参数规则: $resource (ID: $id)"
      curl -s -X DELETE "${DASHBOARD_URL}/paramFlow/rule/${id}?app=${APP}" \
        -b "sentinel_dashboard_cookie=${COOKIE}" > /dev/null
      PARAM_COUNT=$((PARAM_COUNT + 1))
    fi
  done <<< "$PARAM_IDS"
fi
echo "✅ 清理了 $PARAM_COUNT 条热点参数规则"

# 4. 清理系统规则
echo "🧹 清理系统规则..."
SYSTEM_RULES=$(curl -s -X GET "${DASHBOARD_URL}/v1/system/rules.json?app=${APP}" \
  -b "sentinel_dashboard_cookie=${COOKIE}")

SYSTEM_COUNT=0
if [ "$SYSTEM_RULES" != "null" ] && [ -n "$SYSTEM_RULES" ]; then
  SYSTEM_IDS=$(echo "$SYSTEM_RULES" | jq -r '.data[]?.id' 2>/dev/null)
  while read -r id; do
    if [ -n "$id" ]; then
      echo "  删除系统规则 (ID: $id)"
      curl -s -X DELETE "${DASHBOARD_URL}/v2/system/rule/${id}?app=${APP}" \
        -b "sentinel_dashboard_cookie=${COOKIE}" > /dev/null
      SYSTEM_COUNT=$((SYSTEM_COUNT + 1))
    fi
  done <<< "$SYSTEM_IDS"
fi
echo "✅ 清理了 $SYSTEM_COUNT 条系统规则"

# 5. 清理授权规则
echo "🧹 清理授权规则..."
AUTHORITY_RULES=$(curl -s -X GET "${DASHBOARD_URL}/v2/authority/rules?app=${APP}" \
  -b "sentinel_dashboard_cookie=${COOKIE}")

AUTH_COUNT=0
if [ "$AUTHORITY_RULES" != "null" ] && [ -n "$AUTHORITY_RULES" ]; then
  AUTH_IDS=$(echo "$AUTHORITY_RULES" | jq -r '.data[]? | "\(.id)|\(.resource)"' 2>/dev/null)
  while IFS='|' read -r id resource; do
    if is_test_resource "$resource"; then
      echo "  删除授权规则: $resource (ID: $id)"
      curl -s -X DELETE "${DASHBOARD_URL}/v2/authority/rule/${id}?app=${APP}" \
        -b "sentinel_dashboard_cookie=${COOKIE}" > /dev/null
      AUTH_COUNT=$((AUTH_COUNT + 1))
    fi
  done <<< "$AUTH_IDS"
fi
echo "✅ 清理了 $AUTH_COUNT 条授权规则"

echo
echo "🎉 清理完成！总共删除:"
echo "   - 流控规则: $FLOW_COUNT 条"
echo "   - 降级规则: $DEGRADE_COUNT 条"
echo "   - 热点参数: $PARAM_COUNT 条"
echo "   - 系统规则: $SYSTEM_COUNT 条"
echo "   - 授权规则: $AUTH_COUNT 条"
echo "   合计: $((FLOW_COUNT + DEGRADE_COUNT + PARAM_COUNT + SYSTEM_COUNT + AUTH_COUNT)) 条"
