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

    await page.click('button:has-text("确定"), button:has-text("保存")');
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 等待规则推送到客户端
    // ============================================
    await page.waitForTimeout(2000);

    // ============================================
    // 步骤 3: 通过API验证流控效果
    // ============================================
    let passedCount = 0;
    let blockedCount = 0;

    // 快速连续发送10个请求（模拟高并发）
    for (let i = 0; i < 10; i++) {
      try {
        const response = await request.get(`http://localhost:8081${testResource}`);
        if (response.status() === 200) {
          passedCount++;
        } else if (response.status() === 429) {
          blockedCount++;
        }
      } catch (error) {
        // 被限流可能返回429或连接被拒绝
        blockedCount++;
      }
      // 小延迟确保在同一秒内
      await page.waitForTimeout(50);
    }

    // ============================================
    // 步骤 4: 验证限流效果
    // ============================================
    // QPS=2，10个请求应该有多个被限流
    expect(blockedCount).toBeGreaterThan(0);
    expect(passedCount).toBeLessThanOrEqual(3); // 允许少量误差

    console.log(`QPS限流测试结果: 通过=${passedCount}, 限流=${blockedCount}`);

    // ============================================
    // 步骤 5: 清理测试数据
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
    await page.waitForLoadState('networkidle');

    const deleteButton = page
      .locator(
        `tr:has-text("${testResource}") button:has-text("删除"), tr:has-text("${testResource}") [aria-label*="删除"]`
      )
      .first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();
      const confirmButton = page.locator('button:has-text("确定"), button:has-text("确认")').first();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
    }
  });
});
