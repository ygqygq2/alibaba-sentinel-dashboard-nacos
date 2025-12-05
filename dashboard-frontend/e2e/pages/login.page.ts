import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/sign-in');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.page.fill('[name="username"]', username);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginSuccess() {
    // 登录成功后应该跳转到 dashboard
    await expect(this.page).toHaveURL(/dashboard/, { timeout: 10000 });
  }

  async expectLoginError() {
    // 登录失败应该显示错误提示
    await expect(this.page.locator('[role="alert"], .error-message')).toBeVisible();
  }
}
