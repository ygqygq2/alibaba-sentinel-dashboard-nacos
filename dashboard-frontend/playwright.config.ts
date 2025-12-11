import { defineConfig, devices } from '@playwright/test';

// 环境配置
// 本地开发：CI 未设置，使用前端开发服务器 3000
// CI/生产：CI=true，使用打包后的前端 8080
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// 根据 CI 环境变量选择 URL（统一使用 CI 变量）
const BASE_URL = process.env.CI ? DASHBOARD_URL : FRONTEND_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true, // 启用并行测试
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined, // CI 减少到 2 workers 避免资源竞争
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'e2e/test-results', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'e2e/test-results', open: 'never' }]],
  timeout: 90000, // CI 环境增加超时到 90 秒

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // 增加操作超时
    navigationTimeout: 30000, // 增加导航超时
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  },

  projects: [
    // Setup project - 登录一次，保存认证状态（手动运行：pnpm test:e2e:setup）
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts$/,
      use: {
        // 使用与 UI 测试相同的 baseURL，确保 localStorage 共享
        // 本地开发：3000，CI：8080
        baseURL: BASE_URL,
      },
    },

    // API 测试（无需浏览器）- 匹配 *.api.spec.ts 和 smoke.spec.ts
    {
      name: 'api',
      testMatch: /(\.(api)|smoke)\.spec\.ts$/,
      use: {
        baseURL: DASHBOARD_URL, // API 始终访问后端 8080
      },
    },
    // 认证测试 - 不使用登录状态（手动运行：pnpm test:e2e:auth）
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        // 不使用 storageState，保持未登录状态
      },
    },
    // UI 测试 - 复用登录状态（默认运行）
    {
      name: 'chromium',
      testIgnore: [/\.(api|smoke)\.spec\.ts$/, /auth\.spec\.ts$/],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
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
