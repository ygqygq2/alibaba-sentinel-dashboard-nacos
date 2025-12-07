import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('仪表盘', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
  });

  test('显示仪表盘首页', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('显示侧边栏导航', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 检查侧边栏导航是否可见（桌面版，使用 Box as="nav"）
    const sidebar = page.locator('nav:has-text("首页"), nav >> text=首页');
    await expect(sidebar.first()).toBeVisible({ timeout: 10000 });
  });

  test('搜索应用', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 搜索功能
    await dashboardPage.searchApp('sentinel');
  });
});
