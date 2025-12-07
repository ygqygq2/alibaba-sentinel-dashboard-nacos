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

  test('显示监控数据表格', async ({ page }) => {
    await metricPage.expectLoaded();
    // 验证页面标题（使用 heading 而不是 text 避免重复匹配）
    await expect(page.getByRole('heading', { name: '实时监控' })).toBeVisible();
  });

  test('有刷新按钮', async ({ page }) => {
    await metricPage.expectLoaded();
    await expect(page.getByRole('button', { name: '刷新', exact: true })).toBeVisible();
  });
});
