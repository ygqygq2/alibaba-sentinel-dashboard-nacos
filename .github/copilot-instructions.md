# GitHub Copilot 使用指令

> **项目**：Alibaba Sentinel Dashboard with Nacos - 基于 Nacos 的 Sentinel 控制台
> **作用域**：约束项目的开发规范，详细设计见 docs/ 目录
> **原则**：本文档仅包含规范性内容，不包含具体实现细节

---

## AI 助手行为规范

### 脚本优先原则

- **优先使用项目提供的一键脚本** `./scripts/dev.sh`，避免手动执行多个命令
- 构建时使用 `make` 命令（`make help` 查看可用命令）
- 避免在终端中逐条执行可以合并的命令

### 常用一键命令

```bash
# 服务管理（推荐使用一键脚本）
./scripts/dev.sh up             # 构建并启动所有服务
./scripts/dev.sh down           # 停止服务
./scripts/dev.sh restart        # 重新构建并启动
./scripts/dev.sh logs           # 查看日志
./scripts/dev.sh ps             # 查看服务状态
./scripts/dev.sh clean          # 清理所有

# E2E 测试
./scripts/dev.sh test api              # API 测试（默认）
./scripts/dev.sh test ui               # UI 测试（无头模式）
./scripts/dev.sh test ui --headed      # UI 测试（有头模式，开发者可见）
./scripts/dev.sh test smoke            # 冒烟测试
./scripts/dev.sh test all              # 全部测试
./scripts/dev.sh test all --ci         # 全部测试（CI 模式）

# 前端检查
./scripts/dev.sh check all      # 类型 + lint + 单元测试
./scripts/dev.sh check type     # 类型检查
./scripts/dev.sh check lint     # Lint 检查
./scripts/dev.sh check test     # 单元测试

# 前端开发（需要本地 pnpm）
cd dashboard-frontend && pnpm dev         # 启动前端开发服务器
cd dashboard-frontend && pnpm test:e2e:report  # 查看测试报告
```

### 测试分层说明

本项目采用**分层测试架构**：

| 层级         | 运行位置            | 用途           |
| ------------ | ------------------- | -------------- |
| 前端开发测试 | dashboard-frontend/ | 开发时快速验证 |
| 集成测试     | 项目根目录 scripts/ | CI/CD 完整验证 |

**测试模式**：

- **无头模式（默认）**：用于 CI/CD，无界面，速度快
- **有头模式（--headed）**：开发者调试用，可见浏览器操作

**测试报告**：

- 本地：`pnpm test:e2e:report` 查看 HTML 报告
- CI/CD：测试报告自动发布到 GitHub Pages

---

## 项目结构概述

```
├── dashboard-frontend/          # React 前端（独立目录）
│   ├── src/                    # 前端源码
│   ├── tests/                  # 前端单元测试
│   └── dist/                   # 构建产物（git ignored）
├── sentinel-dashboard/          # Dashboard 后端模块
│   ├── src/main/java/          # Java 后端源码
│   └── src/main/webapp/        # 前端构建输出位置（由 make frontend 生成）
├── token-server/               # Token Server 独立模块
├── docs/                       # 项目文档
│   ├── design/                 # 设计文档
│   ├── development/            # 开发文档
│   └── user-guide/             # 用户指南
├── tests/                      # E2E 测试目录
├── scripts/                    # 构建脚本
└── Makefile                    # 构建入口（make help 查看命令）
```

---

## 前端开发规范（React + TypeScript）

### 技术栈

- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：Chakra UI + Tailwind CSS
- **状态管理**：React Query (服务端状态) + Zustand (客户端状态)
- **路由**：React Router v7
- **国际化**：i18next
- **表单**：React Hook Form + Zod

### 命名规范

- **组件文件**：PascalCase（`FlowRuleList.tsx`、`RuleForm.tsx`）
- **工具/hooks**：camelCase（`useFlowRules.ts`、`apiClient.ts`）
- **类型定义**：PascalCase 接口名，camelCase 文件名（`types/rule.ts` 中的 `FlowRule`）
- **常量**：UPPER_SNAKE_CASE（`API_BASE_URL`、`DEFAULT_PAGE_SIZE`）
- **CSS 类名**：kebab-case 或 Tailwind 类

### 目录结构（前端）

```
src/
├── components/           # 通用组件
│   ├── ui/              # 基础 UI 组件
│   └── dashboard/       # Dashboard 专用组件
├── pages/               # 页面组件
│   ├── auth/            # 认证相关
│   └── dashboard/       # Dashboard 页面
├── hooks/               # 自定义 Hooks
├── lib/                 # 工具库
│   ├── api/             # API 客户端
│   └── utils/           # 工具函数
├── types/               # 类型定义
├── stores/              # 状态管理
└── routes/              # 路由配置
```

### API 调用规范

- 使用统一的 API 客户端（`src/lib/api/client.ts`）
- 所有 API 调用使用 React Query 封装成 hooks
- API 响应类型必须定义在 `types/api.ts`
- 错误处理统一使用 toast 提示

```typescript
// ✅ 推荐
const { data, isLoading, error } = useFlowRules(appName);

// ❌ 避免
const [data, setData] = useState();
useEffect(() => { fetch(...) }, []);
```

### 组件规范

- 函数组件 + Hooks，禁止 Class 组件
- Props 必须定义 TypeScript 接口
- 复杂组件拆分为 Container + Presentation
- 使用 React.memo 优化不必要的重渲染

---

## 后端开发规范（Java + Spring Boot）

### 命名规范

- **类名**：PascalCase（`FlowRuleController`、`NacosConfigService`）
- **方法名**：camelCase（`getFlowRules`、`publishConfig`）
- **常量**：UPPER_SNAKE_CASE（`DEFAULT_NAMESPACE`）
- **包名**：全小写（`com.alibaba.csp.sentinel.dashboard`）

### 分层架构

```
src/main/java/
├── controller/          # REST API 控制器
├── service/             # 业务逻辑
├── repository/          # 数据访问（Nacos）
├── domain/              # 领域模型
├── config/              # 配置类
└── util/                # 工具类
```

### API 设计规范

- RESTful 风格，使用标准 HTTP 方法
- 统一响应格式：`{ code: number, message: string, data: T }`
- 错误码规范见下文

---

## 错误码规范

### 格式

`SD-{分类}{序号}`（如 SD-1001）

### 分类

| 范围    | 分类     | 说明                           |
| ------- | -------- | ------------------------------ |
| SD-10xx | 认证类   | 登录失败、Token 过期、权限不足 |
| SD-20xx | 规则类   | 规则不存在、格式错误、冲突     |
| SD-30xx | 机器类   | 机器离线、连接超时、心跳丢失   |
| SD-40xx | 集群类   | Token Server 异常、分配失败    |
| SD-50xx | Nacos 类 | 配置推送失败、连接异常         |
| SD-60xx | 系统类   | 内部错误、参数校验失败         |

### 用户提示

错误信息需包含"问题 + 建议"：

```
SD-5001: Nacos 配置推送失败，请检查 Nacos 连接状态或网络配置
```

---

## 测试规范

本项目采用**分层测试架构**：

### 测试分层

| 层级             | 位置                  | 技术栈              | 职责           |
| ---------------- | --------------------- | ------------------- | -------------- |
| **前端开发测试** | `dashboard-frontend/` | Vitest + Playwright | 开发时快速验证 |
| **集成测试**     | `scripts/e2e-test.sh` | Playwright          | CI/CD 完整验证 |

### 前端测试（开发时）

位置：`dashboard-frontend/`

```bash
# 单元测试
pnpm test                  # Vitest 单元测试
pnpm test:watch            # 监听模式

# E2E 测试
pnpm test:e2e              # 无头 UI 测试
pnpm test:e2e:headed       # 有头 UI 测试（开发者可见）
pnpm test:e2e:debug        # Playwright UI 调试模式
pnpm test:e2e:api          # 纯 API 测试
pnpm test:e2e:all          # 全部测试
pnpm test:e2e:report       # 查看 HTML 报告
```

### 集成测试（CI/CD）

从项目根目录运行：

```bash
./scripts/e2e-test.sh api              # API 测试
./scripts/e2e-test.sh ui               # UI 测试（无头）
./scripts/e2e-test.sh ui --headed      # UI 测试（有头）
./scripts/e2e-test.sh all              # 全部测试
```

### 测试报告

- **本地**：`pnpm test:e2e:report` 查看 HTML 报告
- **CI/CD**：自动发布到 GitHub Pages

### 后端测试

- **单元测试**：JUnit 5 + Mockito
- **集成测试**：Spring Boot Test

### 测试原则

- 前端开发时只运行内层测试（快速反馈）
- CI/CD 运行外层集成测试（完整验证）
- 每个页面至少一个冒烟测试
- 关键流程（登录、规则 CRUD）必须覆盖

---

## 文档规范

### 目录结构

```
docs/
├── README.md                    # 文档索引
├── design/                      # 设计文档
│   ├── 01-architecture.md       # 架构设计
│   ├── 02-api-design.md         # API 设计
│   └── 03-data-model.md         # 数据模型
├── development/                 # 开发文档
│   ├── 01-frontend.md           # 前端开发指南
│   ├── 02-backend.md            # 后端开发指南
│   └── 03-testing.md            # 测试指南
└── user-guide/                  # 用户文档
    ├── 01-quick-start.md
    └── 02-configuration.md
```

### 文档同步

- **设计-代码-文档** 必须保持一致
- 修改代码行为时，必须同步更新相关文档
- 新增功能时，先更新设计文档，再实现代码

---

## 代码风格

### TypeScript

- tsconfig 开启 strict，避免 any
- 优先使用 interface 定义对象类型
- 函数参数超过 3 个使用对象参数
- 异步函数使用 async/await，避免回调地狱

### Java

- 遵循 Alibaba Java 编码规范
- 使用 Lombok 简化样板代码
- 日志使用 SLF4J + Logback

---

## 模块化拆分规范

### 文件拆分阈值

- **硬性上限**：单个文件不超过 500 行
- **建议上限**：单个文件控制在 300 行内
- **函数/方法**：单个函数 < 50 行

### 拆分原则

- ✅ 按职责拆分，确保每个文件有清晰的职责
- ✅ 拆分后使用 `index.ts` 统一导出
- ❌ 不要机械拆分（破坏逻辑完整性）
- ❌ 不要过度拆分（单个函数独立成文件）

---

## Git 提交规范

### Commit 类型

| 类型     | 说明                   |
| -------- | ---------------------- |
| feat     | 新功能                 |
| fix      | 修复 Bug               |
| docs     | 文档更新               |
| style    | 代码格式（不影响功能） |
| refactor | 重构                   |
| perf     | 性能优化               |
| test     | 测试相关               |
| chore    | 构建/依赖更新          |
| ci       | CI 配置                |

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：

```
feat(flow): 添加流控规则批量导入功能

- 支持 JSON 格式导入
- 添加导入前校验
- 支持覆盖/追加模式
```

---

## 代码生成检查清单（Copilot 必须遵守）

生成代码前，确保：

- [ ] TypeScript 类型完整，无 any
- [ ] 异步操作有错误处理
- [ ] 用户可见错误有友好提示
- [ ] API 调用使用 React Query hooks
- [ ] 组件 Props 有 TypeScript 接口定义
- [ ] 复杂逻辑有注释说明
- [ ] 单一职责，函数 < 50 行
- [ ] 添加相应的测试
- [ ] 遵循现有目录和命名约定
- [ ] 文件行数 < 500 行

---

## 参考

- React 19 文档
- Chakra UI 文档
- React Query 文档
- Vite 文档
- Spring Boot 文档
- Sentinel 官方文档
