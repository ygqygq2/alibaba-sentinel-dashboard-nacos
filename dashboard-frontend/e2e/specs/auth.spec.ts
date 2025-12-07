import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('sentinel', 'sentinel');
    await loginPage.expectLoginSuccess();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectLoaded();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.login('invalid', 'invalid');
    // 应该显示错误信息或停留在登录页
    await expect(page).toHaveURL(/sign-in|login/);
  });

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await loginPage.login('sentinel', 'sentinel');
    await loginPage.expectLoginSuccess();

    // 退出
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.logout();

    // 应该回到登录页
    await expect(page).toHaveURL(/sign-in|login/);
  });
});
