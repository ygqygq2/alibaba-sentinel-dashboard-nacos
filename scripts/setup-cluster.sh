#!/bin/bash

# 配置集群模式脚本
# 用于在测试前配置 token-server 为 Token Server 模式
# 并模拟一些 Token Client

set -e

DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:8080}"
TOKEN_SERVER_URL="${TOKEN_SERVER_URL:-http://localhost:8081}"
APP_NAME="sentinel-token-server"

echo "========================================"
echo "Sentinel 集群模式配置"
echo "========================================"
echo ""
echo "Dashboard: $DASHBOARD_URL"
echo "Token Server: $TOKEN_SERVER_URL"
echo ""

# 登录获取 Cookie
echo "📋 登录 Dashboard..."
COOKIE_FILE=$(mktemp)
if ! curl -sf -c "$COOKIE_FILE" -X POST "$DASHBOARD_URL/auth/login?username=sentinel&password=sentinel" > /dev/null; then
    echo "❌ 登录失败"
    rm -f "$COOKIE_FILE"
    exit 1
fi
echo "✅ 登录成功"

# 等待 token-server 注册
echo ""
echo "⏳ 等待 token-server 注册..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    # 触发注册
    curl -sf "$TOKEN_SERVER_URL/api/hello" > /dev/null 2>&1 || true
    
    # 检查是否已注册
    instances=$(curl -sf -b "$COOKIE_FILE" "$DASHBOARD_URL/app/$APP_NAME/instances.json" 2>/dev/null || echo "[]")
    if echo "$instances" | grep -q "$APP_NAME"; then
        echo "✅ token-server 已注册"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ token-server 注册超时"
        rm -f "$COOKIE_FILE"
        exit 1
    fi
    sleep 2
done

# 获取实例信息
echo ""
echo "📊 获取实例信息..."
instances=$(curl -sf -b "$COOKIE_FILE" "$DASHBOARD_URL/app/$APP_NAME/instances.json")
instance_ip=$(echo "$instances" | grep -o '"ip":"[^"]*"' | head -1 | cut -d'"' -f4)
instance_port=$(echo "$instances" | grep -o '"port":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$instance_ip" ] || [ -z "$instance_port" ]; then
    echo "❌ 无法获取实例信息"
    echo "Instances: $instances"
    rm -f "$COOKIE_FILE"
    exit 1
fi

echo "✅ 实例: $instance_ip:$instance_port"

# 配置为 Token Server 模式
echo ""
echo "🔧 配置为 Token Server 模式..."
config_result=$(curl -sf -b "$COOKIE_FILE" \
    -H "Content-Type: application/json" \
    -X POST "$DASHBOARD_URL/cluster/config/modify_single" \
    -d "{\"app\":\"$APP_NAME\",\"ip\":\"$instance_ip\",\"port\":$instance_port,\"mode\":1}" 2>&1)

if echo "$config_result" | grep -q '"success":true'; then
    echo "✅ Token Server 模式配置成功"
else
    echo "⚠️  Token Server 模式配置返回: $config_result"
    # 不退出，继续尝试验证
fi

# 等待配置生效
sleep 3

# 验证集群状态
echo ""
echo "🔍 验证集群状态..."
state=$(curl -sf -b "$COOKIE_FILE" "$DASHBOARD_URL/cluster/state_all?app=$APP_NAME" 2>/dev/null || echo "[]")
echo "集群状态: $state"

if echo "$state" | grep -q '"mode":1'; then
    echo "✅ Token Server 模式已启用"
else
    echo "⚠️  未能确认 Token Server 模式（可能需要手动确认）"
fi

# 检查 Token Server 列表
echo ""
echo "📋 检查 Token Server 列表..."
servers=$(curl -sf -b "$COOKIE_FILE" "$DASHBOARD_URL/cluster/server_list?app=$APP_NAME" 2>/dev/null || echo "[]")
echo "Token Server 列表: $servers"

if echo "$servers" | grep -q "$instance_ip"; then
    echo "✅ Token Server 已在列表中"
else
    echo "⚠️  Token Server 可能还未在列表中显示"
fi

# 清理
rm -f "$COOKIE_FILE"

echo ""
echo "========================================"
echo "✅ 集群配置完成"
echo "========================================"
echo ""
echo "提示："
echo "1. Token Server: $instance_ip:$instance_port"
echo "2. 访问 $DASHBOARD_URL/dashboard/cluster/server 查看 Token Server 列表"
echo "3. Token Client 需要应用端配置后才会显示"
echo ""
