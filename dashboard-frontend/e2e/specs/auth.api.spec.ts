import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, TEST_USER, API } from '../config';
import { login, authHeaders } from '../helpers';

/**
 * Dashboard 认证 API 测试
 */
test.describe('认证 API', () => {
  test('登录成功', async ({ request }) => {
    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
      params: TEST_USER,
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.loginName).toBe('sentinel');
  });

  test('登录失败 - 无效凭据', async ({ request }) => {
    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
      params: { username: 'invalid', password: 'invalid' },
    });

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('检查登录状态', async ({ request }) => {
    const cookies = await login(request);
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.check}`, {
      headers: authHeaders(cookies),
    });

    expect(response.status()).toBeLessThan(500);
  });
});
