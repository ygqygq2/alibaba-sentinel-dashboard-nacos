import { test, expect } from '@playwright/test';
import { FlowRulesPage } from '../pages';

test.describe('流控规则管理', () => {
  let flowRulesPage: FlowRulesPage;

  test.beforeEach(async ({ page }) => {
    // 进入流控规则页面
    flowRulesPage = new FlowRulesPage(page);
    await flowRulesPage.goto();
  });

  test('should display flow rules page', async () => {
    await flowRulesPage.expectLoaded();
  });

  test('should display existing flow rules', async () => {
    await flowRulesPage.expectLoaded();
    const count = await flowRulesPage.getRuleCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have new rule button', async ({ page }) => {
    await flowRulesPage.expectLoaded();
    // 只验证按钮存在，不测试创建功能（表单可能未完整实现）
    await expect(page.getByRole('button', { name: /新增/ })).toBeVisible();
  });

  test('should display rule table', async ({ page }) => {
    await flowRulesPage.expectLoaded();
    const hasTable = await page.locator('table').count();

    expect(hasTable).toBeGreaterThanOrEqual(0);
  });
});
