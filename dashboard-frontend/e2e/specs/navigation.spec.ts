import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('导航', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto(); // 先进入 dashboard 页面
  });

  test('导航到概览页面', async ({ page }) => {
    await page.click('nav a:has-text("首页")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test.skip('从下拉菜单选择应用', async ({ page }) => {
    // TODO: 实现应用选择器功能后启用此测试
    await dashboardPage.expectLoaded();

    // 点击选择服务按钮
    await page.click('button:has-text("选择服务"), button:has-text("sentinel-token-server")');

    // 验证应用已选中
    await expect(page.locator('button:has-text("sentinel-token-server")')).toBeVisible({ timeout: 5000 });
  });

  test('有导航菜单', async ({ page }) => {
    await dashboardPage.expectLoaded();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('导航到集群 Server 列表', async ({ page }) => {
    await page.goto('/dashboard/cluster/server');
    await expect(page.getByText('Token Server 列表', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });

  test('导航到集群 Client 列表', async ({ page }) => {
    await page.goto('/dashboard/cluster/client');
    await expect(page.getByText('Token Client 列表', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });
});
