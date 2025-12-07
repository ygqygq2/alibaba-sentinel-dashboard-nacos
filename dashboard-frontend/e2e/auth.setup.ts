import { test as setup, expect } from '@playwright/test';
import { DASHBOARD_URL } from './config';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 访问登录页
  await page.goto(`${DASHBOARD_URL}/#/auth/sign-in`);
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
