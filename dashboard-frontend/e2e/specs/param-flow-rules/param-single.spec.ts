import { test, expect } from '@playwright/test';

/**
 * 热点参数规则 - 单参数限流测试
 * 测试基于单个参数值的热点限流
 */
test.describe('热点参数规则 - 单参数限流', () => {
  test('创建单参数热点规则', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/param-flow');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/param-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建热点参数规则
    // ============================================
    await page.click('a[href*="/param-flow/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/param-flow\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('input[name="count"]').fill('5'); // 单机阈值

    // 设置参数索引（第一个参数）
    const paramIdxInput = page.locator('input[name="paramIdx"]');
    if (await paramIdxInput.isVisible({ timeout: 2000 })) {
      await paramIdxInput.fill('0');
    }

    await page.click('button:has-text("确定"), button:has-text("保存")');
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 验证规则创建成功
    // ============================================
    await expect(page).toHaveURL(/\/param-flow($|\?)/, { timeout: 10000 });
    await expect(page.locator(`text="${testResource}"`).first()).toBeVisible({ timeout: 10000 });

    // 验证Nacos中的规则
    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-param-flow-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);

    console.log('单参数热点规则创建成功');

    // ============================================
    // 步骤 3: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/param-flow');
    await page.waitForLoadState('networkidle');

    const deleteButton = page.locator(`tr:has-text("${testResource}") button:has-text("删除")`).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();
      const confirmButton = page.locator('button:has-text("确定")').first();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
    }
  });
});
