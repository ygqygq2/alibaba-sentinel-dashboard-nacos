import { defineConfig, devices } from '@playwright/test';

// 环境配置
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 按顺序执行，避免并发问题
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // 单线程执行
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'e2e/test-results' }]]
    : [['list'], ['html', { outputFolder: 'e2e/test-results' }]],
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
    // API 测试（无需浏览器）- 匹配 *.api.spec.ts 和 smoke.spec.ts
    {
      name: 'api',
      testMatch: /\.(api|smoke)\.spec\.ts$/,
      use: {
        baseURL: DASHBOARD_URL,
      },
    },
    // UI 测试 - 匹配 auth.spec.ts, dashboard.spec.ts 等（排除 api 和 smoke）
    // CI 环境下使用 DASHBOARD_URL（前端已打包进 Java），本地使用 FRONTEND_URL（dev server）
    {
      name: 'chromium',
      testMatch: /^(?!.*\.(api|smoke)\.spec\.ts$).*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CI ? DASHBOARD_URL : FRONTEND_URL,
      },
    },
  ],

  // 本地开发时启动前端服务（UI 测试需要）
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
