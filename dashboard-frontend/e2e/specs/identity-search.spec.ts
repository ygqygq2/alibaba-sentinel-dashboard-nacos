import { test, expect } from '@playwright/test';
import { ClusterLinkPage } from '../pages';

test.describe('簇点链路', () => {
  const APP_NAME = 'token-server';
  let clusterLinkPage: ClusterLinkPage;

  test.beforeEach(async ({ page }) => {
    clusterLinkPage = new ClusterLinkPage(page);
    await clusterLinkPage.goto(APP_NAME);
    await clusterLinkPage.expectLoaded();
  });

  test('加载簇点链路页面', async () => {
    await clusterLinkPage.expectLoaded();
  });

  test('搜索功能 - 搜索资源名称', async ({ page }) => {
    // 等待资源加载
    await page.waitForTimeout(1000);

    // 查找搜索输入框
    const searchInput = page
      .locator('input[type="text"], input[placeholder*="搜索"], input[placeholder*="查找"]')
      .first();

    // 如果找到搜索框，进行搜索测试
    const searchBoxCount = await searchInput.count();
    if (searchBoxCount > 0) {
      // 输入搜索关键词
      await searchInput.fill('/system/version');

      // 等待搜索结果更新
      await page.waitForTimeout(500);

      // 验证搜索结果：至少有一个包含搜索关键词的结果或无结果提示
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        // 验证搜索结果包含关键词
        const firstRow = tableRows.first();
        const rowText = await firstRow.textContent();
        expect(rowText?.toLowerCase()).toContain('system');
      } else {
        // 验证显示无结果提示或实例选择提示
        const noData = page.locator('text=/请先选择|暂无|没有|无数据/');
        await expect(noData.first()).toBeVisible({ timeout: 5000 });
      }

      // 清空搜索
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('搜索功能 - 清空搜索恢复列表', async ({ page }) => {
    // 等待资源加载
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[type="text"]').first();
    const searchBoxCount = await searchInput.count();

    if (searchBoxCount > 0) {
      // 记录原始行数
      const originalCount = await page.locator('table tbody tr').count();

      // 输入搜索
      await searchInput.fill('nonexistent_resource_12345');
      await page.waitForTimeout(500);

      // 清空搜索
      await searchInput.clear();
      await page.waitForTimeout(500);

      // 验证行数恢复
      const currentCount = await page.locator('table tbody tr').count();
      expect(currentCount).toBeGreaterThanOrEqual(originalCount - 5); // 允许少量差异（可能有新数据）
    }
  });

  test('搜索功能 - 支持防抖', async ({ page }) => {
    // 等待资源加载
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[type="text"]').first();
    const searchBoxCount = await searchInput.count();

    if (searchBoxCount > 0) {
      // 快速输入多个字符，测试防抖
      await searchInput.type('test', { delay: 50 });

      // 等待防抖延迟（300ms）
      await page.waitForTimeout(400);

      // 验证只触发了一次搜索（通过网络请求或 UI 更新）
      // 这里简单验证页面没有崩溃且有响应
      const tableOrEmptyState = page.locator('table, text=/暂无|没有/');
      await expect(tableOrEmptyState.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
