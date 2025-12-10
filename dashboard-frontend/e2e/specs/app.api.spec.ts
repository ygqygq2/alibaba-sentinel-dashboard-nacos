import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, triggerResourceData } from '../helpers';

/**
 * Dashboard 应用和资源 API 测试
 */
test.describe('应用 API', () => {
  let cookies: string;

  test.beforeAll(async ({ request }) => {
    cookies = await login(request);
  });

  test('获取应用列表', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.apps}`, {
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('应用列表包含 token-server', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.apps}`, {
      headers: authHeaders(cookies),
    });

    const data = await response.json();
    const apps = data.data.map((app: { app: string }) => app.app);
    expect(apps).toContain(APP_NAME);
  });

  test('获取实例列表', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.instances(APP_NAME)}`, {
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });
});

test.describe('资源 API', () => {
  let cookies: string;

  test.beforeAll(async ({ request }) => {
    cookies = await login(request);
    await triggerResourceData();
  });

  test('获取资源数据', async ({ request }) => {
    // 先获取实例信息
    const instanceRes = await request.get(`${DASHBOARD_URL}${API.dashboard.instances(APP_NAME)}`, {
      headers: authHeaders(cookies),
    });
    const instance = (await instanceRes.json()).data[0];

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.resource}`, {
      params: { app: APP_NAME, ip: instance.ip, port: instance.port },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
