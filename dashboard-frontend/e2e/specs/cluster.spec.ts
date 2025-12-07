import { test, expect } from '@playwright/test';
import { ClusterPage } from '../pages';

test.describe('集群管理', () => {
  let clusterPage: ClusterPage;

  test.beforeEach(async ({ page }) => {
    clusterPage = new ClusterPage(page);
  });
  test('显示 Token Server 列表', async () => {
    await clusterPage.gotoServerList();
    await clusterPage.expectServerListLoaded();
  });

  test('显示 Token Client 列表', async () => {
    await clusterPage.gotoClientList();
    await clusterPage.expectClientListLoaded();
  });

  test('显示 Server 数量', async () => {
    await clusterPage.gotoServerList();
    await clusterPage.expectServerListLoaded();

    const count = await clusterPage.getServerCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('显示 Client 数量', async () => {
    await clusterPage.gotoClientList();
    await clusterPage.expectClientListLoaded();

    const count = await clusterPage.getClientCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
