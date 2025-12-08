import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page, baseURL }) => {
  // 使用 playwright.config.ts 中配置的 baseURL
  // 开发模式：localhost:3000，CI 模式：localhost:8080
  const loginUrl = `${baseURL}/#/auth/sign-in`;

  // 访问登录页
  await page.goto(loginUrl);
  await page.waitForLoadState('networkidle');

  // 填写登录表单
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.locator('input[name="username"]').fill('sentinel');
  await page.locator('input[name="password"]').fill('sentinel');
  await page.locator('button[type="submit"]').click();

  // 等待登录成功，跳转到 dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

  // 保存认证状态（cookies + localStorage）
  await page.context().storageState({ path: authFile });
});
