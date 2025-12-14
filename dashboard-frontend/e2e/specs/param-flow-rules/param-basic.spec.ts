import { test, expect } from '@playwright/test';

/**
 * 热点参数规则 - 基础功能测试
 * 测试页面显示、基础CRUD操作
 */
test.describe('热点参数规则 - 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/param-flow');
    await page.waitForLoadState('networkidle');
  });

  test('显示热点参数规则页面', async ({ page }) => {
    await expect(page.getByText(/热点参数|热点规则/).first()).toBeVisible({ timeout: 10000 });
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/param-flow/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });
});
