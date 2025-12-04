# Sentinel Dashboard Nacos 集成指南

## 概述

本项目是对 Sentinel Dashboard 的改造，添加了 Nacos 规则持久化功能。通过此改造，你可以：

1. 在 Dashboard UI 中配置流量控制规则
2. 规则自动推送到 Nacos 配置中心
3. 应用端从 Nacos 拉取并应用规则
4. 容器重启后规则自动恢复

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   Sentinel Dashboard                     │
│  (修改)规则 → NacosRulePublisher → Nacos 配置中心        │
│  读取规则 ← NacosRuleProvider ← Nacos 配置中心            │
└─────────────────────────────────────────────────────────┘
                              ↓
                    Nacos 配置中心 (存储)
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   应用客户端 (Sentinel)                   │
│  sentinel-datasource-nacos → 动态加载规则                 │
└─────────────────────────────────────────────────────────┘
```

## 核心改造文件

### 1. Rule Provider/Publisher (src/main/java/com/alibaba/csp/sentinel/dashboard/rule/nacos/)

- **FlowRuleNacosProvider.java** - 从 Nacos 读取流量规则
- **FlowRuleNacosPublisher.java** - 向 Nacos 写入流量规则
- **ParamFlowRuleNacosProvider.java** - 从 Nacos 读取热点参数规则
- **ParamFlowRuleNacosPublisher.java** - 向 Nacos 写入热点参数规则
- **GatewayFlowRuleNacosProvider.java** - Gateway 流量规则
- **GatewayFlowRuleNacosPublisher.java** - Gateway 流量规则

### 2. 配置文件

- **application.properties** - Dashboard 配置
- **application-nacos.properties** - Nacos 特定配置

## 环境变量配置

### Dashboard 端配置

```bash
# Nacos 服务器地址
NACOS_SERVER_ADDR=nacos.middle:8848

# Nacos 命名空间 (可选，默认为 public)
NACOS_NAMESPACE=test

# Nacos 分组 (可选，默认为 DEFAULT_GROUP)
NACOS_GROUP=DEFAULT_GROUP

# Dashboard 用户名/密码
SENTINEL_DASHBOARD_AUTH_USERNAME=sentinel
SENTINEL_DASHBOARD_AUTH_PASSWORD=sentinel

# Dashboard 服务器配置
SERVER_PORT=8080
CSP_SENTINEL_DASHBOARD_SERVER=localhost:8080
PROJECT_NAME=sentinel-dashboard
```

### 应用端配置（Java 系统属性）

```bash
# Nacos 数据源配置
-Dspring.cloud.sentinel.datasource.ds1.nacos.server-addr=nacos.middle:8848
-Dspring.cloud.sentinel.datasource.ds1.nacos.namespace=test
-Dspring.cloud.sentinel.datasource.ds1.nacos.group-id=DEFAULT_GROUP
-Dspring.cloud.sentinel.datasource.ds1.nacos.data-id=${project.name}-flow-rules
-Dspring.cloud.sentinel.datasource.ds1.nacos.rule-type=flow
-Dspring.cloud.sentinel.datasource.ds2.nacos.data-id=${project.name}-param-flow-rules
-Dspring.cloud.sentinel.datasource.ds2.nacos.rule-type=param_flow
```

## Nacos 配置示例

### 流量规则 (Flow Rules)

**Data ID**: `my-app-flow-rules`  
**Group**: `DEFAULT_GROUP`  
**Content**:

```json
[
  {
    "resource": "/api/user/info",
    "limitApp": "default",
    "grade": 1,
    "count": 100,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  },
  {
    "resource": "/api/user/list",
    "limitApp": "default",
    "grade": 1,
    "count": 50,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```

### 热点参数规则 (Param Flow Rules)

**Data ID**: `my-app-param-flow-rules`  
**Group**: `DEFAULT_GROUP`  
**Content**:

```json
[
  {
    "resource": "/api/user/search",
    "grade": 1,
    "paramIdx": 0,
    "count": 10,
    "timeWindow": 1
  }
]
```

## 构建和运行

### 编译

```bash
mvn clean package
```

### 本地运行

```bash
java -Dserver.port=8080 \
  -Dcsp.sentinel.dashboard.server=localhost:8080 \
  -Dproject.name=sentinel-dashboard \
  -Dnacos.server.addr=localhost:8848 \
  -Dnacos.namespace=public \
  -Dnacos.group=DEFAULT_GROUP \
  -jar target/sentinel-dashboard.jar
```

## Docker 部署

### 构建镜像

```bash
docker build -t sentinel-dashboard:1.8.6-nacos .
```

### 运行容器

```bash
docker run -d \
  -p 8080:8080 \
  -e NACOS_SERVER_ADDR=nacos.middle:8848 \
  -e NACOS_NAMESPACE=test \
  -e NACOS_GROUP=DEFAULT_GROUP \
  --name sentinel-dashboard \
  sentinel-dashboard:1.8.6-nacos
```

## Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-dashboard
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sentinel-dashboard
  template:
    metadata:
      labels:
        app: sentinel-dashboard
    spec:
      containers:
        - name: sentinel-dashboard
          image: sentinel-dashboard:1.8.6-nacos
          ports:
            - containerPort: 8080
          env:
            - name: NACOS_SERVER_ADDR
              value: "nacos.middle:8848"
            - name: NACOS_NAMESPACE
              value: "test"
            - name: NACOS_GROUP
              value: "DEFAULT_GROUP"
            - name: SENTINEL_DASHBOARD_AUTH_USERNAME
              value: "sentinel"
            - name: SENTINEL_DASHBOARD_AUTH_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: sentinel-secret
                  key: password
```

## 故障排查

### 1. Dashboard 无法连接 Nacos

**症状**: 日志显示 `Failed to connect to Nacos`

**解决**:

- 检查 `NACOS_SERVER_ADDR` 是否正确
- 验证 Nacos 服务是否运行
- 检查网络连接

### 2. 规则未能保存到 Nacos

**症状**: 在 Dashboard 修改规则但 Nacos 中没有更新

**解决**:

- 检查 Nacos 认证信息
- 查看应用日志中的错误
- 确认 Nacos 中的配置权限

### 3. 应用无法加载规则

**症状**: 应用启动时 Sentinel 规则为空

**解决**:

- 检查应用端 Nacos 配置是否正确
- 验证 Data ID 和 Group 匹配
- 查看 sentinel-datasource-nacos 日志

## 参考资源

- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Nacos 官方文档](https://nacos.io/zh-cn/)
- [Sentinel Dashboard 源码](https://github.com/alibaba/Sentinel/tree/1.8.6/sentinel-dashboard)
- [Sentinel 动态规则扩展](https://sentinelguard.io/zh-cn/docs/dynamic-rule-configuration.html)
