# 架构设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         用户/运维                                    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Sentinel Dashboard                                │
│                      (本项目)                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ 规则管理     │  │ 实时监控     │  │ 集群管理     │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         ▼                ▼                ▼                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Nacos Publisher / Provider                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Nacos                                        │
│                    (规则持久化存储)                                   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   App A         │ │   App B         │ │   App C         │
│ (Sentinel SDK)  │ │ (Sentinel SDK)  │ │ (Sentinel SDK)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 核心组件

### 1. Sentinel Dashboard

改造后的控制台，主要功能：

- **规则管理**: 流控、熔断、热点、系统、授权规则
- **实时监控**: QPS、响应时间、并发数监控
- **机器管理**: 客户端健康状态监控
- **集群管理**: Token Server 配置和监控

### 2. Token Server (独立模式)

集群限流的核心组件：

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Token Server (Standalone)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  HTTP Server (:8081)                                            ││
│  │  - 健康检查 /health                                              ││
│  │  - 配置查询 /cluster/config                                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Sentinel API (:8719)                                           ││
│  │  - Dashboard 通信                                                ││
│  │  - 心跳上报                                                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Cluster Server (:18730)                                        ││
│  │  - 令牌分发 (Netty)                                              ││
│  │  - 客户端连接管理                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Nacos

配置中心，存储规则数据：

| Data ID 格式             | 说明         |
| ------------------------ | ------------ |
| `{app}-flow-rules`       | 流控规则     |
| `{app}-degrade-rules`    | 熔断规则     |
| `{app}-param-flow-rules` | 热点参数规则 |
| `{app}-system-rules`     | 系统规则     |
| `{app}-authority-rules`  | 授权规则     |

## 数据流

### 规则推送流程

```
用户在 Dashboard 修改规则
         │
         ▼
┌─────────────────────┐
│  FlowRuleController │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ FlowRuleNacosPublisher │  ──────► Nacos 存储规则
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Nacos 推送变更     │  ◄─────── 应用监听变更
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  应用更新内存规则    │
└─────────────────────┘
```

### 集群限流流程

```
应用请求资源
    │
    ▼
┌─────────────────────┐
│ 判断是否集群规则     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────────────┐
│ 本地限流 │ │ 请求 Token Server │
└─────────┘ └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ 全局令牌桶计算    │
            └────────┬────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
        ┌─────────┐  ┌─────────┐
        │ 获得令牌 │  │ 令牌不足 │
        │ 请求通过 │  │ 请求拒绝 │
        └─────────┘  └─────────┘
```

## 项目结构

```
alibaba-sentinel-dashboard-nacos/
├── sentinel-dashboard/              # Dashboard 模块
│   ├── src/main/java/
│   │   └── com/alibaba/csp/sentinel/dashboard/
│   │       ├── controller/          # REST 控制器
│   │       ├── rule/nacos/          # Nacos 规则实现 ⭐
│   │       ├── service/             # 业务服务
│   │       └── repository/          # 数据访问
│   ├── src/main/resources/
│   │   └── application.properties   # 配置文件
│   └── Dockerfile
│
├── token-server/                    # Token Server 模块
│   ├── src/main/java/
│   │   └── com/alibaba/csp/tokenserver/
│   │       ├── config/              # 集群配置 ⭐
│   │       └── controller/          # 状态接口
│   └── Dockerfile
│
├── tests/e2e/                       # E2E 测试
│   ├── test_dashboard.py
│   └── conftest.py
│
├── .github/workflows/               # CI/CD
│   ├── ci.yml
│   └── release.yml
│
├── docs/                            # 文档
└── docker-compose.yml               # 全栈部署
```

## 关键改造点

### 1. 规则 Provider/Publisher

官方 Dashboard 规则存储在内存中，重启丢失。改造后：

```java
// 规则读取
@Component
public class FlowRuleNacosProvider implements DynamicRuleProvider<List<FlowRuleEntity>> {
    @Override
    public List<FlowRuleEntity> getRules(String appName) {
        // 从 Nacos 读取
    }
}

// 规则写入
@Component
public class FlowRuleNacosPublisher implements DynamicRulePublisher<List<FlowRuleEntity>> {
    @Override
    public void publish(String app, List<FlowRuleEntity> rules) {
        // 写入 Nacos
    }
}
```

### 2. Token Server 独立部署

官方仅支持嵌入模式（每个应用内部选一个做 Token Server），改造为独立部署：

```java
@Configuration
public class ClusterServerConfig {
    @PostConstruct
    public void init() {
        // 加载配置
        ClusterServerConfigManager.loadGlobalTransportConfig(...);
        // 启动独立 Token Server
        tokenServer = new SentinelDefaultTokenServer();
        tokenServer.start();
    }
}
```

### 3. 服务名支持

官方仅支持 IP 地址注册，改造支持服务名/主机名：

```java
// Dashboard 端验证
private boolean isValidIpOrHostname(String address) {
    // 支持 IP 或可解析的主机名
    try {
        InetAddress.getByName(address);
        return true;
    } catch (UnknownHostException e) {
        return false;
    }
}
```

## 技术栈

| 组件        | 版本  | 说明            |
| ----------- | ----- | --------------- |
| JDK         | 17    | Eclipse Temurin |
| Spring Boot | 2.5.x | Web 框架        |
| Sentinel    | 1.8.9 | 流量控制核心    |
| Nacos       | 2.3.x | 配置中心        |
| Netty       | 4.1.x | 集群通信        |

## 下一步

- [Nacos 集成](03-NACOS-INTEGRATION.md) - 规则持久化详解
- [集群限流](04-CLUSTER-FLOW-CONTROL.md) - Token Server 配置
