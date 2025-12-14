import { test, expect } from '@playwright/test';

/**
 * 流控规则 - 排队等待测试
 * 测试排队等待模式的流量控制
 */
test.describe('流控规则 - 排队等待', () => {
  test('创建排队等待规则', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/queue-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建排队等待规则
    // ============================================
    await page.click('a[href*="/flow/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/flow\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('input[name="count"]').fill('5');
    await page.locator('input[name="limitApp"]').fill('default');

    // 选择QPS模式
    const gradeSelect = page.locator('select[name="grade"]');
    if (await gradeSelect.isVisible({ timeout: 2000 })) {
      await gradeSelect.selectOption({ value: '1' }); // 1=QPS
    }

    // 选择排队等待流控效果（controlBehavior=2）
    const behaviorSelect = page.locator('select[name="controlBehavior"], [name="流控效果"]');
    if (await behaviorSelect.isVisible({ timeout: 2000 })) {
      await behaviorSelect.selectOption({ value: '2' }); // 2=排队等待
    }

    // 设置超时时间（毫秒）
    const timeoutInput = page.locator('input[name="maxQueueingTimeMs"], [name="超时时间"]');
    if (await timeoutInput.isVisible({ timeout: 2000 })) {
      await timeoutInput.fill('2000'); // 2秒超时
    }

    await page.click('button:has-text("确定"), button:has-text("保存")');
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 验证规则创建成功
    // ============================================
    await expect(page).toHaveURL(/\/flow($|\?)/, { timeout: 10000 });
    await expect(page.locator(`text="${testResource}"`).first()).toBeVisible({ timeout: 10000 });

    // 验证Nacos中的规则配置
    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-flow-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);
    expect(nacosData).toContain('"controlBehavior":2'); // 排队等待模式
    expect(nacosData).toContain('"maxQueueingTimeMs":2000');

    console.log('排队等待规则创建成功');

    // ============================================
    // 步骤 3: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
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
