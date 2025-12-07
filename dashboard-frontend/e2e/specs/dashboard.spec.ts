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

    // 检查侧边栏导航是否可见（桌面版，使用 Box as="nav"）
    const sidebar = page.locator('nav:has-text("首页"), nav >> text=首页');
    await expect(sidebar.first()).toBeVisible({ timeout: 10000 });
  });

  test('should search apps', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 搜索功能
    await dashboardPage.searchApp('sentinel');
  });
});
