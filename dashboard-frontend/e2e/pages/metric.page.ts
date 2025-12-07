import { Page, expect } from '@playwright/test';

export class MetricPage {
  constructor(private page: Page) {}

  async goto(app: string = 'sentinel-token-server') {
    await this.page.goto(`/dashboard/apps/${app}/metric`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page.getByText('实时监控', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async selectResource(resource: string) {
    await this.page.locator('select[name="resource"]').selectOption(resource);
  }

  async expectChartVisible() {
    // 等待图表容器出现
    await expect(this.page.locator('[class*="chart"], canvas, svg')).toBeVisible({ timeout: 10000 });
  }

  async getDisplayedMetrics(): Promise<string[]> {
    const metrics = await this.page.locator('[class*="metric-card"] h3').allTextContents();
    return metrics.map((m) => m.trim());
  }
}
