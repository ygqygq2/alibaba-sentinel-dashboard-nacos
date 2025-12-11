import { test, expect } from '@playwright/test';

test.describe('授权规则管理', () => {
  test.beforeEach(async ({ page }) => {
    // 进入授权规则页面
    await page.goto('/dashboard/apps/sentinel-token-server/authority');
    await page.waitForLoadState('networkidle');
  });

  test('显示授权规则页面', async ({ page }) => {
    await expect(page.getByText(/授权规则|访问控制/).first()).toBeVisible({ timeout: 10000 });
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/authority/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('授权规则完整流程', () => {
  test('创建 → 验证显示 → 持久化 → 修改 → 删除（白名单）', async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/authority');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/e2e-authority-test-${timestamp}`;

    // ============================================
    // 步骤 1: 创建授权规则（白名单）
    // ============================================
    await page.click('a[href*="/authority/create"], a[href*="/authority/new"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/authority\/(create|new)/, { timeout: 5000 });

    // 填写资源名
    await page.locator('input[name="resource"]').fill(testResource);
    // 选择授权类型：白名单（默认 0）
    await page.locator('select[name="strategy"]').selectOption({ value: '0' });
    // 填写流控应用
    await page.locator('textarea[name="limitApp"]').fill('app1,app2');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/authority(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(1000);

    // ============================================
    // 步骤 2: 验证规则在列表中显示
    // ============================================
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 5000 });

    // ============================================
    // 步骤 3: 刷新页面验证持久化（Nacos）
    // ============================================
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 5000 });

    // ============================================
    // 步骤 4: 修改规则
    // ============================================
    const editButton = page.locator(`tr:has-text("${testResource}") button[aria-label="编辑"]`).first();
    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();
      await expect(page).toHaveURL(/\/authority\/\d+/, { timeout: 5000 });

      // 修改流控应用
      const limitAppInput = page.locator('textarea[name="limitApp"]');
      await limitAppInput.clear();
      await limitAppInput.fill('app1,app2,app3');

      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/authority(?:$|\?)/, { timeout: 5000 });
      await page.waitForTimeout(1000);

      // 验证修改成功
      const row = page.locator(`tr:has-text("${testResource}")`);
      await expect(row).toBeVisible();
    }

    // ============================================
    // 步骤 5: 删除规则
    // ============================================
    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();

    // 处理 window.confirm 弹窗
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(testResource);
      await dialog.accept();
    });
    await deleteButton.click();
    await page.waitForTimeout(1000);

    // 验证删除成功
    await expect(page.getByText(testResource)).not.toBeVisible({ timeout: 3000 });
  });

  test('创建黑名单规则', async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/authority');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/e2e-authority-blacklist-${timestamp}`;

    // 创建黑名单规则
    await page.click('a[href*="/authority/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/authority\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    // 选择授权类型：黑名单
    await page.locator('select[name="strategy"]').selectOption({ value: '1' });
    await page.locator('textarea[name="limitApp"]').fill('blocked-app');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/authority(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 验证创建成功
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 5000 });

    // 清理：删除规则
    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    page.once('dialog', async (dialog) => await dialog.accept());
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });
});
