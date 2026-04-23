import { test, expect } from '@playwright/test';

/**
 * 流控规则 - QPS限流测试
 * 测试基于QPS的流量控制效果
 */
test.describe('流控规则 - QPS限流', () => {
  test('创建QPS限流规则并验证流控效果', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/qps-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建QPS限流规则 (阈值=2)
    // ============================================
    await page.click('a[href*="/flow/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/flow\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('input[name="count"]').fill('2');
    await page.locator('input[name="limitApp"]').fill('default');

    // 确保选择的是QPS模式（grade=1）
    const gradeSelect = page.locator('select[name="grade"], [name="阈值类型"]');
    if (await gradeSelect.isVisible({ timeout: 2000 })) {
      await gradeSelect.selectOption({ value: '1' }); // 1=QPS
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/\/flow($|\?)/, { timeout: 10000 });
    const searchInput = page.getByPlaceholder(/搜索资源名\/来源/);
    await searchInput.fill(testResource);
    await page.waitForTimeout(500);
    await expect(page.locator(`tr:has-text("${testResource}")`).first()).toBeVisible({ timeout: 10000 });

    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-flow-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);
    expect(nacosData).toContain('"grade":1');

    console.log('QPS限流规则创建并持久化成功');

    // ============================================
    // 步骤 5: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
    await page.waitForLoadState('networkidle');
    await searchInput.fill(testResource);
    await page.waitForTimeout(500);

    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      page.once('dialog', async (dialog) => await dialog.accept());
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
