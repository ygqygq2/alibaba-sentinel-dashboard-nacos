#!/bin/bash

echo "正在触发 Token Client 向 Dashboard 注册..."
echo "访问 token-client 接口以激活 Sentinel..."

for i in {1..30}; do
    curl -s http://localhost:8082/api/hello > /dev/null && echo -n "."
    sleep 0.5
    curl -s http://localhost:8082/api/test > /dev/null && echo -n "."
    sleep 0.5
done

echo ""
echo "✓ 已发送 60 个请求"
echo ""
echo "现在打开 Dashboard 查看："
echo "  URL: http://localhost:8080"
echo "  用户名: sentinel"
echo "  密码: sentinel"
echo ""
echo "在左侧菜单找到 'sentinel-token-client' 应用"
