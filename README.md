# Sentinel Dashboard with Nacos

> 基于 React + TypeScript 的现代化 Sentinel Dashboard，完整支持 Nacos 规则持久化和集群流控

[![License](https://img.shields.io/badge/license-Apache%202-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/release-v1.0.0-green.svg)](CHANGELOG.md)

本项目是对 Alibaba Sentinel Dashboard 的现代化重构，采用 React 19 + TypeScript 重写前端，增强了 Nacos 集成和集群流控功能。

## ✨ 主要特性

- 🎨 **现代化 UI**：React 19 + TypeScript + Chakra UI，支持暗色主题
- 💾 **Nacos 持久化**：规则自动持久化到 Nacos，支持动态推送
- 🔗 **完整集群流控**：Token Server/Client 管理，支持自动降级
- 🔒 **安全增强**：客户端 API 鉴权，生产环境安全建议
- 📊 **实时监控**：QPS、RT、并发数等指标的实时图表
- 🧪 **测试完善**：130+ E2E 测试用例，保证质量

## 📚 文档

- [快速开始](docs/01-QUICK-START.md) - 5 分钟快速部署
- [架构设计](docs/02-ARCHITECTURE.md) - 技术选型和设计决策
- [Nacos 集成](docs/03-NACOS-INTEGRATION.md) - 规则持久化方案
- [集群流控](docs/04-CLUSTER-FLOW-CONTROL.md) - Token Server 配置
- [FAQ](docs/FAQ.md) - 常见问题解答
- [CHANGELOG](CHANGELOG.md) - 版本更新日志

## 🎯 项目概述

## 快速开始

### Docker Compose 方式（推荐）

```bash
# 构建并启动全栈服务（Nacos + Dashboard + Token Server）
make up-build

# 查看服务状态
make ps

# 查看日志
make logs

# 停止服务
make down
```

访问：

- Dashboard: http://localhost:8080（用户名/密码: sentinel/sentinel）
- 前端开发服务器: http://localhost:3000

### 生成监控数据（可选）

监控页面需要实际流量才能显示图表。可以使用以下方式快速生成测试数据：

```bash
# 持续生成监控数据（按 Ctrl+C 停止）
make gen-metric
```

然后访问监控页面查看实时图表：

- 生产环境：http://localhost:8080/dashboard/apps/sentinel-token-server/metric
- 开发环境：http://localhost:3000/dashboard/apps/sentinel-token-server/metric

### 本地开发

```bash
# 查看所有可用命令
make help

# 构建所有镜像
make build

# 构建并启动所有服务
make up-build

# 启动前端开发服务器（需要本地安装 pnpm）
make dev-fe

# 重新构建并重启服务
make restart-build
```

前端开发服务器会在 http://localhost:3000 启动，支持热更新。

## 项目结构

```
.
├── dashboard-frontend/            # React 19 前端（独立开发）
│   ├── src/                       # 前端源码（TypeScript + React）
│   │   ├── components/            # UI 组件
│   │   ├── pages/                 # 页面组件
│   │   ├── hooks/                 # 自定义 Hooks
│   │   └── lib/                   # 工具库
│   ├── e2e/                       # E2E 测试（Playwright）
│   ├── tests/                     # 单元测试（Vitest）
│   ├── Dockerfile                 # 前端构建镜像
│   └── vite.config.mts            # Vite 配置
├── sentinel-dashboard/            # Dashboard 后端（Spring Boot）
│   ├── src/main/java/             # Java 后端源码
│   ├── src/main/webapp/           # 前端构建产物目录
│   ├── Dockerfile                 # Dashboard 镜像
│   └── pom.xml
├── token-server/                  # Token Server（集群流控）
│   ├── src/                       # Java 源码
│   ├── Dockerfile                 # Token Server 镜像
│   └── pom.xml
├── scripts/                       # 构建和测试脚本
│   ├── dev.sh                     # 开发环境脚本
│   ├── e2e-test.sh                # E2E 测试脚本
│   └── generate-metric-data.sh    # 监控数据生成脚本
├── docs/                          # 项目文档
│   ├── 00-INDEX.md                # 文档索引
│   ├── 01-QUICK-START.md          # 快速开始
│   ├── 02-ARCHITECTURE.md         # 架构设计
│   └── ...                        # 其他文档
├── Makefile                       # 构建入口（make help）
├── docker-compose.yml             # Docker Compose 配置
└── README.md                      # 本文件
```

## 版本支持

| 组件         | 支持版本     | 测试版本 | 生产推荐 | 说明                   |
| ------------ | ------------ | -------- | -------- | ---------------------- |
| **Nacos**    | 2.2.0 ~ 3.x  | 2.3.0    | 2.4.3    | API 向后兼容，鉴权完善 |
| **Sentinel** | 1.8.6+       | 1.8.9    | 1.8.9    | Dashboard 基于 1.8.6   |
| **JDK**      | 8 / 11 / 17+ | 17       | 17       | 推荐使用 LTS 版本      |

⚠️ **不支持的版本**：

- Nacos 1.x：安全性不足，功能落后
- Nacos 2.0.x / 2.1.x：鉴权功能不完善

**版本说明**：

- 测试版本：本地开发和 CI 测试使用，稳定可靠
- 生产推荐：生产环境推荐版本，最新稳定特性

## 核心特性

### 🎨 现代化前端

- **技术栈**: React 19 + TypeScript + Vite
- **UI 框架**: Chakra UI v3 + Tailwind CSS
- **状态管理**: React Query + Zustand
- **路由**: React Router v7
- **图表**: Recharts
- **测试**: Vitest + Playwright

### ✅ 支持的规则类型

- [x] 流控规则 (Flow Rules)
- [x] 熔断规则 (Degrade Rules)
- [x] 热点参数规则 (Param Flow Rules)
- [x] 系统规则 (System Rules)
- [x] 授权规则 (Authority Rules)
- [x] 集群流控 (Cluster Flow Control)

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

| 功能           | 官方版本           | 改造版本                      |
| -------------- | ------------------ | ----------------------------- |
| 前端技术栈     | jQuery + Bootstrap | **React 19 + Chakra UI**      |
| 规则存储       | 内存/文件系统      | **Nacos**                     |
| 规则推送       | 需手动配置         | **自动推送**                  |
| 多应用支持     | 支持               | 支持                          |
| Dashboard 重启 | 规则丢失           | **规则保留**                  |
| 集群环境       | 不支持             | **支持**                      |
| JDK 版本       | JDK 8              | **JDK 17**                    |
| 主题           | 无                 | **Light/Dark/System 主题**    |
| Docker 支持    | 无                 | **多架构镜像（amd64/arm64）** |
| 自动化测试     | 无                 | **E2E + 单元测试**            |

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

## 📚 文档导航

### 用户指南

- **[Nacos 集成配置](docs/user-guide/01-nacos-configuration.md)** ⭐ 必读
  - Dashboard 如何配置 Nacos
  - 应用服务如何配置 Nacos
  - 为什么两边都要配置
  - 配置验证和常见问题

### 技术文档

- [快速开始](docs/01-QUICK-START.md) - 5 分钟快速体验
- [架构设计](docs/02-ARCHITECTURE.md) - 系统架构说明
- [Nacos 集成](docs/03-NACOS-INTEGRATION.md) - 技术实现细节
- [集群流控](docs/04-CLUSTER-FLOW-CONTROL.md) - 集群流控配置
- [部署指南](docs/05-DEPLOYMENT.md) - 生产环境部署
- [开发指南](docs/06-DEVELOPMENT.md) - 二次开发指引
- [API 参考](docs/07-API-REFERENCE.md) - REST API 文档
- [故障排查](docs/08-TROUBLESHOOTING.md) - 常见问题解决

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
# E2E 测试（自动启动服务）
make test          # API 测试
make test-ui       # UI 测试
make test-smoke    # 冒烟测试
make test-all      # 全部测试

# 前端检查
make fe-check      # 类型检查 + Lint + 单元测试
make fe-type       # TypeScript 类型检查
make fe-lint       # ESLint 检查
make fe-test       # Vitest 单元测试

# 前端 E2E 测试（需要先启动服务）
cd dashboard-frontend
pnpm test:e2e      # 无头模式
pnpm test:e2e:headed  # 有头模式（可见浏览器）
pnpm test:e2e:ui   # UI 调试模式
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
