import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    // 等待 dashboard 加载完成 - 检查 main 元素或应用列表标题
    await expect(this.page.locator('main').first()).toBeVisible({
      timeout: 10000,
    });
  }

  async searchApp(appName: string) {
    // 使用全局搜索框（SearchInput 组件，仅桌面可见）
    const searchInput = this.page.locator('input[placeholder*="搜索"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(appName);
    // 等待搜索结果更新（防抖 200ms）
    await this.page.waitForTimeout(300);
  }

  async selectApp(appName: string) {
    await this.page.click(`text=${appName}`);
  }

  async navigateTo(menuItem: string) {
    await this.page.click(`nav >> text=${menuItem}`);
  }

  async logout() {
    // 直接点击退出登录按钮（带有 aria-label）
    await this.page.locator('[aria-label="退出登录"]').click();
    // 等待跳转
    await this.page.waitForLoadState('networkidle');
  }
}
