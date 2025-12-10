import { test, expect } from '@playwright/test';
import { InstancesPage } from '../pages';

test.describe('实例管理', () => {
  let instancesPage: InstancesPage;

  test.beforeEach(async ({ page }) => {
    // 进入实例列表页面
    instancesPage = new InstancesPage(page);
    await instancesPage.goto();
  });

  test('显示实例管理页面', async () => {
    await instancesPage.expectLoaded();
  });

  test('显示已注册实例', async () => {
    await instancesPage.expectLoaded();
    const count = await instancesPage.getInstanceCount();
    expect(count).toBeGreaterThanOrEqual(1); // 至少有 token-server 的实例
  });

  test('显示健康状态的实例', async ({ page }) => {
    await instancesPage.expectLoaded();

    // 检查是否有实例在列表中
    const instanceCount = await instancesPage.getInstanceCount();

    if (instanceCount > 0) {
      // 验证至少有一台实例显示为健康状态
      const healthyInstances = await page.locator('tbody tr:has-text("健康"), tbody tr:has-text("在线")').count();
      expect(healthyInstances).toBeGreaterThanOrEqual(1);
    }
  });

  test('实例列表显示完整信息', async ({ page }) => {
    await instancesPage.expectLoaded();

    const instanceCount = await instancesPage.getInstanceCount();
    if (instanceCount > 0) {
      const firstRow = page.locator('tbody tr').first();

      // 验证必须字段存在
      await expect(firstRow.locator('td').nth(0)).toBeVisible(); // IP
      await expect(firstRow.locator('td').nth(1)).toBeVisible(); // 端口
      await expect(firstRow.locator('td').nth(2)).toBeVisible(); // 状态
      await expect(firstRow.locator('td').nth(3)).toBeVisible(); // 最后心跳时间
    }
  });

  test('Token Server 实例已注册', async ({ page }) => {
    await instancesPage.expectLoaded();

    // 验证 token-server 容器的实例存在
    const tokenServerRow = page.locator('tbody tr:has-text("token-server"), tbody tr:has-text("8719")');
    await expect(tokenServerRow.first()).toBeVisible({ timeout: 10000 });
  });

  test('实例心跳时间显示', async ({ page }) => {
    await instancesPage.expectLoaded();

    const instanceCount = await instancesPage.getInstanceCount();
    if (instanceCount > 0) {
      // 验证心跳时间格式正确（应该是时间戳或相对时间）
      const heartbeatCell = page.locator('tbody tr').first().locator('td').nth(3);
      const heartbeatText = await heartbeatCell.textContent();

      // 心跳时间不应为空
      expect(heartbeatText?.trim().length).toBeGreaterThan(0);
    }
  });
});
