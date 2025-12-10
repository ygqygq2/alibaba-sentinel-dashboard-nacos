import { Page, expect } from '@playwright/test';

export class InstancesPage {
  constructor(private page: Page) {}

  async goto(app: string = 'sentinel-token-server') {
    await this.page.goto(`/dashboard/apps/${app}/instances`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    // 修改为"实例列表"以匹配 Machine → Instance 重构
    await expect(
      this.page
        .getByText('实例列表', { exact: true })
        .or(this.page.getByText('机器列表', { exact: true }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  }

  async getInstanceCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async expectInstanceExists(ip: string) {
    await expect(this.page.locator(`tr:has-text("${ip}")`)).toBeVisible({ timeout: 5000 });
  }

  async getInstanceStatus(ip: string): Promise<string> {
    const row = this.page.locator(`tr:has-text("${ip}")`);
    const status = await row.locator('td:nth-child(3)').textContent();
    return status?.trim() || '';
  }

  async getInstanceInfo(index: number = 0) {
    const row = this.page.locator('tbody tr').nth(index);
    return {
      ip: await row.locator('td').nth(0).textContent(),
      port: await row.locator('td').nth(1).textContent(),
      status: await row.locator('td').nth(2).textContent(),
      heartbeat: await row.locator('td').nth(3).textContent(),
    };
  }

  async searchInstance(keyword: string) {
    const searchInput = this.page.locator('input[placeholder*="搜索"], input[placeholder*="实例"]');
    await searchInput.fill(keyword);
    await this.page.waitForTimeout(500); // 等待搜索结果
  }
}
