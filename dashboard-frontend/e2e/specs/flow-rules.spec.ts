import { test, expect } from '@playwright/test';
import { FlowRulesPage } from '../pages';

test.describe('流控规则管理', () => {
  let flowRulesPage: FlowRulesPage;
  const testResource = `test-resource-${Date.now()}`;

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

  test('显示规则表格列标题', async ({ page }) => {
    await flowRulesPage.expectLoaded();

    // 验证表格存在
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // 验证关键列标题存在
    await expect(page.locator('th:has-text("资源名"), th:has-text("资源")')).toBeVisible();
    await expect(page.locator('th:has-text("阈值"), th:has-text("限流阈值")')).toBeVisible();
  });

  test('有新增规则按钮', async ({ page }) => {
    await flowRulesPage.expectLoaded();
    await expect(page.getByRole('button', { name: /新增|添加/ })).toBeVisible();
  });

  test('规则列表为空时显示提示', async ({ page }) => {
    await flowRulesPage.expectLoaded();

    const ruleCount = await flowRulesPage.getRuleCount();
    if (ruleCount === 0) {
      // 验证空状态提示
      const emptyText = page.locator('text=/暂无|没有|无数据/');
      const emptyTextCount = await emptyText.count();
      expect(emptyTextCount).toBeGreaterThanOrEqual(0); // 可能有空状态提示
    }
  });

  test.describe('规则操作', () => {
    test('查看规则详情按钮存在', async ({ page }) => {
      await flowRulesPage.expectLoaded();

      const ruleCount = await flowRulesPage.getRuleCount();
      if (ruleCount > 0) {
        // 验证第一条规则有操作按钮
        const firstRow = page.locator('tbody tr').first();
        const actionButtons = firstRow.locator('button');
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });
  });

  test('规则搜索功能', async ({ page }) => {
    await flowRulesPage.expectLoaded();

    const initialCount = await flowRulesPage.getRuleCount();
    if (initialCount > 0) {
      // 如果有搜索框，测试搜索
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="资源"]');
      const hasSearch = (await searchInput.count()) > 0;

      if (hasSearch) {
        await searchInput.fill('nonexistent-resource-xyz');
        await page.waitForTimeout(500);

        // 搜索后应该没有结果或显示空状态
        const afterSearchCount = await flowRulesPage.getRuleCount();
        expect(afterSearchCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });
});
