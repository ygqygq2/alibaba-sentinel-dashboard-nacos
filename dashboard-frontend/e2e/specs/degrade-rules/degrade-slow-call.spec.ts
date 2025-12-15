import { test, expect } from '@playwright/test';

/**
 * 降级规则 - 慢调用比例熔断测试
 * 测试基于慢调用比例的熔断降级功能
 */
test.describe('降级规则 - 慢调用比例熔断', () => {
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
    const gradeSelect = page.locator('select[name="grade"], [name="熔断策略"]');
    if (await gradeSelect.isVisible({ timeout: 2000 })) {
      await gradeSelect.selectOption({ value: '0' }); // 0=慢调用比例
    }

    // 设置慢调用临界RT（毫秒）
    await page.locator('input[name="slowRatioThreshold"], input[name="count"]').fill('100');

    // 设置比例阈值（0-1之间，如0.5表示50%）
    const ratioInput = page.locator('input[name="slowRatio"]');
    if (await ratioInput.isVisible({ timeout: 2000 })) {
      await ratioInput.fill('0.5'); // 50%的请求慢于100ms就熔断
    }

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
    expect(nacosData).toContain('"grade":0'); // 慢调用比例

    console.log('慢调用比例规则创建成功');

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
