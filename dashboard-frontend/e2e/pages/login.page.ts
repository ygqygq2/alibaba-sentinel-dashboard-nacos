import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    // 等待页面加载完成
    await this.page.waitForLoadState('networkidle');
    // 如果不在登录页，导航到登录页
    if (!(await this.page.url().includes('sign-in'))) {
      await this.page.goto('/#/auth/sign-in');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async login(username: string, password: string) {
    // Chakra UI Input 组件使用 name 属性
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
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
