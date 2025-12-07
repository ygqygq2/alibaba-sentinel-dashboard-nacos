import { defineConfig, devices } from '@playwright/test';

// 环境配置
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true, // 启用并行测试
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined, // CI 用 4 workers，本地自动检测 CPU 核心数
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'e2e/test-results', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'e2e/test-results', open: 'never' }]],
  timeout: 60000,

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  },

  projects: [
    // Setup project - 登录一次，保存认证状态（手动运行：pnpm test:e2e:setup）
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // API 测试（无需浏览器）- 匹配 *.api.spec.ts 和 smoke.spec.ts
    {
      name: 'api',
      testMatch: /\.(api|smoke)\.spec\.ts$/,
      use: {
        baseURL: DASHBOARD_URL,
      },
    },
    // 认证测试 - 不使用登录状态（手动运行：pnpm test:e2e:auth）
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CI ? DASHBOARD_URL : FRONTEND_URL,
        // 不使用 storageState，保持未登录状态
      },
    },
    // UI 测试 - 复用登录状态（默认运行）
    {
      name: 'chromium',
      testIgnore: [/\.(api|smoke)\.spec\.ts$/, /auth\.spec\.ts$/],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CI ? DASHBOARD_URL : FRONTEND_URL,
        // 复用认证状态
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'], // 依赖 setup，自动运行
    },
  ], // 本地开发时启动前端服务（UI 测试需要）
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
