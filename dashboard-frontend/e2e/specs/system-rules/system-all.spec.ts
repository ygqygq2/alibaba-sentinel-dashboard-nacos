import { test, expect } from '@playwright/test';

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

  test('创建Load系统保护规则', async ({ page, request }) => {
    await page.click('a[href*="/system/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

    // 设置Load阈值
    const loadInput = page.locator('input[name="highestSystemLoad"]');
    if (await loadInput.isVisible({ timeout: 2000 })) {
      await loadInput.fill('8.0');
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
    console.log('Load系统保护规则创建成功');
  });

  test('创建CPU使用率保护规则', async ({ page, request }) => {
    await page.click('a[href*="/system/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

    // 设置CPU使用率阈值（0-1之间）
    const cpuInput = page.locator('input[name="highestCpuUsage"]');
    if (await cpuInput.isVisible({ timeout: 2000 })) {
      await cpuInput.fill('0.8'); // 80%
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
    console.log('CPU使用率保护规则创建成功');
  });

  test('创建平均响应时间保护规则', async ({ page, request }) => {
    await page.click('a[href*="/system/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

    // 设置平均RT阈值（毫秒）
    const rtInput = page.locator('input[name="avgRt"]');
    if (await rtInput.isVisible({ timeout: 2000 })) {
      await rtInput.fill('1000'); // 1秒
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
    console.log('平均响应时间保护规则创建成功');
  });

  test('创建并发线程数保护规则', async ({ page, request }) => {
    await page.click('a[href*="/system/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

    // 设置线程数阈值
    const threadInput = page.locator('input[name="maxThread"]');
    if (await threadInput.isVisible({ timeout: 2000 })) {
      await threadInput.fill('100');
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
    console.log('并发线程数保护规则创建成功');
  });

  test('创建入口QPS保护规则', async ({ page, request }) => {
    await page.click('a[href*="/system/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/system\/(create|new)/, { timeout: 5000 });

    // 设置QPS阈值
    const qpsInput = page.locator('input[name="qps"]');
    if (await qpsInput.isVisible({ timeout: 2000 })) {
      await qpsInput.fill('1000');
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/\/system($|\?)/, { timeout: 10000 });
    console.log('入口QPS保护规则创建成功');
  });
});
