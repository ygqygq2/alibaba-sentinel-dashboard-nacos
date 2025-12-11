#!/usr/bin/env bash
#
# Sentinel Dashboard 后端 API 测试脚本
# 用途：验证后端 REST API 是否正常工作，包括规则的 CRUD 操作
# 作者：Sentinel Dashboard Team
# 用法：make test-backend-api 或 ./scripts/test-backend-api.sh
#

set -euo pipefail

# ============================================
# 配置
# ============================================
readonly BASE_URL="${SENTINEL_API_BASE_URL:-http://localhost:8080}"
readonly APP="${SENTINEL_TEST_APP:-sentinel-token-server}"
readonly USERNAME="${SENTINEL_USERNAME:-sentinel}"
readonly PASSWORD="${SENTINEL_PASSWORD:-sentinel}"
readonly COOKIE_FILE="${TMPDIR:-/tmp}/sentinel-cookies-$$.txt"

# 颜色输出
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# 计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ============================================
# 工具函数
# ============================================

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

print_success() {
    echo -e "${GREEN}✓${NC} $*"
}

print_error() {
    echo -e "${RED}✗${NC} $*"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$*${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 执行测试
run_test() {
    local test_name="$1"
    local expected="$2"
    local response="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if echo "$response" | grep -q "$expected"; then
        print_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name"
        echo "  预期: $expected"
        echo "  响应: $response" | head -c 200
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 清理函数
cleanup() {
    if [[ -f "$COOKIE_FILE" ]]; then
        rm -f "$COOKIE_FILE"
    fi
}

# 确保退出时清理
trap cleanup EXIT

# ============================================
# 主程序
# ============================================

main() {
    print_section "Sentinel Dashboard 后端 API 测试"
    print_info "API 地址: $BASE_URL"
    print_info "测试应用: $APP"
    echo ""

    # 步骤 1: 登录认证
    print_section "步骤 1: 用户认证"
    print_info "登录用户: $USERNAME"
    
    local login_response
    login_response=$(curl -s -c "$COOKIE_FILE" -X POST "${BASE_URL}/auth/login" \
        -H 'Content-Type: application/x-www-form-urlencoded' \
        -d "username=$USERNAME&password=$PASSWORD" 2>&1)
    
    if run_test "登录认证" '"code":0' "$login_response"; then
        :
    else
        print_error "认证失败，无法继续测试"
        exit 1
    fi


    # 步骤 2: 测试降级规则 API
    print_section "步骤 2: 降级规则 API"
    
    # 测试 grade=0（慢调用比例）
    print_info "测试降级规则 grade=0 (慢调用比例)"
    local response
    response=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/v2/degrade/rule" \
        -H 'Content-Type: application/json' \
        -d "{
            \"app\": \"$APP\",
            \"resource\": \"test-backend-grade-0\",
            \"grade\": 0,
            \"count\": 0,
            \"timeWindow\": 5,
            \"minRequestAmount\": 5,
            \"slowRatioThreshold\": 0.5,
            \"statIntervalMs\": 1000
        }" 2>&1)
    
    if run_test "降级规则 grade=0 (慢调用比例)" '"code":0' "$response"; then
        local rule_id
        rule_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [[ -n "$rule_id" ]]; then
            curl -s -b "$COOKIE_FILE" -X DELETE "${BASE_URL}/v2/degrade/rule/${rule_id}" > /dev/null 2>&1 || true
        fi
    fi
    
    # 测试 grade=1（异常比例）
    print_info "测试降级规则 grade=1 (异常比例)"
    response=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/v2/degrade/rule" \
        -H 'Content-Type: application/json' \
        -d "{
            \"app\": \"$APP\",
            \"resource\": \"test-backend-grade-1\",
            \"grade\": 1,
            \"count\": 0.5,
            \"timeWindow\": 5,
            \"minRequestAmount\": 5
        }" 2>&1)
    
    if run_test "降级规则 grade=1 (异常比例)" '"code":0' "$response"; then
        local rule_id
        rule_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [[ -n "$rule_id" ]]; then
            curl -s -b "$COOKIE_FILE" -X DELETE "${BASE_URL}/v2/degrade/rule/${rule_id}" > /dev/null 2>&1 || true
        fi
    fi
    
    # 测试 grade=2（异常数）
    print_info "测试降级规则 grade=2 (异常数)"
    response=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/v2/degrade/rule" \
        -H 'Content-Type: application/json' \
        -d "{
            \"app\": \"$APP\",
            \"resource\": \"test-backend-grade-2\",
            \"grade\": 2,
            \"count\": 10,
            \"timeWindow\": 5,
            \"minRequestAmount\": 5
        }" 2>&1)
    
    if run_test "降级规则 grade=2 (异常数)" '"code":0' "$response"; then
        local rule_id
        rule_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [[ -n "$rule_id" ]]; then
            curl -s -b "$COOKIE_FILE" -X DELETE "${BASE_URL}/v2/degrade/rule/${rule_id}" > /dev/null 2>&1 || true
        fi
    fi
    
    # 步骤 3: 测试热点参数规则 API
    print_section "步骤 3: 热点参数规则 API"
    print_info "测试热点参数规则"
    response=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/v2/paramFlow/rule" \
        -H 'Content-Type: application/json' \
        -d "{
            \"app\": \"$APP\",
            \"resource\": \"test-backend-param\",
            \"paramIdx\": 0,
            \"grade\": 1,
            \"count\": 10,
            \"durationInSec\": 1,
            \"controlBehavior\": 0,
            \"clusterMode\": false
        }" 2>&1)
    
    if run_test "热点参数规则创建" '"code":0' "$response"; then
        local rule_id
        rule_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [[ -n "$rule_id" ]]; then
            curl -s -b "$COOKIE_FILE" -X DELETE "${BASE_URL}/v2/paramFlow/rule/${rule_id}" > /dev/null 2>&1 || true
        fi
    fi
    
    # 步骤 4: 测试授权规则 API
    print_section "步骤 4: 授权规则 API"
    print_info "测试授权规则"
    response=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/v2/authority/rule" \
        -H 'Content-Type: application/json' \
        -d "{
            \"app\": \"$APP\",
            \"resource\": \"test-backend-authority\",
            \"limitApp\": \"test-app\",
            \"strategy\": 0
        }" 2>&1)
    
    if run_test "授权规则创建" '"code":0' "$response"; then
        local rule_id
        rule_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [[ -n "$rule_id" ]]; then
            curl -s -b "$COOKIE_FILE" -X DELETE "${BASE_URL}/v2/authority/rule/${rule_id}" > /dev/null 2>&1 || true
        fi
    fi
    
    # 测试总结
    print_section "测试总结"
    echo "总计: $TOTAL_TESTS 个测试"
    echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
    if [[ $FAILED_TESTS -gt 0 ]]; then
        echo -e "${RED}失败: $FAILED_TESTS${NC}"
        return 1
    else
        print_success "所有测试通过！"
        return 0
    fi
}

# 执行主程序
main "$@"
