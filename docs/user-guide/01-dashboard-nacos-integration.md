# Dashboard 与 Nacos 集成

本文档说明如何配置 Sentinel Dashboard 与 Nacos 的集成，实现规则持久化。

## 为什么需要 Nacos 集成

### 不集成的问题

❌ 规则只存在 Dashboard 内存中  
❌ Dashboard 重启后规则丢失  
❌ 多 Dashboard 实例无法共享规则  
❌ 无法实现规则的持久化存储

### 集成后的优势

✅ 规则持久化到 Nacos 配置中心  
✅ Dashboard 重启后规则自动恢复  
✅ 支持多 Dashboard 实例共享规则  
✅ 与应用客户端解耦，配置独立管理

## 配置方法

### Docker Compose 方式（推荐）

在 `docker-compose.yml` 中配置环境变量：

```yaml
services:
  sentinel-dashboard:
    image: sentinel/dashboard:local
    environment:
      # Nacos 配置
      - NACOS_SERVER_ADDR=nacos:8848 # Nacos 服务器地址
      - NACOS_NAMESPACE=public # 命名空间（可选）
      - NACOS_GROUP=DEFAULT_GROUP # 分组名称
      - NACOS_USERNAME= # 用户名（如果 Nacos 开启认证）
      - NACOS_PASSWORD= # 密码（如果 Nacos 开启认证）

      # Dashboard Web UI 认证配置
      - AUTH_ENABLED=true # 启用 Web 登录认证
      - SENTINEL_DASHBOARD_AUTH_USERNAME=sentinel
      - SENTINEL_DASHBOARD_AUTH_PASSWORD=sentinel

      # 客户端连接认证配置（可选，建议生产环境启用）
      - AUTH_APP_SECRET= # 客户端连接密钥（留空则不验证）

      # 服务端口
      - SENTINEL_DASHBOARD_SERVER_PORT=8080

      # 日志配置（调试时很有用）
      - LOG_LEVEL=INFO # 可选：TRACE, DEBUG, INFO, WARN, ERROR
```

**认证配置说明**：

1. **Web UI 认证**（`AUTH_ENABLED`）:

   - `true`（默认）：需要登录才能访问 Dashboard
   - `false`：禁用登录，任何人可访问

2. **客户端连接认证**（`AUTH_APP_SECRET`）:
   - 留空（默认）：客户端可自由连接
   - 设置密钥：客户端必须提供相同密钥才能连接
   - **建议生产环境设置**，防止未授权应用连接

**示例配置**：

```yaml
# 开发环境 - 禁用所有认证
- AUTH_ENABLED=false
- AUTH_APP_SECRET=

# 生产环境 - 启用所有认证
- AUTH_ENABLED=true
- SENTINEL_DASHBOARD_AUTH_USERNAME=admin
- SENTINEL_DASHBOARD_AUTH_PASSWORD=strong_password
- AUTH_APP_SECRET=prod_secret_2024
```

**调试技巧**：

```bash
# 方式 1: 使用 .env 文件
cp .env.example .env
# 编辑 .env 文件，设置 LOG_LEVEL=DEBUG

# 方式 2: 临时设置
LOG_LEVEL=DEBUG docker-compose up -d

# 方式 3: 修改 docker-compose.yml 后重启
docker-compose restart sentinel-dashboard

# 查看日志
docker-compose logs -f sentinel-dashboard | grep -i nacos
```

### 传统部署方式

#### 方式 1：修改 application.properties

编辑 `sentinel-dashboard/resources/application.properties`：

```properties
# Nacos 配置
nacos.server-addr=localhost:8848
nacos.namespace=
nacos.group-id=DEFAULT_GROUP
nacos.username=
nacos.password=

# 日志级别
logging.level.root=INFO
logging.level.com.alibaba.csp.sentinel.dashboard=DEBUG
```

#### 方式 2：启动参数

```bash
java -jar sentinel-dashboard.jar \\
  -Dnacos.server-addr=nacos:8848 \\
  -Dnacos.namespace=public \\
  -Dnacos.group-id=DEFAULT_GROUP \\
  -Dnacos.username=nacos_user \\
  -Dnacos.password=nacos_pass \\
  -Dlogging.level.root=DEBUG
```

#### 方式 3：环境变量

```bash
export NACOS_SERVER_ADDR=nacos:8848
export NACOS_NAMESPACE=public
export NACOS_GROUP=DEFAULT_GROUP
export NACOS_USERNAME=nacos_user
export NACOS_PASSWORD=nacos_pass
export LOG_LEVEL=DEBUG

java -jar sentinel-dashboard.jar
```

## 配置项说明

| 配置项               | 环境变量                           | 说明              | 默认值           | 必需      |
| -------------------- | ---------------------------------- | ----------------- | ---------------- | --------- |
| `nacos.server-addr`  | `NACOS_SERVER_ADDR`                | Nacos 服务器地址  | `localhost:8848` | ✅ 是     |
| `nacos.namespace`    | `NACOS_NAMESPACE`                  | Nacos 命名空间 ID | 空（public）     | ❌ 否     |
| `nacos.group-id`     | `NACOS_GROUP`                      | Nacos 配置分组    | `DEFAULT_GROUP`  | ❌ 否     |
| `nacos.username`     | `NACOS_USERNAME`                   | Nacos 用户名      | 空               | ⚠️ 视情况 |
| `nacos.password`     | `NACOS_PASSWORD`                   | Nacos 密码        | 空               | ⚠️ 视情况 |
| `auth.enabled`       | `AUTH_ENABLED`                     | 启用 Web UI 登录  | `true`           | ❌ 否     |
| `auth.app.secret`    | `AUTH_APP_SECRET`                  | 客户端连接密钥    | 空               | ❌ 否     |
| `logging.level.root` | `LOG_LEVEL`                        | 日志级别          | `INFO`           | ❌ 否     |
| N/A                  | `SENTINEL_DASHBOARD_AUTH_USERNAME` | Web UI 登录用户名 | `sentinel`       | ❌ 否     |
| N/A                  | `SENTINEL_DASHBOARD_AUTH_PASSWORD` | Web UI 登录密码   | `sentinel`       | ❌ 否     |

### ⚠️ 重要：Namespace 配置说明

**Nacos 命名空间的 ID 与显示名称不同！**

在 Nacos 中，`public` 命名空间的实际 ID 是**空字符串**，而不是 `"public"`。

#### ✅ 正确配置

使用 **public** 命名空间（Nacos 默认命名空间）：

```yaml
environment:
  - NACOS_NAMESPACE= # 空字符串（不填写任何值）
  # 或
  - NACOS_NAMESPACE # 不设置值
```

**或在配置文件中**：

```properties
nacos.namespace=
```

#### ❌ 错误配置

```yaml
# ❌ 错误！这会导致规则无法正常保存
environment:
  - NACOS_NAMESPACE=public
```

#### 使用自定义命名空间

如果需要使用自定义命名空间：

1. 在 Nacos 控制台创建命名空间
2. 复制生成的 **命名空间 ID**（一个 UUID，如 `e8c3f6d5-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）
3. 使用该 ID 配置：

```yaml
environment:
  - NACOS_NAMESPACE=e8c3f6d5-xxxx-xxxx-xxxx-xxxxxxxxxxxx # 使用 UUID，不是显示名称
```

#### 如何获取命名空间 ID

1. 访问 Nacos 控制台：http://localhost:8848/nacos
2. 点击左侧菜单 **命名空间**
3. 查看命名空间列表中的 **命名空间 ID** 列
   - `public` 命名空间的 ID 为空
   - 自定义命名空间有 UUID 格式的 ID

### 其他注意事项

- **Nacos 认证**：如果 Nacos 开启了认证，必须配置 `username` 和 `password`
- **Web UI 认证**：`AUTH_ENABLED=false` 可禁用登录页面（不推荐生产环境）
- **客户端认证**：设置 `AUTH_APP_SECRET` 后，客户端必须提供相同密钥才能连接
- 建议生产环境使用专门的分组名称，如 `SENTINEL_GROUP`

## 规则存储说明

### DataId 命名规则

Dashboard 推送规则到 Nacos 时使用的 DataId 格式：

```
${应用名}-${规则类型}-rules
```

**示例**：

- `my-service-flow-rules` - 流控规则
- `my-service-degrade-rules` - 降级规则
- `my-service-param-flow-rules` - 热点参数规则
- `my-service-system-rules` - 系统规则
- `my-service-authority-rules` - 授权规则

### 存储位置

- **Namespace**：配置的 `nacos.namespace`
- **Group**：配置的 `nacos.group-id`（默认 `DEFAULT_GROUP`）
- **DataId**：`${app}-${rule-type}-rules`

## 配置验证

### 1. 检查 Dashboard 启动日志

```bash
docker-compose logs sentinel-dashboard | grep -i nacos

# 应该看到：
# Nacos Server: nacos:8848
# Nacos Namespace: public
# Nacos Group: DEFAULT_GROUP
# [Nacos] Initialized with GROUP_ID: DEFAULT_GROUP
```

### 2. 创建测试规则

1. 访问 Dashboard：http://localhost:8080
2. 登录（sentinel/sentinel）
3. 选择应用，创建一条流控规则
4. 查看日志确认推送成功

```bash
# 查看推送日志
docker-compose logs sentinel-dashboard | grep "Publishing flow rules"

# 应该看到类似：
# [Nacos] Publishing flow rules: dataId=my-app-flow-rules, group=DEFAULT_GROUP, rules count=1
# [Nacos] Publish result: true
```

### 3. 验证 Nacos 中的配置

访问 Nacos 控制台：http://localhost:8848/nacos

- 命名空间：选择配置的 namespace
- 配置列表 → 搜索：`your-app-flow-rules`
- 应该能看到 JSON 格式的规则配置

或使用 API 验证：

```bash
curl -X GET 'http://localhost:8848/nacos/v1/cs/configs?dataId=my-app-flow-rules&group=DEFAULT_GROUP'
```

## 常见问题

### Q1: 客户端连接 Dashboard 失败

**症状**：客户端无法在 Dashboard 应用列表中显示

**排查步骤**：

1. **检查 Dashboard 日志**：

   ```bash
   docker-compose logs sentinel-dashboard | grep -i "auth\|invalid"

   # 如果看到：
   # [Auth] Client xx.xx.xx.xx attempted to connect without app_secret
   # 说明 Dashboard 启用了客户端鉴权，但客户端未提供密钥
   ```

2. **检查客户端鉴权配置**：

   ```bash
   # Dashboard 配置
   docker exec sentinel-dashboard env | grep AUTH_APP_SECRET

   # 如果有输出，说明启用了客户端鉴权
   # 客户端必须配置相同的密钥：
   # -Dcsp.sentinel.app.secret=your_secret_key
   ```

3. **解决方案**：

   ```bash
   # 方法 1：禁用客户端鉴权（开发环境）
   # 在 docker-compose.yml 中移除或留空 AUTH_APP_SECRET

   # 方法 2：配置客户端密钥（生产环境推荐）
   java -jar -Dcsp.sentinel.app.secret=your_secret_key your-app.jar
   ```

### Q2: 规则创建后没有保存到 Nacos

**可能原因**：

1. **Dashboard 未配置 Nacos**

   ```bash
   # 检查环境变量
   docker exec sentinel-dashboard env | grep NACOS
   ```

2. **Nacos 连接失败**

   ```bash
   # 测试连接
   docker exec sentinel-dashboard curl -I http://nacos:8848
   ```

3. **Nacos 认证失败**
   ```bash
   # 检查日志
   docker-compose logs sentinel-dashboard | grep -i "auth\|403"
   ```

**解决方案**：

- 确保 `NACOS_SERVER_ADDR` 配置正确
- 如果 Nacos 开启认证，配置用户名密码
- 开启 DEBUG 日志查看详细错误

### Q2: Dashboard 重启后规则显示为空

这是正常现象。Dashboard 本身不会主动从 Nacos 拉取规则到内存，它只负责推送。

**规则的加载流程**：

1. 应用连接到 Dashboard（心跳注册）
2. 用户在 Dashboard 查询规则时，触发从 Nacos 拉取
3. Dashboard 临时加载规则用于展示

**重要**：规则的实际生效依赖应用客户端从 Nacos 拉取，不依赖 Dashboard 内存。

### Q3: 如何在生产环境使用独立命名空间

**推荐做法**：

1. 在 Nacos 创建命名空间（如 `sentinel-prod`）
2. 记录命名空间 ID（如 `f3a5b2c1-xxxx`）
3. 配置 Dashboard：
   ```bash
   NACOS_NAMESPACE=f3a5b2c1-xxxx
   NACOS_GROUP=SENTINEL_GROUP
   ```

### Q4: 多环境如何隔离

**方案 1：不同命名空间**

```
开发：namespace=dev
测试：namespace=test
生产：namespace=prod
```

**方案 2：不同分组**

```
开发：group=SENTINEL_DEV
测试：group=SENTINEL_TEST
生产：group=SENTINEL_PROD
```

**方案 3：不同 Nacos 集群**

```
开发：dev-nacos:8848
生产：prod-nacos:8848
```

## 下一步

- [应用客户端集成 Nacos](02-client-integration.md)
- [配置验证和调试](03-configuration-validation.md)
- [故障排查](../../08-TROUBLESHOOTING.md)
