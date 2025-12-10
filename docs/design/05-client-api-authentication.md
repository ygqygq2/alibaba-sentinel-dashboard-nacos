# 客户端 API 鉴权设计

## 1. 概述

Sentinel 客户端默认在 **8719 端口**暴露 HTTP API，供 Dashboard 调用以获取监控数据和下发规则。官方实现**没有任何鉴权机制**，存在严重安全风险。

本项目通过**反射注册自定义 CommandHandler** 的方式，为敏感 API 添加 `app_secret` 鉴权，在不修改 Sentinel 源码的前提下提升安全性。

## 2. 鉴权策略

### 2.1 需要 app_secret 的 API（规则和配置）

| API 命令         | 用途         | 风险等级 | 说明                                     |
| ---------------- | ------------ | -------- | ---------------------------------------- |
| `getRules`       | 查询规则     | **高**   | 可能暴露业务容量、敏感资源等信息         |
| `setRules`       | 修改规则     | **高**   | 可直接修改内存规则，导致服务拒绝或误放行 |
| `setClusterMode` | 修改集群模式 | **中**   | 切换客户端/服务端模式，影响集群功能      |

**鉴权要求**：

- 请求必须携带 `app_secret` 参数
- `app_secret` 值必须与服务端 JVM 参数 `-Dcsp.sentinel.app.secret` 一致
- 鉴权失败返回错误信息：`app_secret is required` 或 `Invalid app_secret`

### 2.2 不需要 app_secret 的 API（监控数据）

| API 命令          | 用途         | 说明                          |
| ----------------- | ------------ | ----------------------------- |
| `metric`          | 监控指标     | 只读 QPS/RT 数据              |
| `clusterNode`     | 集群节点信息 | 只读节点统计                  |
| `clusterNodeById` | 节点详情     | 只读节点详细信息              |
| `cnode`           | 调用链信息   | 只读调用链路                  |
| `tree`            | 资源树       | 只读资源结构                  |
| `jsonTree`        | JSON 资源树  | 只读资源结构（JSON 格式）     |
| `origin`          | 来源信息     | 只读来源统计                  |
| `api`             | API 列表     | 只读 API 列表                 |
| `basicInfo`       | 基本信息     | 只读应用基本信息              |
| `version`         | 版本信息     | 只读 Sentinel 版本            |
| `systemStatus`    | 系统状态     | 只读系统负载                  |
| `getClusterMode`  | 获取集群模式 | 只读当前模式（客户端/服务端） |
| `getSwitch`       | 获取开关状态 | 只读限流开关状态              |

**理由**：

- 这些 API 仅返回监控数据，不修改任何配置
- Dashboard 需要频繁调用这些 API 进行监控展示
- 为监控数据添加鉴权会增加 Dashboard 开发复杂度，且收益有限

## 3. 实现方式

### 3.1 技术方案

由于 Sentinel 使用 SPI 加载 `CommandHandler`，但 Spring Boot Fat JAR 的类加载机制导致 SPI 无法正常工作，本项目采用**反射注册**方式：

1. 在 `SentinelConfig.java` 的 `@PostConstruct` 中，通过反射访问 `SimpleHttpCommandCenter.handlerMap`
2. 将自定义的带鉴权 Handler 注册到 `handlerMap`，覆盖官方实现
3. 自定义 Handler 在业务逻辑前验证 `app_secret` 参数

**关键代码**：

```java
@PostConstruct
public void init() {
    InitExecutor.doInit();
    registerAuthenticatedHandlers();
}

private void registerAuthenticatedHandlers() {
    Class<?> commandCenterClass = Class.forName(
        "com.alibaba.csp.sentinel.transport.command.SimpleHttpCommandCenter");
    Field handlerMapField = commandCenterClass.getDeclaredField("handlerMap");
    handlerMapField.setAccessible(true);
    Map<String, CommandHandler> handlerMap = (Map<String, CommandHandler>) handlerMapField.get(null);

    handlerMap.put("getRules", new AuthenticatedFetchActiveRuleCommandHandler());
    handlerMap.put("setRules", new AuthenticatedModifyRulesCommandHandler());
    handlerMap.put("setClusterMode", new AuthenticatedModifyClusterModeCommandHandler());
}
```

### 3.2 Handler 实现示例

以 `AuthenticatedFetchActiveRuleCommandHandler` 为例：

```java
@CommandMapping(name = "getRules", desc = "get all active rules by type with authentication")
public class AuthenticatedFetchActiveRuleCommandHandler implements CommandHandler<String> {

    private static final String EXPECTED_SECRET = System.getProperty("csp.sentinel.app.secret");
    private static final boolean AUTH_ENABLED = StringUtil.isNotBlank(EXPECTED_SECRET);

    @Override
    public CommandResponse<String> handle(CommandRequest request) {
        // 验证 app_secret
        if (AUTH_ENABLED) {
            String appSecret = request.getParam("app_secret");
            if (StringUtil.isBlank(appSecret)) {
                return CommandResponse.ofFailure(new IllegalArgumentException(
                    "app_secret is required when authentication is enabled"));
            }
            if (!EXPECTED_SECRET.equals(appSecret)) {
                return CommandResponse.ofFailure(new IllegalArgumentException("Invalid app_secret"));
            }
        }

        // 鉴权通过，执行原逻辑
        String type = request.getParam("type");
        if ("flow".equalsIgnoreCase(type)) {
            return CommandResponse.ofSuccess(JSON.toJSONString(FlowRuleManager.getRules()));
        }
        // ... 其他规则类型
    }
}
```

## 4. 配置说明

### 4.1 HTTP 状态码说明

**重要**：认证失败时返回 **HTTP 400 Bad Request** 而不是标准的 401 Unauthorized。

**原因**：

- Sentinel 的 `SimpleHttpCommandCenter` 对所有失败响应使用 `CommandResponse.ofFailure()`
- 该方法固定返回 HTTP 400 状态码，无法自定义
- 要返回 401 需要修改 Sentinel 源码或创建自定义的 HTTP Server

**区分方法**：

- 认证失败：响应体包含 `app_secret is required` 或 `Invalid app_secret`
- 其他错误：响应体包含其他错误信息（如 `invalid type`）

**示例**：

```bash
# 无密钥访问
$ curl "http://localhost:8719/getRules?type=flow"
HTTP/1.1 400 Bad Request
app_secret is required when authentication is enabled

# 错误密钥
$ curl "http://localhost:8719/getRules?type=flow&app_secret=wrong"
HTTP/1.1 400 Bad Request
Invalid app_secret

# 正确密钥
$ curl "http://localhost:8719/getRules?type=flow&app_secret=sentinel_app_secret"
HTTP/1.1 200 OK
[]
```

### 4.2 启用鉴权

在 `docker-compose.yml` 或启动脚本中设置：

```yaml
environment:
  CSP_SENTINEL_APP_SECRET: sentinel_app_secret # 客户端密钥
```

**对应的 JVM 参数**：

```bash
-Dcsp.sentinel.app.secret=sentinel_app_secret
```

### 4.3 禁用鉴权

不设置 `CSP_SENTINEL_APP_SECRET` 环境变量即可。此时：

- 自定义 Handler 不执行鉴权逻辑
- 所有 API 可无密码访问（依赖网络层防护）

### 4.4 SPI 类加载器配置

为了让 Sentinel 的 SPI 机制能找到自定义类（尽管我们没用 SPI，但保留配置以备未来使用）：

```bash
-Dcsp.sentinel.spi.classloader=context
```

## 5. 安全建议

### 5.1 生产环境部署

**强烈建议**采用多层防护：

1. **网络隔离**（必须）

   - 使用 Docker 网络隔离，不对外暴露 8719 端口
   - 仅允许 Dashboard 容器访问客户端 8719
   - 示例：`docker-compose.prod.yml` 中移除 8719 端口映射

2. **密钥鉴权**（推荐）

   - 设置强密码作为 `app_secret`
   - 使用环境变量或密钥管理服务存储密钥
   - 定期轮换密钥

3. **防火墙规则**（可选）
   - 在主机防火墙层面限制 8719 端口访问
   - 仅允许 Dashboard IP 访问

### 5.2 开发/测试环境

开发环境为了方便调试，可以：

- 暴露 8719 端口到 `localhost`
- 使用简单密钥（如 `sentinel_app_secret`）
- 但**不建议**在公网环境这样做

### 5.3 风险提示

⚠️ **即使启用了 app_secret 鉴权，8719 端口的攻击仍然可以：**

- 在规则推送间隙（Nacos → 客户端）暂时修改内存规则
- 虽然重启或 Nacos 推送会覆盖，但可能造成短时间服务异常

**根本解决方案**：

- 使用 Push 模式（Nacos 长轮询，1-2s 延迟）降低攻击窗口
- 网络层隔离 8719 端口

## 6. 测试

### 6.1 手动测试

```bash
# 无密码访问（应该被拒绝）
curl "http://localhost:8719/getRules?type=flow"
# 返回：app_secret is required

# 错误密码（应该被拒绝）
curl "http://localhost:8719/getRules?type=flow&app_secret=wrong"
# 返回：Invalid app_secret

# 正确密码（成功）
curl "http://localhost:8719/getRules?type=flow&app_secret=sentinel_app_secret"
# 返回：[]
```

### 6.2 自动化测试

E2E 测试文件：`dashboard-frontend/e2e/specs/client-api-auth.spec.ts`

```bash
# 运行客户端 API 鉴权测试
pnpm test:e2e:api --grep "客户端 API 鉴权"
```

## 7. 实现的 Handler 列表

| Handler 类名                                   | 覆盖的命令       | 文件路径                                                     |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------ |
| `AuthenticatedFetchActiveRuleCommandHandler`   | `getRules`       | `token-server/src/main/java/.../handler/...FetchActive...`   |
| `AuthenticatedModifyRulesCommandHandler`       | `setRules`       | `token-server/src/main/java/.../handler/...ModifyRules...`   |
| `AuthenticatedModifyClusterModeCommandHandler` | `setClusterMode` | `token-server/src/main/java/.../handler/...ModifyCluster...` |

## 8. 与官方 Sentinel 的差异

| 特性               | 官方 Sentinel | 本项目                             |
| ------------------ | ------------- | ---------------------------------- |
| 客户端 API 鉴权    | ❌ 无         | ✅ 支持 app_secret（规则相关 API） |
| Dashboard 鉴权     | ✅ 支持       | ✅ 继承官方实现                    |
| Push 模式（Nacos） | ❌ 无         | ✅ 支持（NacosDataSource 长轮询）  |
| 规则持久化         | ❌ 内存       | ✅ Nacos 持久化                    |

## 9. 未来改进

1. **支持更多 Handler**：根据需要为其他敏感 API 添加鉴权（如 `setSwitch`）
2. **JWT 鉴权**：使用 JWT 替代简单的字符串密钥
3. **审计日志**：记录所有鉴权失败的访问尝试
4. **速率限制**：防止暴力破解 app_secret
5. **证书鉴权**：使用 mTLS 替代密钥鉴权

## 10. 参考

- Sentinel 官方文档：https://sentinelguard.io/
- Spring Boot Fat JAR 类加载：https://docs.spring.io/spring-boot/docs/current/reference/html/executable-jar.html
- Java 反射 API：https://docs.oracle.com/javase/tutorial/reflect/
