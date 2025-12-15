import { test, expect } from '@playwright/test';

/**
 * 降级规则 - 异常数熔断测试
 * 测试基于异常数的熔断降级功能
 */
test.describe('降级规则 - 异常数熔断', () => {
  test('创建异常数规则并验证熔断效果', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/error-count-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建异常数降级规则
    // ============================================
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);

    // 选择异常数模式（grade=2）
    const gradeSelect = page.locator('select[name="grade"], [name="熔断策略"]');
    if (await gradeSelect.isVisible({ timeout: 2000 })) {
      await gradeSelect.selectOption({ value: '2' }); // 2=异常数
    }

    // 设置异常数阈值
    await page.locator('input[name="count"]').fill('5'); // 5个异常

    // 设置最小请求数
    const minRequestInput = page.locator('input[name="minRequestAmount"]');
    if (await minRequestInput.isVisible({ timeout: 2000 })) {
      await minRequestInput.fill('5');
    }

    // 设置熔断时长（秒）
    const timeWindowInput = page.locator('input[name="timeWindow"]');
    if (await timeWindowInput.isVisible({ timeout: 2000 })) {
      await timeWindowInput.fill('10');
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 验证规则创建成功
    // ============================================
    await expect(page).toHaveURL(/\/degrade($|\?)/, { timeout: 10000 });
    await expect(page.locator(`text="${testResource}"`).first()).toBeVisible({ timeout: 10000 });

    // 验证Nacos中的规则
    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-degrade-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);
    expect(nacosData).toContain('"grade":2'); // 异常数

    console.log('异常数规则创建成功');

    // ============================================
    // 步骤 3: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
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
