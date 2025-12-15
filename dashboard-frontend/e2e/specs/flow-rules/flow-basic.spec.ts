import { test, expect } from '@playwright/test';

/**
 * 流控规则 - 基础功能测试
 * 测试页面显示、基础CRUD操作
 */
test.describe('流控规则 - 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/flow');
    await page.waitForLoadState('networkidle');
  });

  test('显示流控规则页面', async ({ page }) => {
    await expect(page.getByText(/流控规则|流量控制/).first()).toBeVisible({ timeout: 10000 });
  });

  test('显示规则表格', async ({ page }) => {
    await page.waitForTimeout(2000);
    const mainContent = page.locator('main, [role="main"], .content, table, .chakra-card');
    const hasContent = (await mainContent.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/flow/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('创建 → 验证显示 → 持久化 → 修改 → 删除', async ({ page }) => {
    const timestamp = Date.now();
    const testResource = `/e2e-flow-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建流控规则
    // ============================================
    await page.click('a[href*="/flow/create"], a[href*="/flow/new"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/flow\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('input[name="count"]').fill('10');
    await page.locator('input[name="limitApp"]').fill('default');

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // ============================================
    // 步骤 2: 返回列表页验证规则是否显示
    // ============================================
    await expect(page).toHaveURL(/\/flow($|\?)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text="${testResource}"`).first()).toBeVisible({ timeout: 10000 });

    // ============================================
    // 步骤 3: 验证规则持久化到 Nacos
    // ============================================
    const nacosResponse = await page.request.get(
      'http://localhost:8848/nacos/v1/cs/configs?dataId=sentinel-token-server-flow-rules&group=SENTINEL_GROUP&username=nacos&password=nacos'
    );
    expect(nacosResponse.ok()).toBeTruthy();

    const nacosData = await nacosResponse.text();
    expect(nacosData).toContain(testResource);

    // ============================================
    // 步骤 4: 修改规则（将阈值从 10 改为 20）
    // ============================================
    const editButton = page
      .locator(
        `tr:has-text("${testResource}") button:has-text("编辑"), tr:has-text("${testResource}") a:has-text("编辑")`
      )
      .first();
    await editButton.click();
    await expect(page).toHaveURL(/\/flow\/edit/, { timeout: 5000 });

    await page.locator('input[name="count"]').fill('20');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // 返回列表页验证修改后的阈值
    await expect(page).toHaveURL(/\/flow($|\?)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const updatedRow = page.locator(`tr:has-text("${testResource}")`).first();
    await expect(updatedRow.locator('text=/20/')).toBeVisible({ timeout: 5000 });

    // ============================================
    // 步骤 5: 删除规则
    // ============================================
    const deleteButton = page
      .locator(
        `tr:has-text("${testResource}") button:has-text("删除"), tr:has-text("${testResource}") [aria-label*="删除"]`
      )
      .first();
    await deleteButton.click();

    // 确认删除（可能有确认对话框）
    const confirmButton = page
      .locator('button:has-text("确定"), button:has-text("确认"), [role="dialog"] button:has-text("删除")')
      .first();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    await page.waitForTimeout(2000);

    // 验证规则已从列表中移除
    await expect(page.locator(`text="${testResource}"`)).toHaveCount(0, { timeout: 5000 });
  });
});
