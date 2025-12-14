import { test, expect } from '@playwright/test';

/**
 * 降级规则 - 基础功能测试
 * 测试页面显示、基础CRUD操作
 */
test.describe('降级规则 - 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');
  });

  test('显示降级规则页面', async ({ page }) => {
    await expect(page.getByText(/降级规则|熔断降级/).first()).toBeVisible({ timeout: 10000 });
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/degrade/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });
});
