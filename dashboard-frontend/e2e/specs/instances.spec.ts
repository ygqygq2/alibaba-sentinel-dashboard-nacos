import { test, expect } from '@playwright/test';
import { InstancesPage } from '../pages';

test.describe('机器管理', () => {
  let instancesPage: InstancesPage;

  test.beforeEach(async ({ page }) => {
    // 进入机器列表页面
    instancesPage = new InstancesPage(page);
    await instancesPage.goto();
  });

  test('显示机器管理页面', async () => {
    await instancesPage.expectLoaded();
  });

  test('显示已注册机器', async () => {
    await instancesPage.expectLoaded();
    const count = await instancesPage.getInstanceCount();
    expect(count).toBeGreaterThanOrEqual(1); // 至少有 token-server 的机器
  });

  test('显示健康状态的机器', async ({ page }) => {
    await instancesPage.expectLoaded();

    // 检查是否有机器在列表中
    const instanceCount = await instancesPage.getInstanceCount();

    if (instanceCount > 0) {
      // 验证至少有一台机器显示为健康状态
      const healthyInstances = await page.locator('tbody tr:has-text("健康"), tbody tr:has-text("在线")').count();
      expect(healthyInstances).toBeGreaterThanOrEqual(1);
    }
  });
});
