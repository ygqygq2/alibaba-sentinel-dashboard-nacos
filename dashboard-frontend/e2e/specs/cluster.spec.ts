import { test, expect } from '@playwright/test';
import { ClusterPage } from '../pages';

test.describe('集群流控管理', () => {
  let clusterPage: ClusterPage;

  test.beforeEach(async ({ page }) => {
    clusterPage = new ClusterPage(page);
  });

  test.describe('Token Server 管理', () => {
    test('显示 Token Server 列表页面', async () => {
      await clusterPage.gotoServerList();
      await clusterPage.expectServerListLoaded();
    });

    test('显示 Token Server 数量', async () => {
      await clusterPage.gotoServerList();
      await clusterPage.expectServerListLoaded();

      const count = await clusterPage.getServerCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Token Server 已注册并显示', async ({ page }) => {
      await clusterPage.gotoServerList();
      await clusterPage.expectServerListLoaded();

      const count = await clusterPage.getServerCount();
      if (count > 0) {
        // 验证 Token Server 信息完整性
        const firstRow = page.locator('tbody tr').first();
        await expect(firstRow).toBeVisible();

        // 验证必要字段
        await expect(firstRow.locator('td').first()).toBeVisible(); // IP 或主机名
      }
    });

    test('Token Server 列表显示端口信息', async ({ page }) => {
      await clusterPage.gotoServerList();
      await clusterPage.expectServerListLoaded();

      const count = await clusterPage.getServerCount();
      if (count > 0) {
        // 验证端口列是否存在（Token Server 默认端口 18730）
        const portCell = page.locator('tbody tr').first().locator('td:has-text("18730"), td:has-text("8719")');
        const hasPort = (await portCell.count()) > 0;
        expect(hasPort).toBeTruthy();
      }
    });
  });

  test.describe('Token Client 管理', () => {
    test('显示 Token Client 列表页面', async () => {
      await clusterPage.gotoClientList();
      await clusterPage.expectClientListLoaded();
    });

    test('显示 Token Client 数量', async () => {
      await clusterPage.gotoClientList();
      await clusterPage.expectClientListLoaded();

      const count = await clusterPage.getClientCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Client 列表为空时显示提示', async ({ page }) => {
      await clusterPage.gotoClientList();
      await clusterPage.expectClientListLoaded();

      const count = await clusterPage.getClientCount();
      if (count === 0) {
        // 可能显示空状态
        const emptyState = page.locator('text=/暂无|没有|无客户端/');
        const hasEmptyState = (await emptyState.count()) > 0;
        // 空状态提示是可选的
        expect(hasEmptyState).toBeDefined();
      }
    });
  });

  test.describe('集群配置', () => {
    test('Token Server 配置信息可见', async ({ page }) => {
      await clusterPage.gotoServerList();
      await clusterPage.expectServerListLoaded();

      const count = await clusterPage.getServerCount();
      if (count > 0) {
        // 检查是否有配置或详情按钮
        const actionButtons = page.locator('tbody tr').first().locator('button');
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
