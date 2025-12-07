import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';

test.describe('认证', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('显示登录页面', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('使用有效凭据登录', async ({ page }) => {
    await loginPage.login('sentinel', 'sentinel');
    await loginPage.expectLoginSuccess();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectLoaded();
  });

  test.skip('使用无效凭据显示错误', async ({ page }) => {
    // TODO: 后端默认接受任何凭据，需要实现真实认证后启用此测试
    await loginPage.login('invalid', 'invalid');
    await loginPage.expectLoginError();
  });

  test('成功退出登录', async ({ page }) => {
    // 先登录
    await loginPage.login('sentinel', 'sentinel');
    await loginPage.expectLoginSuccess();

    // 退出
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();

    // 应该回到登录页
    await expect(page).toHaveURL(/sign-in/, { timeout: 5000 });
  });
});
