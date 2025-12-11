import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    // 直接访问登录页（Playwright 每个测试使用独立 context，无状态污染）
    await this.page.goto('/#/auth/sign-in');
    await this.page.waitForLoadState('networkidle');
    // 等待登录表单加载
    await this.page.waitForSelector('input[name="username"]', { timeout: 15000 });
  }
  async login(username: string, password: string) {
    // Chakra UI Input 组件使用 name 属性
    await this.page.waitForSelector('input[name="username"]', { timeout: 15000 });
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
  }

  async expectLoginSuccess() {
    // 登录成功后应该跳转到 dashboard
    await expect(this.page).toHaveURL(/dashboard/, { timeout: 10000 });
  }

  async expectLoginError() {
    // 登录失败应该显示 Chakra UI Toast 错误提示
    // Toast 通常使用特定的 data-* 属性或类名
    await this.page.waitForLoadState('networkidle');
    // Chakra UI Toast 通常有 role="status" 和特定的 CSS 类
    // 等待包含"登录失败"文本的提示出现
    await expect(this.page.locator('[role="status"]').filter({ hasText: '登录失败' })).toBeVisible({ timeout: 10000 });
  }
}
