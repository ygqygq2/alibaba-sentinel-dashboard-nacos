# 快速开始

5 分钟快速上手 Sentinel Dashboard Nacos 版。

## 前置条件

- Docker 20.10+
- Docker Compose 2.0+

## 一键启动

```bash
# 克隆项目
git clone https://github.com/ygqygq2/alibaba-sentinel-dashboard-nacos.git
cd alibaba-sentinel-dashboard-nacos

# 启动全栈服务（Nacos + Dashboard + Token Server）
docker-compose up -d

# 查看服务状态
docker-compose ps
```

## 访问服务

| 服务         | 地址                        | 说明                           |
| ------------ | --------------------------- | ------------------------------ |
| Dashboard    | http://localhost:8080       | 用户名/密码: sentinel/sentinel |
| Nacos        | http://localhost:8848/nacos | 用户名/密码: nacos/nacos       |
| Token Server | http://localhost:8081       | 集群限流服务                   |

## 验证部署

### 1. 登录 Dashboard

访问 http://localhost:8080，使用 `sentinel/sentinel` 登录。

### 2. 查看 Token Server

登录后，左侧菜单会显示 `sentinel-token-server` 应用，说明 Token Server 已成功注册。

### 3. 检查服务健康

```bash
# Dashboard 健康检查
curl http://localhost:8080/actuator/health

# Token Server 健康检查
curl http://localhost:8081/health

# Nacos 健康检查
curl http://localhost:8848/nacos/v1/console/health/readiness
```

## 接入你的应用

### Maven 依赖

```xml
<!-- Sentinel 核心 -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>1.8.9</version>
</dependency>

<!-- Sentinel Transport（与 Dashboard 通信） -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>1.8.9</version>
</dependency>

<!-- Sentinel Nacos 数据源（从 Nacos 加载规则） -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
    <version>1.8.9</version>
</dependency>
```

### 启动参数

```bash
java -Dproject.name=your-app-name \
     -Dcsp.sentinel.dashboard.server=localhost:8080 \
     -Dcsp.sentinel.api.port=8719 \
     -jar your-app.jar
```

### Spring Boot 配置

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            data-id: ${spring.application.name}-flow-rules
            group-id: SENTINEL_GROUP
            rule-type: flow
```

## 创建第一条规则

1. 登录 Dashboard
2. 在左侧菜单找到你的应用
3. 点击「流控规则」→「新增」
4. 填写规则：
   - 资源名: `/api/hello`
   - 阈值类型: QPS
   - 单机阈值: 10
5. 点击「保存」

规则会自动推送到 Nacos，你的应用会实时加载新规则。

## 停止服务

```bash
docker-compose down
```

## 下一步

- [架构设计](02-ARCHITECTURE.md) - 了解系统架构
- [Nacos 集成](03-NACOS-INTEGRATION.md) - 深入了解规则持久化
- [集群限流](04-CLUSTER-FLOW-CONTROL.md) - 配置集群限流
