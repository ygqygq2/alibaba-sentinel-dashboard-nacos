import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('导航', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
  });
  test('should navigate to overview page', async ({ page }) => {
    await page.click('nav a:has-text("首页")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test.skip('should select application from dropdown', async ({ page }) => {
    // TODO: 实现应用选择器功能后启用此测试
    await dashboardPage.expectLoaded();

    // 点击选择服务按钮
    await page.click('button:has-text("选择服务"), button:has-text("sentinel-token-server")');

    // 验证应用已选中
    await expect(page.locator('button:has-text("sentinel-token-server")')).toBeVisible({ timeout: 5000 });
  });

  test('should have navigation menu', async ({ page }) => {
    await dashboardPage.expectLoaded();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to cluster server list', async ({ page }) => {
    await page.goto('/dashboard/cluster/server');
    await expect(page.getByText('Token Server 列表', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to cluster client list', async ({ page }) => {
    await page.goto('/dashboard/cluster/client');
    await expect(page.getByText('Token Client 列表', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });
});
