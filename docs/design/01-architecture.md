# Sentinel Dashboard 前端架构设计

> 版本：1.0
> 更新日期：2025-12-05

---

## 1. 概述

### 1.1 背景

原 Sentinel Dashboard 前端基于 AngularJS 1.x（2015 年技术栈），存在以下问题：

- AngularJS 已停止维护（2022 年 1 月）
- 依赖老旧，存在安全漏洞
- 开发体验差，无类型支持
- 难以扩展和维护

### 1.2 目标

- 采用现代化技术栈重构前端
- 保持与后端 API 完全兼容
- 提升用户体验和开发效率
- 支持暗色主题和国际化

### 1.3 技术选型

| 类别   | 技术                  | 说明                               |
| ------ | --------------------- | ---------------------------------- |
| 框架   | React 19              | 最新稳定版，支持 Server Components |
| 语言   | TypeScript            | 类型安全                           |
| 构建   | Vite                  | 快速开发和构建                     |
| UI     | Chakra UI             | 组件库                             |
| 状态   | React Query + Zustand | 服务端状态 + 客户端状态            |
| 路由   | React Router v7       | 声明式路由                         |
| 表单   | React Hook Form + Zod | 表单处理 + 校验                    |
| 国际化 | i18next               | 多语言支持                         |
| 测试   | Vitest + Playwright   | 单元测试 + E2E                     |

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │      Hooks          │  │
│  │  (路由页面)  │  │  (UI组件)   │  │  (业务逻辑封装)     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────┴────────────────┴─────────────────────┴──────────┐  │
│  │                    React Query                          │  │
│  │                  (服务端状态管理)                        │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────────┐  │
│  │                    API Client                            │  │
│  │                  (HTTP 请求封装)                         │  │
│  └────────────────────────┬────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP
┌───────────────────────────┼─────────────────────────────────┐
│                           ▼                                  │
│              Spring Boot Backend (Java)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     Controllers                          │ │
│  │  /auth  /app  /flow  /degrade  /cluster  /machine  ...  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
src/
├── components/              # 组件
│   ├── ui/                 # 基础 UI 组件（Button, Modal, Table...）
│   ├── dashboard/          # Dashboard 专用组件
│   │   ├── sidebar/        # 侧边栏
│   │   ├── rule-table/     # 规则表格
│   │   ├── rule-form/      # 规则表单
│   │   └── chart/          # 监控图表
│   └── layout/             # 布局组件
│
├── pages/                   # 页面
│   ├── auth/               # 认证页面
│   │   └── sign-in.tsx
│   └── dashboard/          # Dashboard 页面
│       ├── index.tsx       # 首页
│       ├── metric/         # 实时监控
│       ├── identity/       # 簇点链路
│       ├── flow/           # 流控规则
│       ├── degrade/        # 降级规则
│       ├── param-flow/     # 热点参数
│       ├── system/         # 系统规则
│       ├── authority/      # 授权规则
│       ├── machine/        # 机器列表
│       ├── cluster/        # 集群流控
│       └── gateway/        # 网关流控
│
├── hooks/                   # 自定义 Hooks
│   ├── use-apps.ts         # 应用列表
│   ├── use-flow-rules.ts   # 流控规则
│   ├── use-auth.ts         # 认证
│   └── ...
│
├── lib/                     # 工具库
│   ├── api/                # API 客户端
│   │   ├── client.ts       # 基础客户端
│   │   ├── app.ts          # 应用 API
│   │   ├── flow.ts         # 流控 API
│   │   ├── degrade.ts      # 降级 API
│   │   ├── cluster.ts      # 集群 API
│   │   └── ...
│   └── utils/              # 工具函数
│
├── types/                   # 类型定义
│   ├── api.ts              # API 响应类型
│   ├── app.ts              # 应用类型
│   ├── rule.ts             # 规则类型
│   ├── machine.ts          # 机器类型
│   └── cluster.ts          # 集群类型
│
├── stores/                  # 状态管理（Zustand）
│   ├── auth.ts             # 认证状态
│   └── ui.ts               # UI 状态（侧边栏宽度等）
│
├── routes/                  # 路由配置
│   ├── index.tsx
│   ├── auth.tsx
│   └── dashboard.tsx
│
└── styles/                  # 样式
    └── globals.css
```

---

## 3. 核心模块设计

### 3.1 API 客户端

统一的 HTTP 请求封装，处理认证、错误、响应格式化。

**职责**：

- 请求拦截：添加认证 Token
- 响应拦截：统一错误处理
- 基础 URL 配置
- 请求/响应类型定义

### 3.2 认证模块

**流程**：

1. 用户输入用户名密码
2. 调用 `/auth/login` 获取 Token
3. Token 存储到 localStorage
4. 后续请求携带 Token
5. Token 过期跳转登录页

### 3.3 应用侧边栏

**功能**：

- 展示所有注册的应用
- 显示健康状态（在线/离线机器数）
- 搜索过滤
- 展开显示子菜单
- 宽度可拖动调整

### 3.4 规则管理

**通用模式**：

- 列表展示（分页、搜索）
- 新增/编辑（Modal 表单）
- 删除（确认对话框）
- 批量操作

**规则类型**：

- 流控规则（FlowRule）
- 降级规则（DegradeRule）
- 热点参数规则（ParamFlowRule）
- 系统规则（SystemRule）
- 授权规则（AuthorityRule）

---

## 4. 数据模型

### 4.1 应用（App）

```typescript
interface App {
  app: string; // 应用名
  appType: number; // 应用类型（0: 普通, 1: 网关）
  machines: Machine[]; // 机器列表
  healthyCount: number; // 健康机器数
}
```

### 4.2 机器（Machine）

```typescript
interface Machine {
  app: string;
  ip: string;
  port: number;
  hostname: string;
  healthy: boolean;
  lastHeartbeat: number;
  heartbeatVersion: string;
  version: string;
}
```

### 4.3 规则（Rule）

```typescript
// 流控规则
interface FlowRule {
  id: number;
  resource: string;
  limitApp: string;
  grade: number; // 0: 线程数, 1: QPS
  count: number;
  strategy: number; // 0: 直接, 1: 关联, 2: 链路
  refResource?: string;
  controlBehavior: number; // 0: 快速失败, 1: Warm Up, 2: 排队等待
  warmUpPeriodSec?: number;
  maxQueueingTimeMs?: number;
  clusterMode: boolean;
  clusterConfig?: ClusterFlowConfig;
}

// 降级规则
interface DegradeRule {
  id: number;
  resource: string;
  grade: number; // 0: RT, 1: 异常比例, 2: 异常数
  count: number;
  timeWindow: number;
  minRequestAmount: number;
  statIntervalMs: number;
  slowRatioThreshold?: number;
}
```

---

## 5. 页面路由

| 路径                         | 页面     | 说明           |
| ---------------------------- | -------- | -------------- |
| `/auth/sign-in`              | 登录     | 登录页面       |
| `/dashboard`                 | 首页     | Dashboard 首页 |
| `/dashboard/:app/metric`     | 实时监控 | 应用监控数据   |
| `/dashboard/:app/identity`   | 簇点链路 | 资源列表       |
| `/dashboard/:app/flow`       | 流控规则 | 流控规则管理   |
| `/dashboard/:app/degrade`    | 降级规则 | 降级规则管理   |
| `/dashboard/:app/param-flow` | 热点参数 | 热点参数规则   |
| `/dashboard/:app/system`     | 系统规则 | 系统规则管理   |
| `/dashboard/:app/authority`  | 授权规则 | 授权规则管理   |
| `/dashboard/:app/machine`    | 机器列表 | 应用机器管理   |
| `/dashboard/cluster`         | 集群流控 | 集群流控管理   |

---

## 6. 后端 API 兼容

保持与现有后端 API 完全兼容，主要接口：

| 接口                     | 方法   | 说明         |
| ------------------------ | ------ | ------------ |
| `/auth/login`            | POST   | 登录         |
| `/auth/logout`           | POST   | 退出         |
| `/app/briefinfos.json`   | GET    | 应用列表     |
| `/machine/machines.json` | GET    | 机器列表     |
| `/v1/flow/rules`         | GET    | 流控规则列表 |
| `/v1/flow/rule`          | POST   | 新增流控规则 |
| `/v1/flow/save.json`     | PUT    | 修改流控规则 |
| `/v1/flow/delete.json`   | DELETE | 删除流控规则 |
| `/cluster/state/:app`    | GET    | 集群状态     |
| ...                      | ...    | ...          |

---

## 7. 非功能性需求

### 7.1 性能

- 首屏加载 < 2s
- 页面切换 < 200ms
- 使用 React Query 缓存减少请求

### 7.2 可访问性

- 支持键盘导航
- 语义化 HTML
- ARIA 标签

### 7.3 响应式

- 支持桌面端（>= 1024px）
- 支持平板端（768px - 1024px）

### 7.4 主题

- 亮色主题（默认）
- 暗色主题

---

## 8. 参考

- [Sentinel Dashboard 原版](https://github.com/alibaba/Sentinel)
- [Chakra UI](https://chakra-ui.com/)
- [React Query](https://tanstack.com/query)
