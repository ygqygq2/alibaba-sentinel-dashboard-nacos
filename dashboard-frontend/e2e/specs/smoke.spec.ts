import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, TOKEN_SERVER_URL, APP_NAME, API, TEST_USER } from '../config';

/**
 * 冒烟测试 - 快速验证核心功能
 */
test.describe('冒烟测试', () => {
  test('Dashboard 可访问', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}/`);
    expect(response.status()).toBeLessThan(500);
  });

  test('Token Server 可访问', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.health}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).status).toBe('UP');
  });

  test('Dashboard 登录成功', async ({ request }) => {
    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
      params: TEST_USER,
    });
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).success).toBe(true);
  });

  test('Token Server API 正常', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.hello}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).message).toBe('Hello, Sentinel!');
  });

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
});
