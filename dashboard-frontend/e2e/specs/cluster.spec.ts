import { test, expect } from '@playwright/test';
import { ClusterPage } from '../pages';

test.describe('集群管理', () => {
  let clusterPage: ClusterPage;

  test.beforeEach(async ({ page }) => {
    clusterPage = new ClusterPage(page);
  });
  test('should display token server list', async () => {
    await clusterPage.gotoServerList();
    await clusterPage.expectServerListLoaded();
  });

  test('should display token client list', async () => {
    await clusterPage.gotoClientList();
    await clusterPage.expectClientListLoaded();
  });

  test('should show server count', async () => {
    await clusterPage.gotoServerList();
    await clusterPage.expectServerListLoaded();

    const count = await clusterPage.getServerCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show client count', async () => {
    await clusterPage.gotoClientList();
    await clusterPage.expectClientListLoaded();

    const count = await clusterPage.getClientCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
