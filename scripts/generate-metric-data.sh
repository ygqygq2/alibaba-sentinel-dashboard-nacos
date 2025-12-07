#!/bin/bash

# 持续生成监控数据脚本
# 用于持续生成 token-server 的监控数据，方便在 Dashboard 中查看实时监控图表
# 按 Ctrl+C 停止

set -e

TOKEN_SERVER_URL="http://localhost:8081"

echo "========================================"
echo "Sentinel 监控数据生成器（持续模式）"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止生成数据"
echo ""

# 检查 token-server 是否可访问
if ! curl -sf "${TOKEN_SERVER_URL}/actuator/health" > /dev/null 2>&1; then
    echo "❌ 错误: Token Server 不可访问"
    echo "请确保 Token Server 正在运行 (docker-compose up -d)"
    exit 1
fi

echo "✅ Token Server 连接正常"
echo ""

# 定义测试接口
endpoints=(
    "/api/hello"
    "/api/chain"
    "/api/flow/qps"
)

# 清理函数
cleanup() {
    echo ""
    echo "========================================"
    echo "🛑 停止生成监控数据"
    echo "========================================"
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# 单个请求函数
request_loop() {
    local endpoint=$1
    
    while true; do
        curl -sf "${TOKEN_SERVER_URL}${endpoint}" > /dev/null 2>&1
        sleep 0.1
    done
}

# 启动3个并行线程
echo "🚀 启动并行工作线程..."
echo ""

for _ in {1..3}; do
    endpoint=${endpoints[$((RANDOM % 3))]}
    request_loop "${endpoint}" &
done

echo "📊 持续生成监控数据中..."
echo ""
echo "访问监控页面："
echo "http://localhost:3000/dashboard/metric?app=sentinel-token-server"
echo ""

wait
