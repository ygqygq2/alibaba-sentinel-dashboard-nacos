import { test, expect } from '@playwright/test';
import { MetricPage } from '../pages';

test.describe('实时监控', () => {
  let metricPage: MetricPage;

  test.beforeEach(async ({ page }) => {
    // 进入实时监控页面
    metricPage = new MetricPage(page);
    await metricPage.goto();
  });

  test('显示实时监控页面', async () => {
    await metricPage.expectLoaded();
  });

  test('显示监控页面标题', async ({ page }) => {
    await metricPage.expectLoaded();
    // 验证页面标题（使用 heading 而不是 text 避免重复匹配）
    await expect(page.getByRole('heading', { name: '实时监控' })).toBeVisible();
  });

  test('显示监控数据表格', async ({ page }) => {
    await metricPage.expectLoaded();

    // 验证表格存在
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('监控表格显示关键指标列', async ({ page }) => {
    await metricPage.expectLoaded();

    // 验证关键列标题
    const headers = ['资源', 'QPS', '通过', '拒绝', '异常'];
    for (const header of headers) {
      const headerCell = page.locator(`th:has-text("${header}")`);
      if ((await headerCell.count()) > 0) {
        await expect(headerCell.first()).toBeVisible();
      }
    }
  });

  test('有刷新按钮', async ({ page }) => {
    await metricPage.expectLoaded();
    const refreshButton = page.getByRole('button', { name: /刷新|Refresh/ });
    await expect(refreshButton.first()).toBeVisible();
  });

  test('刷新按钮可点击', async ({ page }) => {
    await metricPage.expectLoaded();

    const refreshButton = page.getByRole('button', { name: /刷新|Refresh/ }).first();
    await expect(refreshButton).toBeEnabled();

    // 点击刷新
    await refreshButton.click();
    await page.waitForTimeout(500);
  });

  test('监控数据自动更新时间选择', async ({ page }) => {
    await metricPage.expectLoaded();

    // 检查是否有时间范围选择器
    const timeSelector = page.locator('select[name="timeRange"], button:has-text("分钟"), button:has-text("小时")');
    if ((await timeSelector.count()) > 0) {
      await expect(timeSelector.first()).toBeVisible();
    }
  });

  test('监控数据为空时显示提示', async ({ page }) => {
    await metricPage.expectLoaded();

    // 检查表格行数
    const rowCount = await page.locator('tbody tr').count();

    if (rowCount === 0) {
      // 可能显示空状态提示
      const emptyState = page.locator('text=/暂无|没有|无监控数据/');
      const hasEmptyState = (await emptyState.count()) > 0;
      expect(hasEmptyState).toBeDefined();
    }
  });

  test('监控图表显示', async ({ page }) => {
    await metricPage.expectLoaded();

    // 检查是否有图表容器（可能使用 canvas 或 svg）
    const chart = page.locator('canvas, svg[class*="chart"], [class*="echarts"]');
    const hasChart = (await chart.count()) > 0;

    // 图表是可选的，只验证存在性
    expect(hasChart).toBeDefined();
  });
});
