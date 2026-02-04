import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, cleanupTestRules } from '../helpers';

/**
 * 系统规则参数全覆盖测试
 * 覆盖所有系统保护参数：
 * - Load、平均RT、并发线程数、入口QPS、CPU使用率
 */

test.describe.configure({ mode: 'serial' });

test.describe('系统规则 - 参数全覆盖测试', () => {
  let cookies: string;
  const createdRuleIds: number[] = [];

  test.beforeAll(async ({ request }) => {
    cookies = await login(request);
    // 清理历史测试数据
    await cleanupTestRules(request, cookies);
  });

  test.afterAll(async ({ request }) => {
    // 清理所有创建的规则
    for (const id of createdRuleIds) {
      try {
        await request.delete(`${DASHBOARD_URL}${API.dashboard.systemRule}/${id}`, {
          headers: authHeaders(cookies),
        });
      } catch (error) {
        console.log(`⚠️ 清理系统规则 ${id} 失败: ${error}`);
      }
    }
    console.log(`✅ 清理了 ${createdRuleIds.length} 条系统规则`);
  });

  test('1. Load 阈值', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: 8.0, // Load 阈值
      avgRt: -1,
      maxThread: -1,
      qps: -1,
      highestCpuUsage: -1,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.highestSystemLoad).toBe(8.0);
    createdRuleIds.push(data.data.id);
    console.log(`✅ Load 系统规则创建成功: ID=${data.data.id}`);
  });

  test('2. 平均 RT 阈值', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: -1,
      avgRt: 100, // 平均 RT 100ms
      maxThread: -1,
      qps: -1,
      highestCpuUsage: -1,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.avgRt).toBe(100);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 平均RT 系统规则创建成功: ID=${data.data.id}`);
  });

  test('3. 并发线程数阈值', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: -1,
      avgRt: -1,
      maxThread: 50, // 最大线程数 50
      qps: -1,
      highestCpuUsage: -1,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.maxThread).toBe(50);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 并发线程数系统规则创建成功: ID=${data.data.id}`);
  });

  test('4. 入口 QPS 阈值', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: -1,
      avgRt: -1,
      maxThread: -1,
      qps: 1000, // 入口 QPS 1000
      highestCpuUsage: -1,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.qps).toBe(1000);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 入口QPS 系统规则创建成功: ID=${data.data.id}`);
  });

  test('5. CPU 使用率阈值', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: -1,
      avgRt: -1,
      maxThread: -1,
      qps: -1,
      highestCpuUsage: 0.8, // CPU 使用率 80%
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.highestCpuUsage).toBe(0.8);
    createdRuleIds.push(data.data.id);
    console.log(`✅ CPU使用率系统规则创建成功: ID=${data.data.id}`);
  });

  test('6. 多指标组合规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'system',
      highestSystemLoad: 10.0,
      avgRt: 200,
      maxThread: 100,
      qps: 2000,
      highestCpuUsage: 0.9,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.systemRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.highestSystemLoad).toBe(10.0);
    expect(data.data.avgRt).toBe(200);
    expect(data.data.maxThread).toBe(100);
    expect(data.data.qps).toBe(2000);
    expect(data.data.highestCpuUsage).toBe(0.9);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 多指标组合系统规则创建成功: ID=${data.data.id}`);
  });

  test('7. 验证所有系统规则已创建', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.systemRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);

    const rules = data.data as Array<{ id: number }>;
    const foundCount = createdRuleIds.filter((id) => rules.some((r) => r.id === id)).length;

    console.log(`✅ 验证完成: 创建了 ${createdRuleIds.length} 条系统规则，找到 ${foundCount} 条`);
    expect(foundCount).toBe(createdRuleIds.length);
  });
});
