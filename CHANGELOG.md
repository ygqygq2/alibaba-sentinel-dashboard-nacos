# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### 🎉 首个正式版本

基于 Sentinel 1.8.9 的现代化 Dashboard，采用 React + TypeScript 重构前端，并增强了 Nacos 集成和集群流控功能。

### ✨ 主要特性

#### 核心功能

- **用户认证**：支持用户登录和 Token 管理
- **应用管理**：实时监控应用健康状态和实例信息
- **规则管理**：完整的 CRUD 操作支持
  - 流控规则（Flow Rules）
  - 熔断降级规则（Degrade Rules）
  - 热点参数规则（Param Flow Rules）
  - 系统保护规则（System Rules）
  - 授权规则（Authority Rules）
- **簇点链路**：资源调用链路可视化，支持树状/列表视图
- **实时监控**：QPS、RT、并发数等指标的实时监控和图表展示
- **实例管理**：查看和管理应用实例

#### 集群流控

- **Token Server 管理**：全局和应用级别的 Token Server 管理
- **Token Client 管理**：全局和应用级别的 Token Client 管理
- **集群配置**：支持集群模式切换和配置修改
- **自动降级**：Token Server 不可用时自动降级到单机模式

#### Nacos 集成

- **规则持久化**：所有规则自动持久化到 Nacos
- **动态推送**：规则变更实时推送到客户端
- **多环境支持**：支持不同命名空间和分组
- **配置同步**：多实例环境配置自动同步

#### 安全增强

- **客户端鉴权**：支持 `AUTH_APP_SECRET` 配置
- **Dashboard 鉴权**：Dashboard → Client API 自动携带认证参数
- **网络隔离建议**：生产环境安全部署指南

### 🎨 前端技术栈

- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **UI 组件**：Chakra UI v3 + Tailwind CSS
- **状态管理**：TanStack Query (React Query) + Zustand
- **路由**：React Router v7
- **图表**：Recharts
- **表单**：React Hook Form + Zod
- **国际化**：i18next
- **测试**：Vitest + Playwright

### 🏗️ 架构改进

- **前后端分离**：前端独立构建，支持容器化部署
- **API 版本化**：保留 V1 API 兼容性，推荐使用 V2 API
- **响应式设计**：支持桌面和移动端
- **暗色主题**：完整的深色模式支持
- **可访问性**：遵循 WCAG 2.1 标准

### 🧪 测试覆盖

- **E2E 测试**：130+ Playwright 测试用例
- **单元测试**：Vitest 单元测试覆盖核心组件
- **API 测试**：完整的 API 接口测试
- **UI 测试**：页面交互和视觉回归测试

### 📦 部署方式

- **Docker Compose**：一键启动完整环境
- **Kubernetes**：支持 K8s 部署（配置示例）
- **独立部署**：支持前后端分离部署

### 📚 文档

- **快速开始**：[docs/01-QUICK-START.md](docs/01-QUICK-START.md)
- **架构设计**：[docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)
- **Nacos 集成**：[docs/03-NACOS-INTEGRATION.md](docs/03-NACOS-INTEGRATION.md)
- **集群流控**：[docs/04-CLUSTER-FLOW-CONTROL.md](docs/04-CLUSTER-FLOW-CONTROL.md)
- **部署指南**：[docs/05-DEPLOYMENT.md](docs/05-DEPLOYMENT.md)
- **开发指南**：[docs/06-DEVELOPMENT.md](docs/06-DEVELOPMENT.md)
- **API 参考**：[docs/07-API-REFERENCE.md](docs/07-API-REFERENCE.md)
- **故障排查**：[docs/08-TROUBLESHOOTING.md](docs/08-TROUBLESHOOTING.md)

### 🔄 迁移指南

从旧版 Sentinel Dashboard 迁移：

1. **数据迁移**：规则需重新配置（推送到 Nacos）
2. **客户端升级**：建议升级到 Sentinel 1.8.9+
3. **配置调整**：参考 [docs/01-QUICK-START.md](docs/01-QUICK-START.md)

### 🐛 已知限制

- Token Server 分配功能暂无 UI，建议使用 `scripts/setup-cluster.sh` 或直接调用 API
- 客户端 API 鉴权需客户端自行实现，建议使用网络隔离保护

### 🙏 致谢

- [Alibaba Sentinel](https://github.com/alibaba/Sentinel) - 原始项目
- [Alibaba Nacos](https://github.com/alibaba/nacos) - 配置中心
- 所有贡献者

### 📝 许可证

Apache License 2.0

---

## 版本对比

| 特性       | 旧版 Dashboard | v1.0.0                |
| ---------- | -------------- | --------------------- |
| 前端框架   | AngularJS 1.x  | React 19 + TypeScript |
| UI 组件    | Bootstrap 3    | Chakra UI v3          |
| 状态管理   | $scope         | React Query + Zustand |
| 持久化     | 内存/文件      | Nacos                 |
| 集群流控   | 基础支持       | 完整支持              |
| 暗色主题   | ❌             | ✅                    |
| 响应式     | 部分           | 完整                  |
| TypeScript | ❌             | ✅                    |
| 测试覆盖   | 无             | 130+ E2E              |

---

## 下一步计划

- [ ] Token Server 分配对话框 UI
- [ ] Token Server 多实例 HA
- [ ] 监控指标增强（令牌申请延迟、拒绝率）
- [ ] 更多图表类型（热力图、拓扑图）
- [ ] 告警规则配置
- [ ] 规则导入/导出功能
