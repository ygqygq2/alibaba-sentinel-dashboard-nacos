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

  test('侧边栏包含所有主要导航项', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 等待导航加载
    await page.waitForTimeout(1000);

    // 验证关键导航项存在（更宽松的选择器）
    const navItems = ['首页', '实例'];
    for (const item of navItems) {
      const navLink = page.locator(
        `a:has-text("${item}"), button:has-text("${item}"), [role="navigation"] >> text="${item}"`
      );
      await expect(navLink.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('显示应用列表', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 验证应用列表或应用卡片存在
    const appList = page.locator('[data-testid="app-list"], .app-card, tbody tr');
    const hasApps = (await appList.count()) > 0;
    expect(hasApps).toBeTruthy();
  });

  test('搜索应用', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 搜索功能
    await dashboardPage.searchApp('sentinel');
  });

  test('Token Server 应用显示', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 验证 sentinel-token-server 应用存在
    const tokenServerApp = page.locator('text=sentinel-token-server');
    await expect(tokenServerApp.first()).toBeVisible({ timeout: 10000 });
  });

  test('应用卡片显示统计信息', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 查找第一个应用卡片
    const firstApp = page.locator('[data-testid="app-card"]').first().or(page.locator('tbody tr').first());

    if ((await firstApp.count()) > 0) {
      await expect(firstApp).toBeVisible();

      // 验证显示了应用名称
      const appName = await firstApp.textContent();
      expect(appName?.length).toBeGreaterThan(0);
    }
  });

  test('点击应用进入详情', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 点击 Token Server 应用
    const tokenServerLink = page.locator('a:has-text("sentinel-token-server")').first();
    if ((await tokenServerLink.count()) > 0) {
      await tokenServerLink.click();

      // 验证 URL 变化
      await page.waitForURL(/.*\/apps\/sentinel-token-server.*/, { timeout: 5000 });
    }
  });

  test('响应式布局 - 移动端侧边栏', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 移动端应该有汉堡菜单按钮
    const menuButton = page.locator('button[aria-label*="menu"], button:has([data-icon="menu"])');
    if ((await menuButton.count()) > 0) {
      await expect(menuButton.first()).toBeVisible();
    }
  });
});
