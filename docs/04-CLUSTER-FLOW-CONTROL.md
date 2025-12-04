# 集群限流

集群限流通过独立部署的 Token Server 实现全局流量控制。

## 概述

### 为什么需要集群限流？

单机限流存在的问题：

```
场景：API 限流 100 QPS，部署 10 个实例

单机限流：每个实例限流 100 QPS → 总 QPS 可达 1000
集群限流：全局限流 100 QPS → 总 QPS 最多 100
```

### 架构对比

| 模式         | 说明                          | 适用场景         |
| ------------ | ----------------------------- | ---------------- |
| 单机限流     | 每个实例独立计数              | 无状态服务       |
| 嵌入模式     | 应用内部选一个做 Token Server | 小规模集群       |
| **独立模式** | 独立部署 Token Server         | **生产环境推荐** |

## 独立模式架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Token Server (独立部署)                       │
│                                                                  │
│   HTTP :8081          API :8719           Cluster :18730        │
│   (健康检查)           (Dashboard 通信)     (令牌分发)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
         ┌───────────┐   ┌───────────┐   ┌───────────┐
         │  App A    │   │  App B    │   │  App C    │
         │ (Client)  │   │ (Client)  │   │ (Client)  │
         └───────────┘   └───────────┘   └───────────┘
```

## 部署 Token Server

### Docker Compose 方式

Token Server 已包含在全栈部署中：

```bash
docker-compose up -d
```

服务端口：

- `8081`: HTTP 服务端口
- `8719`: Sentinel API 端口
- `18730`: 集群通信端口

### 单独部署

```bash
cd token-server
docker-compose up -d
```

### 配置说明

```yaml
# docker-compose.yml
token-server:
  environment:
    # Token Server 应用名
    - APP_NAME=sentinel-token-server
    # HTTP 服务端口
    - SERVER_PORT=8081
    # 集群通信端口
    - CLUSTER_SERVER_PORT=18730
    # 空闲连接超时（秒）
    - CLUSTER_IDLE_SECONDS=600
    # Nacos 地址（用于加载规则）
    - NACOS_SERVER_ADDR=nacos:8848
    - NACOS_GROUP_ID=SENTINEL_GROUP
    # Dashboard 地址（注册到 Dashboard）
    - SENTINEL_DASHBOARD_HOST=sentinel-dashboard
    - SENTINEL_DASHBOARD_PORT=8080
```

## 客户端接入

### 1. 添加依赖

```xml
<!-- Sentinel 集群客户端 -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-cluster-client-default</artifactId>
    <version>1.8.9</version>
</dependency>
```

### 2. 配置集群客户端

#### 方式一：JVM 参数

```bash
java -Dproject.name=your-app \
     -Dcsp.sentinel.dashboard.server=dashboard:8080 \
     # 集群客户端配置
     -Dcsp.sentinel.cluster.client.server.host=token-server \
     -Dcsp.sentinel.cluster.client.server.port=18730 \
     -jar your-app.jar
```

#### 方式二：代码配置

```java
@Configuration
public class SentinelClusterConfig {

    @PostConstruct
    public void init() {
        // 配置 Token Server 地址
        ClusterClientConfigManager.applyNewAssignConfig(
            new ClusterClientAssignConfig()
                .setServerHost("token-server")
                .setServerPort(18730)
        );

        // 切换到集群客户端模式
        ClusterStateManager.applyState(ClusterStateManager.CLUSTER_CLIENT);
    }
}
```

#### 方式三：Spring Boot 配置

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: dashboard:8080
      # 集群配置
      cluster:
        enabled: true
        client:
          server-host: token-server
          server-port: 18730
```

### 3. 创建集群流控规则

在 Dashboard 中创建规则时：

1. 选择「流控规则」→「新增」
2. 填写资源名和阈值
3. **勾选「是否集群」**
4. 选择「阈值模式」:
   - **单机均摊**: 总阈值 / 客户端数量
   - **总体阈值**: 整个集群共享的总阈值
5. 保存规则

## Token Server 管理

### 查看状态

```bash
# 健康检查
curl http://localhost:8081/health

# 集群配置
curl http://localhost:8081/cluster/config
```

响应示例：

```json
{
  "port": 18730,
  "idleSeconds": 600,
  "embedded": false,
  "namespaceSet": ["default"],
  "namespaceCount": 1
}
```

### Dashboard 查看

1. 登录 Dashboard
2. 找到 `sentinel-token-server` 应用
3. 点击「集群流控」→「Token Server 列表」

可以看到：

- Server ID
- 端口
- 运行模式（独立模式）
- 连接数
- QPS 统计

### 查看集群状态

```bash
curl -b cookies.txt "http://localhost:8080/cluster/state/sentinel-token-server"
```

## 高可用部署

### Kubernetes StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: token-server
spec:
  serviceName: token-server
  replicas: 2
  selector:
    matchLabels:
      app: token-server
  template:
    metadata:
      labels:
        app: token-server
    spec:
      containers:
        - name: token-server
          image: sentinel/token-server:latest
          ports:
            - containerPort: 8081
            - containerPort: 8719
            - containerPort: 18730
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: SERVICE_NAME
              value: "$(POD_NAME).token-server"
```

### 客户端负载均衡

配置多个 Token Server 地址：

```java
// 主从模式
ClusterClientConfigManager.applyNewAssignConfig(
    new ClusterClientAssignConfig()
        .setServerHost("token-server-0.token-server")
        .setServerPort(18730)
);
```

## 监控指标

Token Server 暴露以下指标：

| 指标                              | 说明         |
| --------------------------------- | ------------ |
| `cluster.server.connection.count` | 客户端连接数 |
| `cluster.server.request.qps`      | 令牌请求 QPS |
| `cluster.server.token.pass`       | 通过的令牌数 |
| `cluster.server.token.block`      | 拒绝的令牌数 |

## 故障处理

### Token Server 不可用时

客户端会自动降级为本地限流：

```
[ClusterTokenClient] Token server not available, falling back to local flow control
```

### 网络分区

- 客户端会定时重连 Token Server
- 重连间隔：5 秒
- 最大重试次数：无限制

### 规则不生效

1. 检查规则是否勾选了「是否集群」
2. 检查客户端是否连接到 Token Server
3. 检查 Token Server 是否加载了对应应用的规则

## 下一步

- [部署指南](05-DEPLOYMENT.md) - 生产环境部署
- [故障排查](08-TROUBLESHOOTING.md) - 常见问题解决
