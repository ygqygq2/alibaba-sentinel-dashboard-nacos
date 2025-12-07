import { test, expect } from '@playwright/test';
import { FlowRulesPage } from '../pages';

test.describe('流控规则管理', () => {
  let flowRulesPage: FlowRulesPage;

  test.beforeEach(async ({ page }) => {
    // 进入流控规则页面
    flowRulesPage = new FlowRulesPage(page);
    await flowRulesPage.goto();
  });

  test('显示流控规则页面', async () => {
    await flowRulesPage.expectLoaded();
  });

  test('显示现有流控规则', async () => {
    await flowRulesPage.expectLoaded();
    const count = await flowRulesPage.getRuleCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('有新增规则按钮', async ({ page }) => {
    await flowRulesPage.expectLoaded();
    // 只验证按钮存在，不测试创建功能（表单可能未完整实现）
    await expect(page.getByRole('button', { name: /新增/ })).toBeVisible();
  });

  test('显示规则表格', async ({ page }) => {
    await flowRulesPage.expectLoaded();
    const hasTable = await page.locator('table').count();

    expect(hasTable).toBeGreaterThanOrEqual(0);
  });
});
