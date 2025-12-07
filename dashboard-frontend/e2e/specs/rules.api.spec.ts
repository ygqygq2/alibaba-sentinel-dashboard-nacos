import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, getMachineInfo } from '../helpers';

/**
 * 规则 API 测试
 */
test.describe('流控规则 API', () => {
  let cookies: string;
  let testRuleId: string;

  test.beforeAll(async ({ request }) => {
    cookies = await login(request);
  });

  test('获取流控规则列表', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.flowRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('创建流控规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: `test-api-${Date.now()}`,
      limitApp: 'default',
      grade: 1,
      count: 100,
      strategy: 0,
      controlBehavior: 0,
      clusterMode: false,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.flowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    testRuleId = data.data?.id;
  });

  test('删除流控规则', async ({ request }) => {
    if (!testRuleId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${DASHBOARD_URL}${API.dashboard.flowRule}/${testRuleId}`, {
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
  });
});

test.describe('其他规则 API (v1)', () => {
  let cookies: string;
  let machineIp: string;
  let machinePort: number;

  test.beforeAll(async ({ request }) => {
    cookies = await login(request);
    // v1 API 需要机器 ip 和 port
    const machine = await getMachineInfo(request, cookies);
    machineIp = machine.ip;
    machinePort = machine.port;
  });

  test('获取熔断规则', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.degradeRules}`, {
      params: { app: APP_NAME, ip: machineIp, port: machinePort },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    expect((await response.json()).success).toBe(true);
  });

  test('获取系统规则', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.systemRules}`, {
      params: { app: APP_NAME, ip: machineIp, port: machinePort },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    expect((await response.json()).success).toBe(true);
  });

  test('获取授权规则', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.authorityRules}`, {
      params: { app: APP_NAME, ip: machineIp, port: machinePort },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    expect((await response.json()).success).toBe(true);
  });

  test('获取热点规则', async ({ request }) => {
    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.paramFlowRules}`, {
      params: { app: APP_NAME, ip: machineIp, port: machinePort },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    expect((await response.json()).success).toBe(true);
  });
});
