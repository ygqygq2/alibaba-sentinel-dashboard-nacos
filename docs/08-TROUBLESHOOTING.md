# 故障排查

常见问题和解决方案。

## Dashboard 问题

### Dashboard 无法启动

**症状**: 启动失败，报错 `Failed to start`

**排查步骤**:

```bash
# 1. 检查端口占用
netstat -tlnp | grep 8080
lsof -i :8080

# 2. 查看日志
docker-compose logs sentinel-dashboard

# 3. 检查 JVM 内存
docker stats sentinel-dashboard
```

**常见原因**:

- 端口被占用
- 内存不足
- Nacos 连接失败

### 无法连接 Nacos

**症状**: 日志显示 `Failed to connect to Nacos`

**排查步骤**:

```bash
# 1. 检查 Nacos 是否运行
curl http://localhost:8848/nacos/v1/console/health/readiness

# 2. 从 Dashboard 容器内测试
docker exec sentinel-dashboard curl http://nacos:8848/nacos/v1/console/health/readiness

# 3. 检查网络连通性
docker exec sentinel-dashboard ping nacos
```

**解决方案**:

- 检查 `NACOS_SERVER_ADDR` 配置
- 确保 Docker 网络正确
- 检查防火墙规则

### 规则未保存到 Nacos

**症状**: 在 Dashboard 修改规则后，Nacos 中没有对应配置

**排查步骤**:

```bash
# 1. 检查 Nacos 中是否有配置
curl "http://localhost:8848/nacos/v1/cs/configs?dataId=my-app-flow-rules&group=SENTINEL_GROUP"

# 2. 查看 Dashboard 日志
docker-compose logs sentinel-dashboard | grep -i "nacos\|publish\|error"
```

**常见原因**:

- Nacos 命名空间/分组配置错误
- Nacos 写入权限不足
- Publisher Bean 未正确注入

## 客户端问题

### 客户端未显示在 Dashboard

**症状**: 应用启动后，Dashboard 中看不到该应用

**排查步骤**:

```bash
# 1. 检查客户端心跳端口
netstat -tlnp | grep 8719

# 2. 检查客户端日志
grep -i "sentinel\|heartbeat" app.log

# 3. 从 Dashboard 测试连接客户端
curl http://client-ip:8719/api
```

**检查项**:

- `csp.sentinel.dashboard.server` 配置正确
- `csp.sentinel.api.port` 端口可访问
- 网络连通性

### 规则未生效

**症状**: 在 Dashboard 配置规则后，客户端未执行限流

**排查步骤**:

```bash
# 1. 检查客户端规则
curl http://client-ip:8719/getRules?type=flow

# 2. 检查资源名是否匹配
curl http://client-ip:8719/clusterNode

# 3. 查看限流日志
tail -f ~/logs/csp/sentinel-block.log

# 4. 检查 Nacos 中的规则配置
curl "http://localhost:8848/nacos/v1/cs/configs?dataId=my-app-flow-rules&group=SENTINEL_GROUP&username=nacos&password=nacos"

# 5. 检查 NACOS_GROUP 配置是否一致
# Dashboard、应用端、Nacos 中的 group 必须都是 SENTINEL_GROUP
```

**常见原因**:

- 资源名不匹配
- 规则未推送到客户端
- 客户端未使用 Nacos 数据源
- **NACOS_GROUP 配置不一致**（Dashboard 使用 SENTINEL_GROUP，客户端使用 DEFAULT_GROUP）
- **Token Server 自身缺少 Nacos 数据源配置**（需要 NacosDataSourceConfig.java）

**Token Server 规则不生效（重要）**:

Token Server 有两种角色：

1. **集群流控服务器** - 为其他应用提供 Token（已配置）
2. **普通应用** - 自身也需要加载流控规则

如果 Token Server 自身的流控规则不生效，需要：

```java
// token-server/src/main/java/com/alibaba/csp/tokenserver/config/NacosDataSourceConfig.java
@Configuration
public class NacosDataSourceConfig {
    @PostConstruct
    public void init() {
        // 配置 Nacos 数据源，加载自身规则
        Properties properties = new Properties();
        properties.put("serverAddr", nacosServerAddr);
        properties.put("username", "nacos");
        properties.put("password", "nacos");

        ReadableDataSource<String, List<FlowRule>> flowRuleDataSource =
            new NacosDataSource<>(properties, groupId, dataId,
                source -> JSON.parseArray(source, FlowRule.class));
        FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
    }
}
```

## Token Server 问题

### Token Server 启动失败

**症状**: Token Server 容器反复重启

**排查步骤**:

```bash
# 1. 查看日志
docker-compose logs token-server

# 2. 检查端口冲突
netstat -tlnp | grep -E "8081|8719|18730"

# 3. 检查内存
docker stats token-server
```

### 集群限流不生效

**症状**: 配置了集群规则，但限流不生效

**排查步骤**:

```bash
# 1. 检查 Token Server 状态
curl http://localhost:8081/cluster/config

# 2. 检查客户端集群模式
curl http://client-ip:8719/getClusterMode

# 3. 检查客户端与 Token Server 连接
docker-compose logs token-server | grep "connection"
```

**检查项**:

- 客户端是否配置为集群客户端模式
- Token Server 地址是否正确
- 规则是否勾选了「是否集群」

### Token Server 模式不可用

**症状**: 设置 Token Server 模式时报错 `no SPI found`

**解决方案**:

确保 Token Server 包含以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-cluster-server-default</artifactId>
</dependency>
```

## Docker 问题

### 构建镜像失败

**症状**: `docker-compose build` 失败

**排查步骤**:

```bash
# 1. 清理缓存重新构建
docker-compose build --no-cache

# 2. 使用国内镜像
docker-compose build --build-arg USE_CHINA_MIRROR=true

# 3. 检查 Dockerfile 语法
docker build -f sentinel-dashboard/Dockerfile .
```

### 容器网络问题

**症状**: 容器之间无法通信

**排查步骤**:

```bash
# 1. 检查网络
docker network ls
docker network inspect alibaba-sentinel-dashboard-nacos_default

# 2. 检查容器 IP
docker inspect sentinel-dashboard | grep IPAddress

# 3. 容器内部测试
docker exec sentinel-dashboard ping nacos
```

### 磁盘空间不足

**症状**: 构建或运行时报错 `no space left on device`

**解决方案**:

```bash
# 清理未使用的资源
docker system prune -a

# 清理构建缓存
docker builder prune

# 查看磁盘使用
docker system df
```

## Kubernetes 问题

### Pod 无法启动

**排查步骤**:

```bash
# 1. 查看 Pod 状态
kubectl get pods -l app=sentinel-dashboard

# 2. 查看事件
kubectl describe pod <pod-name>

# 3. 查看日志
kubectl logs <pod-name>
```

### Service 无法访问

**排查步骤**:

```bash
# 1. 检查 Service
kubectl get svc sentinel-dashboard

# 2. 检查 Endpoints
kubectl get endpoints sentinel-dashboard

# 3. 端口转发测试
kubectl port-forward svc/sentinel-dashboard 8080:8080
```

## 性能问题

### Dashboard 响应慢

**排查步骤**:

```bash
# 1. 检查 JVM 状态
docker exec sentinel-dashboard jstat -gc 1

# 2. 检查 CPU/内存
docker stats sentinel-dashboard

# 3. 检查 Nacos 延迟
time curl http://localhost:8848/nacos/v1/console/health/readiness
```

**优化建议**:

- 增加 JVM 堆内存
- 优化 Nacos 配置
- 检查网络延迟

### 高并发下限流失效

**可能原因**:

- 本地缓存未更新
- 统计窗口配置不当
- 集群模式下 Token Server 超载

**解决方案**:

- 检查规则配置
- 增加 Token Server 资源
- 考虑分片部署多个 Token Server

## 日志位置

| 组件         | 日志位置               |
| ------------ | ---------------------- |
| Dashboard    | `/home/sentinel/logs/` |
| Token Server | `/home/sentinel/logs/` |
| Sentinel SDK | `~/logs/csp/`          |
| Nacos        | `/home/nacos/logs/`    |

## 常用诊断命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看所有日志
docker-compose logs -f

# 进入容器调试
docker exec -it sentinel-dashboard bash

# 查看 JVM 堆信息
docker exec sentinel-dashboard jmap -heap 1

# 查看线程信息
docker exec sentinel-dashboard jstack 1

# 查看网络连接
docker exec sentinel-dashboard netstat -tlnp
```

## 获取帮助

如果以上方案无法解决问题：

1. 提交 Issue: https://github.com/ygqygq2/alibaba-sentinel-dashboard-nacos/issues
2. 附上:
   - 错误日志
   - 配置信息（脱敏）
   - 复现步骤
   - 环境信息（OS、Docker 版本等）

## 相关文档

- [Sentinel 官方 FAQ](https://sentinelguard.io/zh-cn/docs/faq.html)
- [Nacos 常见问题](https://nacos.io/zh-cn/docs/v2/faq.html)
