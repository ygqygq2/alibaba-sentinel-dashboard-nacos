# 测试指南

> 版本：1.0
> 更新日期：2024-12-05

---

## 1. 测试架构

本项目采用**分层测试架构**，分为外层集成测试和内层前端测试：

```
alibaba-sentinel-dashboard-nacos/
├── tests/e2e/                              # 外层：集成测试（Python + Playwright）
│   ├── conftest.py                         #   - 测试配置和 fixtures
│   ├── test_dashboard.py                   #   - Dashboard 端到端测试
│   ├── test_token_server.py                #   - Token Server 集群测试
│   └── requirements.txt                    #   - Python 依赖
│
└── sentinel-dashboard/webapp/resources/    # 前端项目
    ├── src/
    └── tests/                              # 内层：前端测试（Vitest）
        ├── unit/                           #   - hooks、utils 单元测试
        └── components/                     #   - 组件测试
```

### 1.1 分层说明

| 层级     | 位置                      | 技术栈                         | 职责                             | 运行时机                       |
| -------- | ------------------------- | ------------------------------ | -------------------------------- | ------------------------------ |
| **外层** | `tests/e2e/`              | Python + Pytest + Playwright   | 集成测试：服务间调用、端到端流程 | CI/CD、`./scripts/dev.sh test` |
| **内层** | `webapp/resources/tests/` | Vitest + React Testing Library | 前端测试：组件、hooks、工具函数  | 前端开发时、`pnpm test`        |

### 1.2 使用场景

**前端开发时**（内层测试）：

```bash
cd sentinel-dashboard/webapp/resources
pnpm test        # 运行单元测试
pnpm test:watch  # 监听模式
```

- ✅ 快速反馈（秒级）
- ✅ 不需要启动后端
- ✅ 测试前端逻辑、组件渲染

**集成测试时**（外层测试）：

```bash
./scripts/dev.sh test
```

- ✅ 启动完整环境（Nacos + Dashboard + Token Server）
- ✅ 测试端到端流程
- ✅ 测试服务间通信
- ✅ CI/CD 流水线使用

---

## 2. E2E 测试

### 2.1 环境配置

```bash
# 安装 Playwright
pnpm add -D @playwright/test

# 安装浏览器
npx playwright install
```

### 2.2 配置文件

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e/specs",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8080",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
```

### 2.3 Page Object 模式

```typescript
// tests/e2e/pages/login.page.ts
import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/auth/sign-in");
  }

  async login(username: string, password: string) {
    await this.page.fill('[name="username"]', username);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginSuccess() {
    await this.page.waitForURL("/dashboard");
  }

  async expectLoginError(message: string) {
    await this.page.locator(`text=${message}`).waitFor();
  }
}
```

```typescript
// tests/e2e/pages/dashboard.page.ts
import { Page } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  async selectApp(appName: string) {
    await this.page.click(`text=${appName}`);
  }

  async navigateToFlow() {
    await this.page.click("text=流控规则");
  }

  async getSidebarWidth() {
    const sidebar = this.page.locator(".sidebar");
    const box = await sidebar.boundingBox();
    return box?.width;
  }
}
```

### 2.4 测试用例模板

```typescript
// tests/e2e/specs/auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should login with valid credentials", async () => {
    await loginPage.login("sentinel", "sentinel");
    await loginPage.expectLoginSuccess();
  });

  test("should show error with invalid credentials", async () => {
    await loginPage.login("invalid", "invalid");
    await loginPage.expectLoginError("用户名或密码错误");
  });

  test("should logout successfully", async ({ page }) => {
    await loginPage.login("sentinel", "sentinel");
    await loginPage.expectLoginSuccess();

    await page.click("text=退出");
    await expect(page).toHaveURL("/auth/sign-in");
  });
});
```

```typescript
// tests/e2e/specs/flow-rule.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { FlowRulePage } from "../pages/flow-rule.page";

test.describe("Flow Rules", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("sentinel", "sentinel");
  });

  test("should display flow rules list", async ({ page }) => {
    const flowPage = new FlowRulePage(page);
    await flowPage.goto("sentinel-demo");
    await expect(page.locator("table")).toBeVisible();
  });

  test("should create new flow rule", async ({ page }) => {
    const flowPage = new FlowRulePage(page);
    await flowPage.goto("sentinel-demo");

    await flowPage.openAddModal();
    await flowPage.fillForm({
      resource: "/api/test",
      count: 100,
      grade: 1,
    });
    await flowPage.submit();

    await expect(page.locator("text=/api/test")).toBeVisible();
  });

  test("should delete flow rule", async ({ page }) => {
    const flowPage = new FlowRulePage(page);
    await flowPage.goto("sentinel-demo");

    await flowPage.deleteRule("/api/test");
    await flowPage.confirmDelete();

    await expect(page.locator("text=/api/test")).not.toBeVisible();
  });
});
```

### 2.5 运行测试

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定文件
npx playwright test tests/e2e/specs/auth.spec.ts

# UI 模式
npx playwright test --ui

# 查看报告
npx playwright show-report
```

---

## 3. 单元测试

### 3.1 配置

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
```

### 3.2 测试用例

```typescript
// src/lib/utils/format.test.ts
import { describe, it, expect } from "vitest";
import { formatQPS, formatRT } from "./format";

describe("formatQPS", () => {
  it("should format number with 2 decimal places", () => {
    expect(formatQPS(100.123)).toBe("100.12");
  });

  it("should handle zero", () => {
    expect(formatQPS(0)).toBe("0.00");
  });
});

describe("formatRT", () => {
  it("should format milliseconds", () => {
    expect(formatRT(150)).toBe("150 ms");
  });

  it("should format seconds for large values", () => {
    expect(formatRT(1500)).toBe("1.5 s");
  });
});
```

```typescript
// src/hooks/use-apps.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useApps } from "./use-apps";

const wrapper = ({ children }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;

describe("useApps", () => {
  it("should fetch apps successfully", async () => {
    vi.mock("@/lib/api/app", () => ({
      getApps: vi.fn().mockResolvedValue([{ app: "sentinel-demo", instances: [] }]),
    }));

    const { result } = renderHook(() => useApps(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].app).toBe("sentinel-demo");
  });
});
```

### 3.3 运行测试

```bash
# 运行单元测试
pnpm test

# 覆盖率
pnpm test --coverage
```

---

## 4. 测试覆盖要求

### 4.1 E2E 测试覆盖

| 模块     | 必须覆盖场景             |
| -------- | ------------------------ |
| 认证     | 登录成功、登录失败、退出 |
| 首页     | 页面加载、应用列表显示   |
| 侧边栏   | 应用搜索、导航切换       |
| 流控规则 | 列表、新增、编辑、删除   |
| 降级规则 | 列表、CRUD               |
| 热点参数 | 列表、CRUD               |
| 系统规则 | 列表、CRUD               |
| 授权规则 | 列表、CRUD               |
| 集群流控 | Token Server 显示        |

### 4.2 单元测试覆盖

| 模块       | 覆盖率目标 |
| ---------- | ---------- |
| API 客户端 | 80%        |
| Hooks      | 80%        |
| 工具函数   | 90%        |
| 状态管理   | 80%        |

---

## 5. CI 集成

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test --coverage

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: npx playwright install --with-deps
      - name: Start services
        run: |
          # 启动后端服务
          docker-compose up -d
          sleep 30
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. 最佳实践

### 6.1 测试隔离

- 每个测试独立，不依赖其他测试的状态
- 使用 `beforeEach` 重置状态
- 避免测试之间共享数据

### 6.2 测试命名

```typescript
// ✅ 好的命名
test("should display error when login with invalid password");
test("should create flow rule with valid input");

// ❌ 不好的命名
test("login test");
test("test1");
```

### 6.3 断言

```typescript
// ✅ 具体的断言
await expect(page.locator("text=登录成功")).toBeVisible();
expect(result.data).toHaveLength(3);

// ❌ 模糊的断言
expect(result).toBeTruthy();
```

### 6.4 等待策略

```typescript
// ✅ 等待特定元素
await page.locator("table").waitFor();
await expect(page).toHaveURL("/dashboard");

// ❌ 硬编码等待
await page.waitForTimeout(3000);
```
