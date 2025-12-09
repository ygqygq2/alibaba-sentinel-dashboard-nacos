# 文档索引

本目录包含 Sentinel Dashboard Nacos 项目的完整文档。

## 📚 用户指南

**[用户指南目录](user-guide/README.md)**

| 文档                                                                           | 说明                                |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| **[Dashboard 与 Nacos 集成](user-guide/01-dashboard-nacos-integration.md)** ⭐ | Dashboard 配置 Nacos + 鉴权（必读） |
| **[应用客户端集成 Nacos](user-guide/02-client-integration.md)** ⭐             | 客户端配置 Nacos + 连接鉴权（必读） |
| **[客户端鉴权配置示例](user-guide/03-client-auth-example.md)** 🔐              | 完整鉴权示例 + 故障排查 + 安全建议  |

## 📖 技术文档

| 序号 | 文档                                   | 说明                      |
| ---- | -------------------------------------- | ------------------------- |
| 01   | [快速开始](01-QUICK-START.md)          | 5 分钟快速上手指南        |
| 02   | [架构设计](02-ARCHITECTURE.md)         | 系统架构和设计说明        |
| 03   | [Nacos 集成](03-NACOS-INTEGRATION.md)  | Nacos 规则持久化技术实现  |
| 04   | [集群限流](04-CLUSTER-FLOW-CONTROL.md) | Token Server 集群限流方案 |
| 05   | [部署指南](05-DEPLOYMENT.md)           | Docker/Kubernetes 部署    |
| 06   | [开发指南](06-DEVELOPMENT.md)          | 本地开发和测试            |
| 07   | [API 参考](07-API-REFERENCE.md)        | REST API 文档             |
| 08   | [故障排查](08-TROUBLESHOOTING.md)      | 常见问题和解决方案        |

## 🚀 推荐阅读顺序

1. **新手入门**: [Dashboard 集成](user-guide/01-dashboard-nacos-integration.md) + [客户端集成](user-guide/02-client-integration.md) → 01 → 02 → 05
2. **集群限流**: 04 → 05
3. **深度开发**: 06 → 07
4. **运维支持**: 05 → 08

## 📖 其他资源

- [项目 README](../README.md) - 项目概述
- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Nacos 官方文档](https://nacos.io/zh-cn/)

## 💡 开发文档

**[开发文档目录](development/README.md)**

- [前端开发指南](development/01-frontend.md) - React + TypeScript 开发规范
- [测试指南](development/02-testing.md) - 单元测试、E2E 测试
- [API 升级说明](development/03-api-upgrade.md) - 官方实现 vs 我们的改进

## 💡 设计文档

**[设计文档目录](design/README.md)**

- [架构设计](design/01-architecture.md) - 整体架构
- [API 设计](design/02-api-design.md) - RESTful API 设计
- [页面设计](design/02-pages-design.md) - 前端页面设计
- [数据模型](design/03-data-model.md) - 数据模型设计
