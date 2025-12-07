import { Page, expect } from '@playwright/test';

export class MachinesPage {
  constructor(private page: Page) {}

  async goto(app: string = 'sentinel-token-server') {
    await this.page.goto(`/dashboard/apps/${app}/machines`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page.getByText('机器列表', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async getMachineCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async expectMachineExists(ip: string) {
    await expect(this.page.locator(`tr:has-text("${ip}")`)).toBeVisible({ timeout: 5000 });
  }

  async getMachineStatus(ip: string): Promise<string> {
    const row = this.page.locator(`tr:has-text("${ip}")`);
    const status = await row.locator('td:nth-child(3)').textContent();
    return status?.trim() || '';
  }
}
