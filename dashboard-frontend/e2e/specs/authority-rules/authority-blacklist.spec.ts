import { test, expect } from '@playwright/test';

/**
 * 授权规则 - 黑名单测试
 * 测试基于来源的黑名单授权控制
 */
test.describe('授权规则 - 黑名单', () => {
  test('创建黑名单授权规则', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/authority');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/api/blacklist-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建黑名单规则
    // ============================================
    await page.click('a[href*="/authority/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/authority\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);

    // 填写授权应用（黑名单）
    const limitAppInput = page.locator('input[name="limitApp"]');
    if (await limitAppInput.isVisible({ timeout: 2000 })) {
      await limitAppInput.fill('malicious-app'); // 禁止malicious-app访问
    }

    // 选择黑名单模式（strategy=1）
    const strategySelect = page.locator('select[name="strategy"]');
    if (await strategySelect.isVisible({ timeout: 2000 })) {
      await strategySelect.selectOption({ value: '1' }); // 1=黑名单
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 验证规则创建成功
    // ============================================
    await expect(page).toHaveURL(/\/authority($|\?)/, { timeout: 10000 });
    await expect(page.locator(`text="${testResource}"`).first()).toBeVisible({ timeout: 10000 });

    // 验证Nacos中的规则
    const nacosResponse = await request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-authority-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);
    expect(nacosData).toContain('"strategy":1'); // 黑名单

    console.log('黑名单授权规则创建成功');

    // ============================================
    // 步骤 3: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/authority');
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
