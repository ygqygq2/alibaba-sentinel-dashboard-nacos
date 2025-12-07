import { test, expect } from '@playwright/test';
import { MachinesPage } from '../pages';

test.describe('机器管理', () => {
  let machinesPage: MachinesPage;

  test.beforeEach(async ({ page }) => {
    // 进入机器列表页面
    machinesPage = new MachinesPage(page);
    await machinesPage.goto();
  });

  test('显示机器管理页面', async () => {
    await machinesPage.expectLoaded();
  });

  test('显示已注册机器', async () => {
    await machinesPage.expectLoaded();
    const count = await machinesPage.getMachineCount();
    expect(count).toBeGreaterThanOrEqual(1); // 至少有 token-server 的机器
  });

  test('显示健康状态的机器', async ({ page }) => {
    await machinesPage.expectLoaded();

    // 检查是否有机器在列表中
    const machineCount = await machinesPage.getMachineCount();

    if (machineCount > 0) {
      // 验证至少有一台机器显示为健康状态
      const healthyMachines = await page.locator('tbody tr:has-text("健康"), tbody tr:has-text("在线")').count();
      expect(healthyMachines).toBeGreaterThanOrEqual(1);
    }
  });
});
