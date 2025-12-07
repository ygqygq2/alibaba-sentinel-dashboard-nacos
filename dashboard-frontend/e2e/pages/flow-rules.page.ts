import { Page, expect } from '@playwright/test';

export class FlowRulesPage {
  constructor(private page: Page) {}

  async goto(app: string = 'sentinel-token-server') {
    await this.page.goto(`/dashboard/apps/${app}/flow`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    // 等待页面标题（Chakra UI Heading 组件）
    await expect(this.page.getByText('流控规则', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  }

  async clickNewRule() {
    await this.page.locator('button:has-text("新增流控规则")').click();
  }

  async fillRuleForm(data: { resource: string; grade?: number; count?: number; limitApp?: string }) {
    // 填写资源名称
    await this.page.locator('input[name="resource"]').fill(data.resource);

    // 填写阈值
    if (data.count !== undefined) {
      await this.page.locator('input[name="count"]').fill(String(data.count));
    }

    // 填写来源应用
    if (data.limitApp) {
      await this.page.locator('input[name="limitApp"]').fill(data.limitApp);
    }
  }

  async submitForm() {
    await this.page.locator('button[type="submit"]:has-text("保存")').click();
  }

  async expectRuleInList(resource: string) {
    await expect(this.page.locator(`tr:has-text("${resource}")`)).toBeVisible({ timeout: 5000 });
  }

  async deleteRule(resource: string) {
    const row = this.page.locator(`tr:has-text("${resource}")`);
    await row.locator('button[aria-label="删除"]').click();

    // 确认删除
    await this.page.locator('button:has-text("确认")').click();
  }

  async expectRuleNotInList(resource: string) {
    await expect(this.page.locator(`tr:has-text("${resource}")`)).not.toBeVisible({ timeout: 5000 });
  }

  async getRuleCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }
}
