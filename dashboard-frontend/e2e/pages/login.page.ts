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
    // 登录失败应该显示 Chakra UI Alert 错误提示
    // 等待错误消息出现（可能需要一些时间处理请求）
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  }
}
