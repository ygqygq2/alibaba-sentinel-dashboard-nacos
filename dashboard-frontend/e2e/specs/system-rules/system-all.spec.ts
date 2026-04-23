import { test, expect } from '@playwright/test';

async function createAndAssertSystemRule(
  page: import('@playwright/test').Page,
  options: {
    ruleType: 'load' | 'cpu' | 'rt' | 'thread' | 'qps';
    threshold: string;
    label: string;
    thresholdText: string;
  }
) {
  await page.click('a[href*="/system/create"], button:has-text("新增")');
  await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

  await page.locator('select[name="ruleType"]').selectOption({ value: options.ruleType });
  await page.locator('input[name="threshold"]').fill(options.threshold);

  await page.locator('button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  const row = page.locator('tr').filter({ hasText: options.label }).filter({ hasText: options.thresholdText }).first();
  await expect(row).toBeVisible({ timeout: 10000 });

  const deleteButton = row.locator('button[aria-label="删除"]').first();
  if (await deleteButton.isVisible({ timeout: 2000 })) {
    page.once('dialog', async (dialog) => await dialog.accept());
    await deleteButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * 系统规则 - 基础功能测试
 * 测试页面显示和各种系统保护规则的创建
 */
test.describe('系统规则 - 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/system');
    await page.waitForLoadState('networkidle');
  });

  test('显示系统规则页面', async ({ page }) => {
    await expect(page.getByText(/系统规则|系统保护/).first()).toBeVisible({ timeout: 10000 });
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/system/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('创建Load系统保护规则', async ({ page }) => {
    await createAndAssertSystemRule(page, {
      ruleType: 'load',
      threshold: '81',
      label: 'LOAD',
      thresholdText: '81',
    });
    console.log('Load系统保护规则创建成功');
  });

  test('创建CPU使用率保护规则', async ({ page }) => {
    await createAndAssertSystemRule(page, {
      ruleType: 'cpu',
      threshold: '0.83',
      label: 'CPU',
      thresholdText: '83%',
    });
    console.log('CPU使用率保护规则创建成功');
  });

  test('创建平均响应时间保护规则', async ({ page }) => {
    await createAndAssertSystemRule(page, {
      ruleType: 'rt',
      threshold: '1357',
      label: 'RT',
      thresholdText: '1357ms',
    });
    console.log('平均响应时间保护规则创建成功');
  });

  test('创建并发线程数保护规则', async ({ page }) => {
    await createAndAssertSystemRule(page, {
      ruleType: 'thread',
      threshold: '137',
      label: '线程数',
      thresholdText: '137',
    });
    console.log('并发线程数保护规则创建成功');
  });

  test('创建入口QPS保护规则', async ({ page }) => {
    await createAndAssertSystemRule(page, {
      ruleType: 'qps',
      threshold: '1321',
      label: '入口 QPS',
      thresholdText: '1321',
    });
    console.log('入口QPS保护规则创建成功');
  });
});
