# 应用客户端集成 Nacos

本文档说明如何配置应用服务（客户端）与 Nacos 的集成，实现规则的自动拉取和动态更新。

## 为什么需要 Nacos 集成

### 不集成的问题

❌ 应用只能接收 Dashboard 内存推送的规则  
❌ 应用重启后规则丢失  
❌ 新增实例无法自动获取规则  
❌ 规则变更需要重启应用

### 集成后的优势

✅ 应用启动时自动从 Nacos 加载规则  
✅ 实时监听 Nacos 配置变更  
✅ 多实例配置自动一致  
✅ 支持灰度发布、蓝绿部署  
✅ 规则持久化，不依赖 Dashboard

## 架构说明

```
┌─────────────┐                    ┌──────────────┐
│  Dashboard  │ ───── 推送规则 ────→│    Nacos     │
└─────────────┘                    └──────────────┘
      ↑                                    │
      │ 心跳/指标                           │ 拉取/监听
      │                                    ↓
┌─────────────────────────────────────────────────┐
│              应用服务实例                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  App-1   │  │  App-2   │  │  App-3   │       │
│  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

**关键点**：

1. Dashboard 负责推送规则到 Nacos
2. 应用客户端从 Nacos 拉取规则
3. 应用客户端监听 Nacos 配置变更并实时更新规则

## 配置方法

### Spring Boot 应用

#### 1. 添加依赖

在 `pom.xml` 中添加：

```xml
<dependencies>
    <!-- Sentinel 核心库 -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-core</artifactId>
        <version>1.8.9</version>
    </dependency>

    <!-- Sentinel 与 Spring Boot 集成 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        <version>2023.0.1.0</version>
    </dependency>

    <!-- Sentinel Nacos 数据源 -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-datasource-nacos</artifactId>
        <version>1.8.9</version>
    </dependency>
</dependencies>
```

#### 2. 配置 application.yml

```yaml
spring:
  application:
    name: my-service # 应用名称，必须配置

  cloud:
    sentinel:
      # Dashboard 配置（心跳上报）
      transport:
        dashboard: localhost:8080 # Dashboard 地址
        port: 8719 # 与 Dashboard 通信端口

      # Nacos 数据源配置
      datasource:
        # 流控规则
        flow:
          nacos:
            server-addr: localhost:8848 # ⚠️ 必须与 Dashboard 一致
            namespace: public # ⚠️ 必须与 Dashboard 一致
            groupId: DEFAULT_GROUP # ⚠️ 必须与 Dashboard 一致
            dataId: ${spring.application.name}-flow-rules
            rule-type: flow
            # 如果 Nacos 开启认证
            username: nacos_user
            password: nacos_pass

        # 降级规则
        degrade:
          nacos:
            server-addr: localhost:8848
            namespace: public
            groupId: DEFAULT_GROUP
            dataId: ${spring.application.name}-degrade-rules
            rule-type: degrade

        # 热点参数规则
        param-flow:
          nacos:
            server-addr: localhost:8848
            namespace: public
            groupId: DEFAULT_GROUP
            dataId: ${spring.application.name}-param-flow-rules
            rule-type: param-flow

        # 系统规则
        system:
          nacos:
            server-addr: localhost:8848
            namespace: public
            groupId: DEFAULT_GROUP
            dataId: ${spring.application.name}-system-rules
            rule-type: system

        # 授权规则
        authority:
          nacos:
            server-addr: localhost:8848
            namespace: public
            groupId: DEFAULT_GROUP
            dataId: ${spring.application.name}-authority-rules
            rule-type: authority
```

#### 3. application.properties 配置

```properties
spring.application.name=my-service

# Dashboard 配置
spring.cloud.sentinel.transport.dashboard=localhost:8080
spring.cloud.sentinel.transport.port=8719

# Nacos 数据源 - 流控规则
spring.cloud.sentinel.datasource.flow.nacos.server-addr=localhost:8848
spring.cloud.sentinel.datasource.flow.nacos.namespace=public
spring.cloud.sentinel.datasource.flow.nacos.groupId=DEFAULT_GROUP
spring.cloud.sentinel.datasource.flow.nacos.dataId=${spring.application.name}-flow-rules
spring.cloud.sentinel.datasource.flow.nacos.rule-type=flow
spring.cloud.sentinel.datasource.flow.nacos.username=nacos_user
spring.cloud.sentinel.datasource.flow.nacos.password=nacos_pass

# 其他规则类型配置类似...
```

## 配置关键点

### ⚠️ 客户端连接 Dashboard 鉴权

如果 Dashboard 启用了客户端鉴权（设置了 `AUTH_APP_SECRET` 环境变量），客户端必须在连接时提供相同的密钥。

**方法 1：通过 JVM 参数（推荐）**

```bash
java -jar -Dcsp.sentinel.app.secret=your_secret_key your-app.jar
```

**方法 2：通过 Spring Boot 配置**

```yaml
# application.yml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        heartbeat-interval-ms: 10000 # 心跳间隔（可选）

# 通过 JVM 系统属性配置
# csp.sentinel.app.secret: your_secret_key
```

**方法 3：通过环境变量**

```bash
export CSP_SENTINEL_APP_SECRET=your_secret_key
java -jar your-app.jar
```

**Docker 部署示例**：

```dockerfile
# Dockerfile
ENV CSP_SENTINEL_APP_SECRET=your_secret_key
```

```yaml
# docker-compose.yml
services:
  my-service:
    environment:
      - CSP_SENTINEL_APP_SECRET=your_secret_key
```

**⚠️ 重要**：

- 客户端的 `app_secret` 必须与 Dashboard 的 `AUTH_APP_SECRET` 完全一致
- 如果 Dashboard 未设置 `AUTH_APP_SECRET`，客户端可以不提供密钥
- 建议生产环境启用此功能以增强安全性

### ⚠️ 必须保持一致的配置

| 配置项     | Dashboard                 | 应用客户端          | 说明                 |
| ---------- | ------------------------- | ------------------- | -------------------- |
| Nacos 地址 | `nacos.server-addr`       | `server-addr`       | 必须指向同一个 Nacos |
| 命名空间   | `nacos.namespace`         | `namespace`         | 必须相同             |
| 分组       | `nacos.group-id`          | `groupId`           | 必须相同             |
| 认证信息   | `nacos.username/password` | `username/password` | 如果 Nacos 开启认证  |

### DataId 命名规则

**Dashboard 推送时的 DataId 格式**：

```
${应用名}-${规则类型}-rules
```

**客户端配置的 dataId**：

```yaml
dataId: ${spring.application.name}-${规则类型}-rules
```

**示例**：

- 应用名：`my-service`
- 流控规则：`my-service-flow-rules`
- 降级规则：`my-service-degrade-rules`

**重要**：应用配置的 `dataId` 必须与 Dashboard 推送的格式一致！

## 配置验证

### 1. 启动应用查看日志

```bash
# 应该看到类似输出：
[Sentinel] DataSource flow-nacos-datasource start to loadConfig
[Sentinel] DataSource flow-nacos-datasource load 3 FlowRule(s)
```

### 2. 验证规则生效

#### 方法 1：查看 Dashboard

访问 Dashboard → 实时监控 → 选择应用 → 查看资源列表

#### 方法 2：触发限流

调用应用的受保护接口，观察是否执行限流逻辑。

#### 方法 3：查看应用日志

```bash
grep "load.*Rule" application.log
```

### 3. 测试规则动态更新

1. 在 Dashboard 修改规则
2. 观察应用日志，应该看到：
   ```
   [Sentinel] DataSource flow-nacos-datasource loadConfig success
   [Sentinel] Flow rules changed: ...
   ```
3. 再次调用接口，验证新规则生效

## 常见问题

### Q1: 规则在 Dashboard 创建后，应用没有生效

**排查步骤**：

1. **检查配置是否一致**

   ```bash
   # Dashboard 配置
   NACOS_NAMESPACE=public
   NACOS_GROUP=DEFAULT_GROUP

   # 应用配置
   spring.cloud.sentinel.datasource.flow.nacos.namespace=public  # ✅ 一致
   spring.cloud.sentinel.datasource.flow.nacos.groupId=DEFAULT_GROUP  # ✅ 一致
   ```

2. **检查 DataId 是否匹配**

   ```yaml
   # Dashboard 推送的 DataId: my-service-flow-rules
   # 应用配置
   spring.cloud.sentinel.datasource.flow.nacos.dataId=my-service-flow-rules  # ✅ 正确
   # 错误示例
   spring.cloud.sentinel.datasource.flow.nacos.dataId=my-app-flow-rules      # ❌ 不匹配
   ```

3. **检查应用名称**

   ```yaml
   spring.application.name=my-service # 必须与 Dashboard 中显示的应用名一致
   ```

4. **检查 Nacos 中是否有配置**
   ```bash
   curl -X GET 'http://localhost:8848/nacos/v1/cs/configs?dataId=my-service-flow-rules&group=DEFAULT_GROUP'
   ```

### Q2: 客户端连接 Dashboard 失败，提示 "invalid app_secret"

**原因**：Dashboard 启用了客户端鉴权，但客户端未提供密钥或密钥不正确

**解决方案**：

1. **查看 Dashboard 日志确认是否启用鉴权**：

   ```bash
   docker logs sentinel-dashboard | grep "Client Auth"
   # 输出：Client Auth: Enabled (app_secret required)
   ```

2. **配置客户端密钥**：

   ```bash
   # 方法 1：JVM 参数
   java -jar -Dcsp.sentinel.app.secret=your_secret_key your-app.jar

   # 方法 2：环境变量
   export CSP_SENTINEL_APP_SECRET=your_secret_key
   java -jar your-app.jar
   ```

3. **确保密钥一致**：

   ```bash
   # Dashboard 环境变量
   AUTH_APP_SECRET=your_secret_key

   # 客户端配置
   -Dcsp.sentinel.app.secret=your_secret_key  # 必须完全一致
   ```

### Q3: 应用启动时报错 "user not found"

**原因**：Nacos 开启了认证，但应用未配置用户名密码

**解决方案**：

```yaml
spring.cloud.sentinel.datasource.flow.nacos.username=nacos_user
spring.cloud.sentinel.datasource.flow.nacos.password=nacos_pass
```

### Q4: 规则配置了但不生效

**可能原因**：

1. **未给接口添加 @SentinelResource 注解**

   ```java
   @SentinelResource(value = "resourceName")
   public String myMethod() {
       // ...
   }
   ```

2. **资源名不匹配**

   - Dashboard 配置的资源名：`/api/test`
   - 实际资源名：`GET:/api/test`
   - 确保完全一致

3. **规则条件不满足**
   - 检查 QPS 是否达到阈值
   - 检查限流应用（limitApp）是否匹配

### Q4: 如何配置多个 Nacos 数据源

如果不同规则类型存储在不同的 Nacos 集群：

```yaml
spring.cloud.sentinel.datasource:
  # 流控规则 - Nacos 集群 A
  flow:
    nacos:
      server-addr: nacos-a:8848
      dataId: ${spring.application.name}-flow-rules
      rule-type: flow

  # 降级规则 - Nacos 集群 B
  degrade:
    nacos:
      server-addr: nacos-b:8848
      dataId: ${spring.application.name}-degrade-rules
      rule-type: degrade
```

## 配置检查清单

部署前验证：

### 应用配置检查

- [ ] `spring.application.name` 已配置
- [ ] `spring.cloud.sentinel.transport.dashboard` 指向 Dashboard 地址
- [ ] **如果 Dashboard 启用客户端鉴权**，已配置 `csp.sentinel.app.secret`
- [ ] `spring.cloud.sentinel.datasource.*.nacos.server-addr` 与 Dashboard 一致
- [ ] `spring.cloud.sentinel.datasource.*.nacos.namespace` 与 Dashboard 一致
- [ ] `spring.cloud.sentinel.datasource.*.nacos.groupId` 与 Dashboard 一致
- [ ] `dataId` 使用 `${spring.application.name}-${rule-type}-rules` 格式
- [ ] 如果 Nacos 开启认证，已配置 `username` 和 `password`
- [ ] 应用启动日志显示成功加载规则
- [ ] 应用能够成功连接到 Dashboard（查看 Dashboard 日志或应用列表）

### Dashboard 验证

- [ ] Dashboard 服务正常运行
- [ ] 如果启用了客户端鉴权，`AUTH_APP_SECRET` 已设置
- [ ] Dashboard 日志显示客户端连接成功
- [ ] Dashboard 应用列表中能看到客户端应用

### Nacos 验证

- [ ] Nacos 服务正常运行
- [ ] 能在 Nacos 控制台看到规则配置
- [ ] 规则配置的 DataId 格式正确
- [ ] 规则配置在正确的命名空间和分组下

## 完整示例

### 示例项目结构

```
my-service/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/
        │       ├── MyServiceApplication.java
        │       └── controller/
        │           └── TestController.java
        └── resources/
            └── application.yml
```

### pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        <version>2023.0.1.0</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-datasource-nacos</artifactId>
        <version>1.8.9</version>
    </dependency>
</dependencies>
```

### application.yml

```yaml
spring:
  application:
    name: my-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            namespace: public
            groupId: DEFAULT_GROUP
            dataId: ${spring.application.name}-flow-rules
            rule-type: flow

server:
  port: 8080
```

### TestController.java

```java
@RestController
public class TestController {

    @GetMapping("/api/test")
    @SentinelResource(value = "/api/test", blockHandler = "handleBlock")
    public String test() {
        return "Success";
    }

    public String handleBlock(BlockException ex) {
        return "Blocked by Sentinel: " + ex.getClass().getSimpleName();
    }
}
```

## 下一步

- [Dashboard 与 Nacos 集成](01-dashboard-nacos-integration.md)
- [配置验证和调试](03-configuration-validation.md)
- [故障排查](../../08-TROUBLESHOOTING.md)
