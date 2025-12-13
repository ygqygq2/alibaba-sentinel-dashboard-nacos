# FAQ - 常见问题

## 一般问题

### Q: 这个项目与官方 Sentinel Dashboard 有什么区别？

**A:** 主要区别包括：

1. **前端技术栈**：采用 React 19 + TypeScript 替代 AngularJS 1.x
2. **Nacos 集成**：完整的规则持久化和动态推送
3. **集群流控增强**：更完整的 Token Server/Client 管理
4. **现代化 UI**：Chakra UI 组件库，支持暗色主题
5. **安全增强**：支持客户端 API 鉴权

### Q: 是否兼容旧版 Sentinel Dashboard？

**A:** 后端 API 保持兼容，但前端完全重写。数据迁移需注意：

- 旧版规则不会自动迁移
- 需要重新配置规则并推送到 Nacos

### Q: 支持哪些 Sentinel 版本？

**A:** 推荐使用 Sentinel 1.8.9 或更高版本。理论上向后兼容 1.8.x 系列。

---

## 部署问题

### Q: Docker Compose 启动失败怎么办？

**A:** 常见原因和解决方案：

1. **端口占用**：

   ```bash
   # 检查端口占用
   lsof -i :8080  # Dashboard
   lsof -i :8848  # Nacos
   lsof -i :8081  # Token Server

   # 修改 docker-compose.yml 中的端口映射
   ```

2. **依赖服务未就绪**：

   ```bash
   # 等待 Nacos 启动完成
   docker-compose logs nacos

   # 重启 Dashboard
   docker-compose restart dashboard
   ```

3. **镜像拉取失败**：
   ```bash
   # 使用国内镜像源
   # 编辑 /etc/docker/daemon.json
   {
     "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
   }
   ```

### Q: 如何在 Kubernetes 中部署？

**A:** 参考 [docs/05-DEPLOYMENT.md](docs/05-DEPLOYMENT.md) 中的 K8s 配置示例。关键点：

- 使用 ConfigMap 管理配置
- 使用 Secret 管理敏感信息
- 配置 Service 和 Ingress
- 确保与 Nacos 网络连通

### Q: 前后端可以分离部署吗？

**A:** 可以。前端构建产物在 `dashboard-frontend/dist/`，可以：

1. **Nginx 托管**：

   ```nginx
   location / {
     root /usr/share/nginx/html;
     try_files $uri $uri/ /index.html;
   }

   location /api/ {
     proxy_pass http://dashboard-backend:8080/;
   }
   ```

2. **CDN 部署**：上传 dist/ 到 OSS/CDN，配置 API 代理

---

## Nacos 集成问题

### Q: Nacos 连接失败怎么办？

**A:** 检查以下配置：

1. **网络连通性**：

   ```bash
   # 从 Dashboard 容器测试
   docker exec dashboard curl -f http://nacos:8848/nacos/v1/console/health/readiness
   ```

2. **配置正确性**：

   ```properties
   # application.properties
   nacos.addr=nacos:8848
   nacos.namespace=sentinel-dashboard
   nacos.username=nacos
   nacos.password=nacos
   ```

3. **命名空间存在**：确保 Nacos 中已创建对应命名空间

### Q: 规则没有推送到客户端？

**A:** 排查步骤：

1. **检查客户端配置**：

   ```properties
   # 客户端必须配置 Nacos 数据源
   spring.cloud.sentinel.datasource.flow.nacos.server-addr=nacos:8848
   spring.cloud.sentinel.datasource.flow.nacos.namespace=sentinel-dashboard
   spring.cloud.sentinel.datasource.flow.nacos.group-id=SENTINEL_GROUP
   spring.cloud.sentinel.datasource.flow.nacos.data-id=${spring.application.name}-flow-rules
   ```

2. **检查 Nacos 配置是否存在**：
   登录 Nacos 控制台查看配置列表

3. **检查客户端日志**：
   ```bash
   # 查找规则加载日志
   grep "DynamicSentinelProperty" application.log
   ```

### Q: 多个应用共享 Nacos，如何隔离？

**A:** 使用不同的 Group 或 Namespace：

```properties
# 应用 A
spring.cloud.sentinel.datasource.flow.nacos.group-id=APP_A_GROUP

# 应用 B
spring.cloud.sentinel.datasource.flow.nacos.group-id=APP_B_GROUP
```

---

## 集群流控问题

### Q: Token Server 无法启动？

**A:** 常见原因：

1. **端口冲突**：修改 `cluster.server.port`
2. **配置错误**：检查 Nacos 配置
3. **依赖缺失**：确保依赖 `sentinel-cluster-server-default`

### Q: Token Client 连接不上 Server？

**A:** 检查：

1. **网络连通性**：

   ```bash
   telnet token-server 18730
   ```

2. **客户端配置**：

   ```properties
   csp.sentinel.cluster.client.server.host=token-server
   csp.sentinel.cluster.client.server.port=18730
   ```

3. **Server 是否正常**：
   ```bash
   curl http://token-server:8081/cluster/state
   ```

### Q: 集群流控降级后如何恢复？

**A:** Sentinel 客户端会自动重连，无需手动干预。配置：

```properties
# 重连间隔（毫秒）
csp.sentinel.cluster.client.reconnect.interval=3000
```

---

## 安全问题

### Q: 如何修改默认密码？

**A:** 修改环境变量：

```yaml
# docker-compose.yml
sentinel-dashboard:
  environment:
    - SENTINEL_DASHBOARD_AUTH_USERNAME=admin
    - SENTINEL_DASHBOARD_AUTH_PASSWORD=your_secure_password
```

### Q: 客户端 API 如何防护？

**A:** **重要**：Sentinel 客户端 API（8719 端口）默认无鉴权。生产环境必须：

1. **网络隔离**（推荐）：

   - 不暴露 8719 端口到公网
   - 使用 Security Group / NetworkPolicy 限制访问

2. **防火墙规则**：

   ```bash
   iptables -A INPUT -p tcp --dport 8719 -s <dashboard-ip> -j ACCEPT
   iptables -A INPUT -p tcp --dport 8719 -j DROP
   ```

3. **VPN / 堡垒机**：通过安全通道访问

**不要依赖** `AUTH_APP_SECRET`，它仅用于 Dashboard → Client 的单向鉴权。

### Q: HTTPS 如何配置？

**A:** 推荐使用 Nginx 反向代理：

```nginx
server {
    listen 443 ssl;
    server_name dashboard.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://dashboard:8080;
    }
}
```

---

## 性能问题

### Q: Dashboard 响应慢怎么办？

**A:** 优化建议：

1. **增加内存**：

   ```yaml
   sentinel-dashboard:
     environment:
       - JAVA_OPTS=-Xmx2g -Xms2g
   ```

2. **调整连接池**：

   ```properties
   # application.properties
   spring.datasource.hikari.maximum-pool-size=20
   ```

3. **启用缓存**：Dashboard 会缓存应用列表和实例信息

### Q: 监控图表数据不准确？

**A:** 检查：

1. **时间同步**：确保服务器时钟一致
2. **采集间隔**：调整 `metric.send.interval`
3. **数据保留时间**：默认只保留 5 分钟

---

## 开发问题

### Q: 如何本地开发前端？

**A:** 参考 [docs/06-DEVELOPMENT.md](docs/06-DEVELOPMENT.md)：

```bash
cd dashboard-frontend
pnpm install
pnpm dev  # 启动开发服务器
```

### Q: 如何调试后端代码？

**A:**

1. **IDEA 远程调试**：

   ```yaml
   sentinel-dashboard:
     environment:
       - JAVA_OPTS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
     ports:
       - "5005:5005"
   ```

2. **日志级别**：
   ```properties
   logging.level.com.alibaba.csp.sentinel.dashboard=DEBUG
   ```

### Q: 如何贡献代码？

**A:** 欢迎贡献！步骤：

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/xxx`
3. 提交代码：`git commit -m 'feat: add xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

---

## 故障排查

### Q: 应用列表为空？

**A:** 检查：

1. 客户端是否连接 Dashboard：

   ```properties
   csp.sentinel.dashboard.server=dashboard:8080
   ```

2. 心跳是否正常：
   ```bash
   # Dashboard 日志
   grep "Receive heartbeat" /var/log/sentinel/sentinel.log
   ```

### Q: 规则保存后立即丢失？

**A:** 确认 Nacos 持久化已配置：

```properties
# Dashboard 必须配置
sentinel.datasource.flow.nacos.server-addr=nacos:8848
```

### Q: 如何查看详细日志？

**A:**

1. **Dashboard 日志**：

   ```bash
   docker-compose logs -f dashboard
   ```

2. **Nacos 日志**：

   ```bash
   docker-compose logs -f nacos
   ```

3. **客户端日志**：
   ```bash
   # 应用日志目录
   ${user.home}/logs/csp/
   ```

---

## 更多帮助

- **官方文档**：https://sentinelguard.io/zh-cn/docs/introduction.html
- **GitHub Issues**：https://github.com/ygqygq2/alibaba-sentinel-dashboard-nacos/issues
- **故障排查指南**：[docs/08-TROUBLESHOOTING.md](docs/08-TROUBLESHOOTING.md)
