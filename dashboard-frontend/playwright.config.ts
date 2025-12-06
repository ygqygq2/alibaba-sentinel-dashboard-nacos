import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 按顺序执行，避免并发问题
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // 单线程执行
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'e2e/test-results' }]]
    : [['list'], ['html', { outputFolder: 'e2e/test-results' }]],
  timeout: 60000, // 增加超时时间

  use: {
    baseURL: process.env.DASHBOARD_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 自定义环境变量
    extraHTTPHeaders: {
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  },

  // 全局设置
  globalSetup: undefined,
  globalTeardown: undefined,

  projects: [
    // API 测试（无需浏览器）- 匹配 *.api.spec.ts 和 smoke.spec.ts
    {
      name: 'api',
      testMatch: /\.(api|smoke)\.spec\.ts$/,
      use: {
        baseURL: process.env.DASHBOARD_URL || 'http://localhost:8080',
      },
    },
    // UI 测试 - 匹配其他 .spec.ts 文件
    {
      name: 'chromium',
      testIgnore: /\.(api|smoke)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // CI 环境不启动 webServer，由 docker-compose 提供
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
