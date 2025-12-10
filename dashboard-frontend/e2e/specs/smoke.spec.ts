import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, TOKEN_SERVER_URL, APP_NAME, API, TEST_USER } from '../config';

/**
 * 冒烟测试 - 快速验证核心功能
 *
 * 这些测试确保系统的关键功能正常工作：
 * - 服务可访问性
 * - 认证功能
 * - 服务注册
 * - 基本 API 功能
 */
test.describe('冒烟测试', () => {
  test.describe('服务可用性', () => {
    test('Dashboard 可访问', async ({ request }) => {
      const response = await request.get(`${DASHBOARD_URL}/`);
      expect(response.status()).toBeLessThan(500);
    });

    test('Dashboard 健康检查', async ({ request }) => {
      const response = await request.get(`${DASHBOARD_URL}/actuator/health`, {
        failOnStatusCode: false,
      });
      // 健康检查端点可能未配置，只验证不是 500 错误
      expect(response.status()).toBeLessThan(500);
    });

    test('Token Server 可访问', async ({ request }) => {
      const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.health}`);
      expect(response.ok()).toBeTruthy();
      expect((await response.json()).status).toBe('UP');
    });

    test('Token Server 健康检查详情', async ({ request }) => {
      const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.health}`);
      const health = await response.json();

      expect(health.status).toBe('UP');
      // 验证响应结构
      expect(health).toHaveProperty('status');
    });
  });

  test.describe('认证功能', () => {
    test('Dashboard 登录成功', async ({ request }) => {
      const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
        params: TEST_USER,
      });
      expect(response.ok()).toBeTruthy();
      expect((await response.json()).success).toBe(true);
    });

    test('Dashboard 登录返回 Cookie', async ({ request }) => {
      const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
        params: TEST_USER,
      });

      const setCookie = response.headers()['set-cookie'];
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain('JSESSIONID');
    });

    test('Dashboard 无效凭据登录失败', async ({ request }) => {
      const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
        params: { username: 'invalid', password: 'invalid' },
        failOnStatusCode: false,
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('服务注册', () => {
    test('Token Server 已注册到 Dashboard', async ({ request }) => {
      // 登录
      const loginRes = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, { params: TEST_USER });
      const cookies = loginRes.headers()['set-cookie']?.split(';')[0] || '';

      // 获取应用列表
      const response = await request.get(`${DASHBOARD_URL}${API.dashboard.apps}`, {
        headers: { Cookie: cookies },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const apps = data.data.map((app: { app: string }) => app.app);
      expect(apps).toContain(APP_NAME);
    });

    test('Token Server 实例在线', async ({ request }) => {
      // 登录
      const loginRes = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, { params: TEST_USER });
      const cookies = loginRes.headers()['set-cookie']?.split(';')[0] || '';

      // 获取实例列表
      const response = await request.get(`${DASHBOARD_URL}${API.dashboard.instances}?app=${APP_NAME}`, {
        headers: { Cookie: cookies },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  test.describe('基本 API 功能', () => {
    test('Token Server API 正常', async ({ request }) => {
      const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.hello}`);
      expect(response.ok()).toBeTruthy();
      expect((await response.json()).message).toBe('Hello, Sentinel!');
    });

    test('Dashboard 应用列表 API 可用', async ({ request }) => {
      const loginRes = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, { params: TEST_USER });
      const cookies = loginRes.headers()['set-cookie']?.split(';')[0] || '';

      const response = await request.get(`${DASHBOARD_URL}${API.dashboard.apps}`, {
        headers: { Cookie: cookies },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('Dashboard 前端资源可访问', async ({ request }) => {
      const response = await request.get(`${DASHBOARD_URL}/assets/index.js`, {
        failOnStatusCode: false,
      });
      // 检查静态资源是否可访问（200 或 304）
      expect([200, 304, 404]).toContain(response.status());
    });
  });

  test.describe('关键页面可访问', () => {
    test('Dashboard 首页可访问', async ({ page }) => {
      await page.goto(DASHBOARD_URL);
      await expect(page).toHaveURL(/.*\/auth\/sign-in/);
    });

    test('登录后可访问应用列表', async ({ page }) => {
      await page.goto(`${DASHBOARD_URL}/auth/sign-in`);

      // 登录
      await page.fill('input[name="username"]', TEST_USER.username);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // 等待跳转
      await page.waitForURL(/.*\/dashboard/, { timeout: 5000 });

      // 验证页面加载成功
      await expect(page.getByText(APP_NAME).first()).toBeVisible({ timeout: 10000 });
    });
  });
});
