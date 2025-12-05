import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // 先登录
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('sentinel', 'sentinel');
    await loginPage.expectLoginSuccess();

    dashboardPage = new DashboardPage(page);
  });

  test('should display dashboard home', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 侧边栏应该可见
    const sidebar = page.locator('nav, [data-testid="sidebar"], aside');
    await expect(sidebar.first()).toBeVisible();
  });

  test('should search apps', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 搜索功能
    await dashboardPage.searchApp('sentinel');
  });
});
