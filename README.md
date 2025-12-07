# 项目概述

本项目是对 Alibaba Sentinel Dashboard 的改造和扩展，添加了 Nacos 作为规则持久化存储。

## 快速开始

### Docker Compose 方式（推荐）

```bash
# 启动全栈服务（Nacos + Dashboard + Token Server）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

访问 http://localhost:8080，用户名/密码: sentinel/sentinel

### 生成监控数据（可选）

监控页面需要实际流量才能显示图表。可以使用以下方式快速生成测试数据：

```bash
# 使用测试脚本生成流量
./scripts/generate-metric-data.sh

# 或手动访问 token-server 接口
for i in {1..50}; do
  curl http://localhost:8081/api/hello
  sleep 0.1
done
```

然后访问监控页面查看图表：http://localhost:3000/dashboard/metric?app=sentinel-token-server

### 本地编译运行

```bash
# 使用 Makefile 构建（推荐）
make build        # 构建前端 + 后端
make frontend     # 仅构建前端
make backend      # 仅构建后端
make dev          # 启动前端开发服务器
make help         # 查看所有命令

# 或手动编译
cd sentinel-dashboard
mvn clean package

# 运行
java -Dserver.port=8080 \
  -Dcsp.sentinel.dashboard.server=localhost:8080 \
  -Dproject.name=sentinel-dashboard \
  -Dnacos.server.addr=localhost:8848 \
  -jar target/sentinel-dashboard.jar
```

## 项目结构

```
.
├── dashboard-frontend/            # React 前端（独立目录）
│   ├── src/                       # 前端源码
│   ├── tests/                     # 前端单元测试
│   └── dist/                      # 构建产物
├── sentinel-dashboard/            # Dashboard 后端模块
│   ├── src/main/java/             # Java 后端源码
│   ├── src/main/webapp/           # 前端构建输出（make frontend 生成）
│   ├── Dockerfile                 # Dashboard Docker 镜像
│   └── pom.xml
├── token-server/                  # Token Server 模块（集群流控）
│   ├── src/                       # Java 源码
│   ├── Dockerfile                 # Token Server Docker 镜像
│   └── pom.xml
├── tests/e2e/                     # E2E 自动化测试
├── scripts/                       # 构建脚本
├── docs/                          # 文档
├── Makefile                       # 构建入口（make help 查看命令）
├── docker-compose.yml             # 全栈测试
└── README.md                      # 本文件
```

## 核心特性

### ✅ 支持的规则类型

- [x] 流量规则 (Flow Rules)
- [x] 热点参数规则 (Param Flow Rules)
- [x] 系统规则 (System Rules)
- [x] 授权规则 (Authority Rules)
- [x] 黑白名单规则 (Degrade Rules)
- [x] Gateway 流量规则 (Gateway Rules)

### 📝 规则持久化

- **存储位置**: Nacos 配置中心
- **持久化触发**: Dashboard 中修改规则时自动推送
- **规则加载**: 应用启动时从 Nacos 拉取

### 🔄 工作流程

1. 用户在 Dashboard UI 修改规则
2. Dashboard 调用 FlowRuleController 处理请求
3. Controller 调用 FlowRuleNacosPublisher 推送规则到 Nacos
4. Nacos 存储规则配置
5. 应用客户端通过 sentinel-datasource-nacos 监听配置变化
6. 客户端自动更新内存中的规则

## 改造说明

### 与官方 Sentinel Dashboard 的差异

| 功能           | 官方版本      | 改造版本       |
| -------------- | ------------- | -------------- |
| 规则存储       | 内存/文件系统 | **Nacos**      |
| 规则推送       | 需手动配置    | **自动推送**   |
| 多应用支持     | 支持          | 支持           |
| Dashboard 重启 | 规则丢失      | **规则保留**   |
| 集群环境       | 不支持        | **支持**       |
| JDK 版本       | JDK 8         | **JDK 17**     |
| Docker 支持    | 无            | **多架构镜像** |
| 自动化测试     | 无            | **E2E 测试**   |

### 改造的关键文件

1. **pom.xml**

   - 移除对父 POM 的依赖
   - 添加明确的 Nacos 依赖
   - 修复版本参数

2. **FlowRuleNacosProvider/Publisher**

   - 实现了官方的 DynamicRuleProvider/Publisher 接口
   - 支持从 Nacos 读取和推送规则

3. **ParamFlowRuleNacosProvider/Publisher**

   - 热点参数规则的持久化支持

4. **application.properties**
   - 新增 Nacos 配置参数

## 配置指南

详见 [Nacos 集成指南](docs/03-NACOS-INTEGRATION.md)

## 集群流控指南

详见 [集群流控指南](docs/04-CLUSTER-FLOW-CONTROL.md)

## 部署指南

详见 [部署指南](docs/05-DEPLOYMENT.md)

## 开发指南

### 添加新的规则持久化支持

1. 实现 `DynamicRuleProvider` 接口
2. 实现 `DynamicRulePublisher` 接口
3. 在 Spring 配置中注册为 Bean

示例（以 Gateway 规则为例）：

```java
@Component
@ConditionalOnProperty(name = "rule.provider", havingValue = "nacos")
public class GatewayFlowRuleNacosProvider implements DynamicRuleProvider<GatewayFlowRuleEntity> {

    @Override
    public List<GatewayFlowRuleEntity> getRules(String appName) throws Exception {
        // 从 Nacos 读取规则
    }
}
```

### 测试

```bash
# 使用 Makefile
make test         # 运行所有测试
make test-fe      # 运行前端测试
make test-be      # 运行后端测试

# 或手动运行
cd dashboard-frontend && pnpm test   # 前端测试
cd sentinel-dashboard && mvn test    # 后端测试

# E2E 自动化测试（需要先启动服务）
cd tests/e2e && ./run_tests.sh
```

## Docker 镜像

### 本地构建

```bash
# 构建所有镜像
docker-compose build

# 单独构建 Dashboard
cd sentinel-dashboard && docker-compose build

# 单独构建 Token Server
cd token-server && docker-compose build
```

### 镜像说明

| 镜像                          | 说明                    | 端口 |
| ----------------------------- | ----------------------- | ---- |
| `sentinel/dashboard:local`    | Sentinel Dashboard      | 8080 |
| `sentinel/token-server:local` | Token Server (集群流控) | 8081 |

### GitHub Container Registry

Tag 推送会自动构建并发布到 GHCR：

```bash
docker pull ghcr.io/ygqygq2/alibaba-sentinel-dashboard-nacos/sentinel-dashboard:latest
docker pull ghcr.io/ygqygq2/alibaba-sentinel-dashboard-nacos/token-server:latest
```

## 性能指标

- **Dashboard 启动时间**: ~10 秒
- **规则推送延迟**: < 500ms
- **并发连接数**: 1000+
- **内存占用**: ~256MB (JVM 默认配置)

## 已知限制

1. 规则编辑时不支持并发修改（Nacos 确保最终一致性）
2. 不支持规则版本管理
3. 不支持规则审计日志（需要单独配置 Nacos 审计）

## 常见问题

### Q: Dashboard 支持集群部署吗？

**A**: 支持。多个 Dashboard 实例都连接到同一个 Nacos，实现规则共享。

### Q: 如何回滚规则？

**A**: 在 Nacos 配置界面查看历史版本，选择想要的版本进行发布。

### Q: 如何导入现有规则？

**A**: 使用 Nacos 的配置导入功能，或通过 Dashboard API 导入。

## 许可证

Apache License 2.0

## 参考资源

- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Nacos 官方文档](https://nacos.io/zh-cn/)
- [Spring Cloud Sentinel](https://github.com/alibaba/spring-cloud-alibaba)

## 支持

遇到问题或有建议？

- 提交 Issue
- 发起 Pull Request
- 查看 [故障排查指南](docs/08-TROUBLESHOOTING.md)
- 查看 [完整文档索引](docs/00-INDEX.md)
