import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    // 等待 dashboard 加载完成
    await expect(this.page.locator('[data-testid="dashboard"], .dashboard-container, main')).toBeVisible({
      timeout: 10000,
    });
  }

  async searchApp(appName: string) {
    const searchInput = this.page.locator(
      '[data-testid="app-search"], input[placeholder*="搜索"], input[placeholder*="search"]'
    );
    await searchInput.fill(appName);
  }

  async selectApp(appName: string) {
    await this.page.click(`text=${appName}`);
  }

  async navigateTo(menuItem: string) {
    await this.page.click(`nav >> text=${menuItem}`);
  }

  async logout() {
    // 点击用户菜单
    await this.page.click('[data-testid="user-menu"], .user-avatar, [aria-label="用户菜单"]');
    // 点击退出
    await this.page.click('text=退出登录, text=Logout, text=登出');
  }
}
