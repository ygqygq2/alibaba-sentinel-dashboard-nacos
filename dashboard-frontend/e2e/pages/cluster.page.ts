import { Page, expect } from '@playwright/test';

export class ClusterPage {
  constructor(private page: Page) {}

  async gotoServerList() {
    await this.page.goto('/dashboard/cluster/server');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoClientList() {
    await this.page.goto('/dashboard/cluster/client');
    await this.page.waitForLoadState('networkidle');
  }

  async expectServerListLoaded() {
    await expect(this.page.getByText('Token Server 列表', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async expectClientListLoaded() {
    await expect(this.page.getByText('Token Client 列表', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async getServerCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async getClientCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }
}
