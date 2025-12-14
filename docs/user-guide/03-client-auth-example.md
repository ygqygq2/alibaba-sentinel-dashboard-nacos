# 客户端连接 Dashboard 鉴权示例

本文档提供完整的示例说明如何配置客户端连接 Dashboard 的鉴权。

## 场景说明

当 Dashboard 启用了客户端鉴权（设置了 `AUTH_APP_SECRET`），客户端应用在连接 Dashboard 时必须提供相同的密钥。这可以防止未授权的应用连接到 Dashboard。

## 完整配置示例

### 1. Dashboard 端配置

#### Docker Compose 方式

```yaml
# docker-compose.yml
services:
  sentinel-dashboard:
    image: sentinel/dashboard:local
    environment:
      # 启用客户端鉴权
      - AUTH_ENABLED=true
      - AUTH_APP_SECRET=my_secure_secret_2024

      # Web UI 登录配置
      - SENTINEL_DASHBOARD_AUTH_USERNAME=admin
      - SENTINEL_DASHBOARD_AUTH_PASSWORD=admin_password

      # Nacos 配置
      - NACOS_SERVER_ADDR=nacos:8848
      - NACOS_NAMESPACE=public
      - NACOS_GROUP=SENTINEL_GROUP
    ports:
      - "8080:8080"
```

#### 环境变量方式

```bash
# .env
AUTH_ENABLED=true
AUTH_APP_SECRET=my_secure_secret_2024
SENTINEL_DASHBOARD_AUTH_USERNAME=admin
SENTINEL_DASHBOARD_AUTH_PASSWORD=admin_password
```

### 2. 客户端配置

#### Spring Boot 应用

**方法 1：JVM 参数（推荐）**

```bash
java -jar \
  -Dcsp.sentinel.dashboard.server=localhost:8080 \
  -Dcsp.sentinel.app.secret=my_secure_secret_2024 \
  your-app.jar
```

**方法 2：application.yml**

```yaml
# application.yml
spring:
  application:
    name: my-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
# 通过 JVM 参数传递密钥
# -Dcsp.sentinel.app.secret=my_secure_secret_2024
```

**方法 3：环境变量**

```bash
export CSP_SENTINEL_APP_SECRET=my_secure_secret_2024
java -jar your-app.jar
```

**方法 4：Dockerfile**

```dockerfile
FROM openjdk:17-slim

COPY target/my-app.jar /app.jar

# 方式 1: 环境变量
ENV CSP_SENTINEL_APP_SECRET=my_secure_secret_2024

# 或方式 2: JVM 参数
ENTRYPOINT ["java", \
            "-Dcsp.sentinel.app.secret=my_secure_secret_2024", \
            "-Dcsp.sentinel.dashboard.server=sentinel-dashboard:8080", \
            "-jar", "/app.jar"]
```

**方法 5：docker-compose.yml**

```yaml
services:
  my-service:
    image: my-service:latest
    environment:
      # Sentinel 配置
      - SPRING_APPLICATION_NAME=my-service
      - SPRING_CLOUD_SENTINEL_TRANSPORT_DASHBOARD=sentinel-dashboard:8080
      - CSP_SENTINEL_APP_SECRET=my_secure_secret_2024

      # Nacos 配置
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_SERVER-ADDR=nacos:8848
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_NAMESPACE=public
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_GROUPID=SENTINEL_GROUP
```

## 验证配置

### 1. 启动 Dashboard

```bash
docker-compose up -d sentinel-dashboard

# 查看启动日志
docker-compose logs sentinel-dashboard | grep "Client Auth"

# 应该看到：
# Client Auth: Enabled (app_secret required)
```

### 2. 启动客户端应用

```bash
# 使用 JVM 参数
java -jar \
  -Dcsp.sentinel.dashboard.server=localhost:8080 \
  -Dcsp.sentinel.app.secret=my_secure_secret_2024 \
  your-app.jar

# 或使用环境变量
export CSP_SENTINEL_APP_SECRET=my_secure_secret_2024
java -jar your-app.jar
```

### 3. 验证连接成功

#### 方法 1：查看 Dashboard 日志

```bash
# 成功连接
docker-compose logs sentinel-dashboard | grep "authenticated successfully"
# 输出：[Auth] Client 172.18.0.5 authenticated successfully for app: my-service

# 连接失败
docker-compose logs sentinel-dashboard | grep "invalid app_secret"
# 输出：[Auth] Client 172.18.0.5 provided invalid app_secret for app: my-service
```

#### 方法 2：查看 Dashboard UI

1. 访问 http://localhost:8080
2. 登录（用户名/密码：admin/admin_password）
3. 查看左侧菜单「应用列表」
4. 应该能看到 `my-service` 应用

#### 方法 3：查看客户端日志

```bash
# 客户端日志应该显示心跳成功
tail -f logs/my-service.log | grep "heartbeat"
```

## 故障排查

### 问题 1：客户端连接失败

**症状**：Dashboard 应用列表中看不到客户端应用

**排查**：

```bash
# 1. 检查 Dashboard 是否启用鉴权
docker exec sentinel-dashboard env | grep AUTH_APP_SECRET

# 2. 查看 Dashboard 日志
docker-compose logs sentinel-dashboard | tail -50

# 3. 检查客户端配置
ps aux | grep java | grep csp.sentinel.app.secret
```

**常见错误**：

```
# Dashboard 日志
[Auth] Client 172.18.0.5 attempted to connect without app_secret
→ 客户端未提供密钥

[Auth] Client 172.18.0.5 provided invalid app_secret for app: my-service
→ 客户端提供的密钥不正确
```

**解决方案**：

```bash
# 确保密钥一致
# Dashboard
AUTH_APP_SECRET=my_secure_secret_2024

# 客户端
-Dcsp.sentinel.app.secret=my_secure_secret_2024
```

### 问题 2：密钥不一致

**症状**：Dashboard 日志显示 "invalid app_secret"

**解决方案**：

```bash
# 方法 1：查看 Dashboard 配置的密钥
docker exec sentinel-dashboard env | grep AUTH_APP_SECRET
# 输出：AUTH_APP_SECRET=my_secure_secret_2024

# 方法 2：查看客户端配置
jinfo <pid> | grep csp.sentinel.app.secret
# 输出：-Dcsp.sentinel.app.secret=wrong_secret

# 修正客户端配置
java -jar -Dcsp.sentinel.app.secret=my_secure_secret_2024 your-app.jar
```

### 问题 3：忘记了配置的密钥

**解决方案**：

```bash
# 查看 Dashboard 环境变量
docker exec sentinel-dashboard env | grep AUTH_APP_SECRET

# 或查看 docker-compose.yml
grep AUTH_APP_SECRET docker-compose.yml

# 或查看 .env 文件
cat .env | grep AUTH_APP_SECRET
```

## 安全建议

### 1. 密钥管理

**❌ 不推荐**：在代码中硬编码密钥

```java
// 不要这样做！
System.setProperty("csp.sentinel.app.secret", "hardcoded_secret");
```

**✅ 推荐**：使用环境变量或配置中心

```bash
# 使用环境变量
export CSP_SENTINEL_APP_SECRET=$(cat /run/secrets/sentinel_secret)

# 或使用 Kubernetes Secret
kubectl create secret generic sentinel-secret \
  --from-literal=app-secret=my_secure_secret_2024
```

### 2. 密钥强度

**❌ 弱密钥**：

- `123456`
- `secret`
- `password`

**✅ 强密钥**：

- `S3nt!n3l_D@shb0@rd_2024_Pr0d`
- 随机生成：`openssl rand -base64 32`

### 3. 环境隔离

**推荐配置**：

```bash
# 开发环境 - 可以禁用或使用简单密钥
AUTH_ENABLED=false
AUTH_APP_SECRET=

# 测试环境 - 使用测试密钥
AUTH_ENABLED=true
AUTH_APP_SECRET=test_secret_2024

# 生产环境 - 使用强密钥
AUTH_ENABLED=true
AUTH_APP_SECRET=$(vault read -field=value secret/sentinel/app-secret)
```

### 4. 密钥轮换

定期更换密钥：

```bash
# 1. 生成新密钥
NEW_SECRET=$(openssl rand -base64 32)

# 2. 更新 Dashboard
docker-compose stop sentinel-dashboard
# 修改 docker-compose.yml 或 .env
# AUTH_APP_SECRET=${NEW_SECRET}
docker-compose up -d sentinel-dashboard

# 3. 逐个更新客户端应用
# 滚动更新，避免服务中断
```

## 完整示例项目

### 目录结构

```
my-project/
├── docker-compose.yml
├── .env
├── sentinel-dashboard/
└── my-service/
    ├── Dockerfile
    ├── src/
    └── pom.xml
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  nacos:
    image: nacos/nacos-server:v2.4.3
    environment:
      - MODE=standalone
      - NACOS_AUTH_ENABLE=true
    ports:
      - "8848:8848"

  sentinel-dashboard:
    image: sentinel/dashboard:local
    depends_on:
      - nacos
    environment:
      - AUTH_ENABLED=true
      - AUTH_APP_SECRET=${AUTH_APP_SECRET}
      - SENTINEL_DASHBOARD_AUTH_USERNAME=admin
      - SENTINEL_DASHBOARD_AUTH_PASSWORD=admin_password
      - NACOS_SERVER_ADDR=nacos:8848
      - NACOS_NAMESPACE=public
      - NACOS_GROUP=SENTINEL_GROUP
      - LOG_LEVEL=DEBUG
    ports:
      - "8080:8080"

  my-service:
    build: ./my-service
    depends_on:
      - sentinel-dashboard
    environment:
      - SPRING_APPLICATION_NAME=my-service
      - SPRING_CLOUD_SENTINEL_TRANSPORT_DASHBOARD=sentinel-dashboard:8080
      - CSP_SENTINEL_APP_SECRET=${AUTH_APP_SECRET}
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_SERVER-ADDR=nacos:8848
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_NAMESPACE=public
      - SPRING_CLOUD_SENTINEL_DATASOURCE_FLOW_NACOS_GROUPID=SENTINEL_GROUP
    ports:
      - "8081:8080"
```

### .env

```bash
# 认证密钥（所有服务共享）
AUTH_APP_SECRET=my_secure_secret_2024

# Nacos 配置
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

### 启动和验证

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 查看 Dashboard 日志
docker-compose logs -f sentinel-dashboard | grep -i "auth\|client"

# 3. 查看客户端日志
docker-compose logs -f my-service | grep -i "heartbeat\|sentinel"

# 4. 访问 Dashboard
open http://localhost:8080
# 登录：admin / admin_password

# 5. 验证客户端连接
# 在 Dashboard 左侧菜单查看「应用列表」
# 应该能看到 my-service
```

## 下一步

- [Dashboard 与 Nacos 集成](01-dashboard-nacos-integration.md)
- [应用客户端集成 Nacos](02-client-integration.md)
- [故障排查](../../08-TROUBLESHOOTING.md)
