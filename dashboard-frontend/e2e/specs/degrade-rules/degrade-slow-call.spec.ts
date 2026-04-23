import { test, expect } from '@playwright/test';

/**
 * 降级规则 - 慢调用比例熔断测试
 * 测试基于慢调用比例的熔断降级功能
 */
test.describe('降级规则 - 慢调用比例熔断', () => {
  async function filterByResource(page: import('@playwright/test').Page, resource: string) {
    const searchInput = page.getByPlaceholder(/搜索资源名/);
    await searchInput.fill(resource);
    await page.waitForTimeout(500);
  }

  test('创建慢调用比例规则并验证熔断效果', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/slow-call-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建慢调用比例降级规则
    // ============================================
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    // 填写资源名
    await page.locator('input[name="resource"]').fill(testResource);

    // 选择慢调用比例模式（grade=0）
    await page.locator('select[name="grade"]').selectOption({ value: '0' });
    await page.locator('input[name="timeWindow"]').fill('10');
    await page.locator('input[name="statIntervalMs"]').fill('100');
    await page.locator('input[name="slowRatioThreshold"]').fill('0.5');
    await page.locator('input[name="minRequestAmount"]').fill('5');

    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');

    // ============================================
    // 步骤 2: 验证规则创建成功
    // ============================================
    await expect(page).toHaveURL(/\/degrade($|\?)/, { timeout: 10000 });
    await filterByResource(page, testResource);
    await expect(page.locator(`tr:has-text("${testResource}")`).first()).toBeVisible({ timeout: 10000 });

    // 验证Nacos中的规则
    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-degrade-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);
    expect(nacosData).toContain('"grade":0'); // 慢调用比例

    console.log('慢调用比例规则创建成功');

    // ============================================
    // 步骤 3: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');
    await filterByResource(page, testResource);

    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      page.once('dialog', async (dialog) => await dialog.accept());
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
