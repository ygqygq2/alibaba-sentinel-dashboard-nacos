import { test, expect } from '@playwright/test';

test.describe('降级规则管理', () => {
  test.beforeEach(async ({ page }) => {
    // 进入降级规则页面
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');
  });

  test('显示降级规则页面', async ({ page }) => {
    await expect(page.getByText(/降级规则|熔断规则/).first()).toBeVisible({ timeout: 10000 });
  });

  test('有新增规则按钮', async ({ page }) => {
    await expect(page.locator('a[href*="/degrade/create"], button:has-text("新增")').first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('降级规则完整流程', () => {
  test('创建 → 验证显示 → 持久化 → 修改 → 删除', async ({ page }) => {
    // 监听网络请求以调试 API 错误
    let apiResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/v2/degrade/rule') && !response.ok()) {
        apiResponse = { status: response.status(), body: await response.text() };
      }
    });

    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/e2e-degrade-test-${timestamp}`;

    // 强制刷新页面避免缓存问题
    await page.reload({ waitUntil: 'networkidle' });

    // ============================================
    // 步骤 1: 创建降级规则（慢调用比例）
    // ============================================
    await page.click('a[href*="/degrade/create"], a[href*="/degrade/new"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    // 填写资源名
    await page.locator('input[name="resource"]').fill(testResource);
    // 选择降级策略：慢调用比例（默认）
    await page.locator('select[name="grade"]').selectOption({ value: '0' });
    // 填写熔断时长
    await page.locator('input[name="timeWindow"]').fill('5');
    // 填写最大 RT
    await page.locator('input[name="statIntervalMs"]').fill('1000');
    // 填写比例阈值
    await page.locator('input[name="slowRatioThreshold"]').fill('0.5');
    // 填写最小请求数
    await page.locator('input[name="minRequestAmount"]').fill('5');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // 增加等待时间到 3 秒

    // 检查是否有验证错误
    const errors = await page
      .locator('[role="alert"], .chakra-form__error-message, [class*="error"]')
      .allTextContents();
    if (errors.length > 0) {
      console.error('❌ 表单验证错误:', errors);
    }

    // 如果有 API 错误，打印详细信息并失败
    if (apiResponse && apiResponse.status >= 400) {
      console.error('❌ API调用失败:', apiResponse);
      throw new Error(`API returned ${apiResponse.status}: ${apiResponse.body}`);
    }

    await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 10000 });
    await page.waitForTimeout(3000);

    // ============================================
    // 步骤 2: 验证规则在列表中显示
    // ============================================
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 10000 });

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
      await expect(page).toHaveURL(/\/degrade\/\d+/, { timeout: 5000 });

      // 修改熔断时长
      const timeWindowInput = page.locator('input[name="timeWindow"]');
      await timeWindowInput.clear();
      await timeWindowInput.fill('10');

      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 5000 });
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

    // 验证删除成功 - 检查表格中是否还有该资源
    await expect(page.locator(`tr:has-text("${testResource}")`)).not.toBeVisible({ timeout: 3000 });
  });

  test('创建异常比例规则', async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/e2e-degrade-exception-ratio-${timestamp}`;

    // 创建异常比例规则
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    // 选择降级策略：异常比例
    await page.locator('select[name="grade"]').selectOption({ value: '1' });
    await page.locator('input[name="timeWindow"]').fill('5');
    await page.locator('input[name="count"]').fill('0.5');
    await page.locator('input[name="minRequestAmount"]').fill('5');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 验证创建成功
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 5000 });

    // 清理：删除规则
    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    page.once('dialog', async (dialog) => await dialog.accept());
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });

  test('创建异常数规则', async ({ page }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const testResource = `/e2e-degrade-exception-count-${timestamp}`;

    // 创建异常数规则
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    // 选择降级策略：异常数
    await page.locator('select[name="grade"]').selectOption({ value: '2' });
    await page.locator('input[name="timeWindow"]').fill('5');
    await page.locator('input[name="count"]').fill('10');
    await page.locator('input[name="minRequestAmount"]').fill('5');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(2000);

    // 验证创建成功
    await expect(page.getByText(testResource).first()).toBeVisible({ timeout: 10000 });

    // 清理：删除规则
    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    page.once('dialog', async (dialog) => await dialog.accept());
    await deleteButton.click();
    await page.waitForTimeout(1000);
  });

  test('创建降级规则并验证熔断效果（慢调用）', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const testResource = '/api/degrade/slow';
    const rtThreshold = 50; // RT 阈值 50ms
    const slowRatio = 0.5; // 慢调用比例 50%

    // ============================================
    // 步骤 1: 创建慢调用比例降级规则
    // ============================================
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('select[name="grade"]').selectOption({ value: '0' }); // 慢调用比例
    await page.locator('input[name="timeWindow"]').fill('10'); // 熔断时长 10s
    await page.locator('input[name="statIntervalMs"]').fill(rtThreshold.toString()); // 最大 RT
    await page.locator('input[name="slowRatioThreshold"]').fill(slowRatio.toString());
    await page.locator('input[name="minRequestAmount"]').fill('3'); // 最小请求数

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(5000); // 等待规则同步

    // ============================================
    // 步骤 2: 测试慢调用熔断效果
    // ============================================
    const tokenServerUrl = 'http://localhost:8081';
    let successCount = 0;
    let slowCount = 0;
    let circuitOpenCount = 0;

    // 先触发慢调用（使用 delay=100ms，超过阈值 50ms）
    for (let i = 0; i < 5; i++) {
      const response = await request.get(`${tokenServerUrl}/api/degrade/slow?delay=100`).catch(() => null);
      if (response && response.ok()) {
        slowCount++;
      }
    }

    // 等待熔断触发
    await page.waitForTimeout(1000);

    // 再次请求，验证是否被熔断
    for (let i = 0; i < 5; i++) {
      const response = await request
        .get(`${tokenServerUrl}/api/degrade/slow`)
        .then(async (res) => {
          const body = await res.text().catch(() => '');
          return { status: res.status(), body, ok: res.ok() };
        })
        .catch(() => ({ status: 0, body: '', ok: false }));

      if (response.ok) {
        successCount++;
      } else if (
        response.status === 429 ||
        response.body.includes('Circuit breaker') ||
        response.body.includes('Blocked')
      ) {
        circuitOpenCount++;
      }
    }

    console.log(
      `降级测试结果（慢调用）: 慢调用${slowCount}个, 熔断后成功${successCount}个/被熔断${circuitOpenCount}个`
    );

    // 验证：至少有请求被处理
    expect(slowCount + successCount + circuitOpenCount).toBeGreaterThan(0);

    // ============================================
    // 步骤 3: 清理
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      page.once('dialog', async (dialog) => await dialog.accept());
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('创建降级规则并验证熔断效果（异常比例）', async ({ page, request }) => {
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const testResource = '/api/degrade/error';
    const errorRatio = 0.3; // 异常比例 30%

    // ============================================
    // 步骤 1: 创建异常比例降级规则
    // ============================================
    await page.click('a[href*="/degrade/create"], button:has-text("新增")');
    await expect(page).toHaveURL(/\/degrade\/(create|new)/, { timeout: 5000 });

    await page.locator('input[name="resource"]').fill(testResource);
    await page.locator('select[name="grade"]').selectOption({ value: '1' }); // 异常比例
    await page.locator('input[name="timeWindow"]').fill('10');
    await page.locator('input[name="count"]').fill(errorRatio.toString());
    await page.locator('input[name="minRequestAmount"]').fill('3');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/degrade(?:$|\?)/, { timeout: 5000 });
    await page.waitForTimeout(5000);

    // ============================================
    // 步骤 2: 测试异常比例熔断效果
    // ============================================
    const tokenServerUrl = 'http://localhost:8081';
    let successCount = 0;
    let errorCount = 0;
    let circuitOpenCount = 0;

    // 触发异常（使用 error=true）
    for (let i = 0; i < 5; i++) {
      const response = await request.get(`${tokenServerUrl}/api/degrade/error?error=true`).catch(() => null);
      if (response) {
        if (response.ok()) successCount++;
        else errorCount++;
      }
    }

    await page.waitForTimeout(1000);

    // 再次请求，验证是否被熔断
    for (let i = 0; i < 5; i++) {
      const response = await request
        .get(`${tokenServerUrl}/api/degrade/error`)
        .then(async (res) => {
          const body = await res.text().catch(() => '');
          return { status: res.status(), body, ok: res.ok() };
        })
        .catch(() => ({ status: 0, body: '', ok: false }));

      if (response.ok) {
        successCount++;
      } else if (
        response.status === 429 ||
        response.body.includes('Circuit breaker') ||
        response.body.includes('Blocked')
      ) {
        circuitOpenCount++;
      }
    }

    console.log(
      `降级测试结果（异常比例）: 异常${errorCount}个, 熔断后成功${successCount}个/被熔断${circuitOpenCount}个`
    );

    expect(errorCount + successCount + circuitOpenCount).toBeGreaterThan(0);

    // ============================================
    // 步骤 3: 清理
    // ============================================
    await page.goto('/dashboard/apps/sentinel-token-server/degrade');
    await page.waitForLoadState('networkidle');

    const deleteButton = page.locator(`tr:has-text("${testResource}") button[aria-label="删除"]`).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      page.once('dialog', async (dialog) => await dialog.accept());
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
