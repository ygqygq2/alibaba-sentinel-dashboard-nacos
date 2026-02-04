import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, cleanupTestRules } from '../helpers';

/**
 * 降级规则高级参数测试
 * 覆盖所有降级参数：
 * - 熔断策略：慢调用比例、异常比例、异常数
 * - 最小请求数、统计时长、熔断时长等
 */

test.describe.configure({ mode: 'serial' });

test.describe('降级规则 - 参数全覆盖测试', () => {
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
        await request.delete(`${DASHBOARD_URL}${API.dashboard.degradeRule}/${id}`, {
          headers: authHeaders(cookies),
        });
      } catch (error) {
        console.log(`⚠️ 清理降级规则 ${id} 失败: ${error}`);
      }
    }
    console.log(`✅ 清理了 ${createdRuleIds.length} 条降级规则`);
  });

  test('1. 熔断策略 - 慢调用比例', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/slow-ratio',
      grade: 0, // 慢调用比例
      count: 200, // 最大RT 200ms
      timeWindow: 10, // 熔断时长 10秒
      minRequestAmount: 5, // 最小请求数
      slowRatioThreshold: 0.5, // 比例阈值 50%
      statIntervalMs: 1000, // 统计时长 1秒
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.grade).toBe(0);
    expect(data.data.slowRatioThreshold).toBe(0.5);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 慢调用比例规则创建成功: ID=${data.data.id}`);
  });

  test('2. 熔断策略 - 异常比例', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/error-ratio',
      grade: 1, // 异常比例
      count: 0.5, // 异常比例阈值 50%
      timeWindow: 10, // 熔断时长
      minRequestAmount: 5, // 最小请求数
      statIntervalMs: 1000, // 统计时长
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.grade).toBe(1);
    expect(data.data.count).toBe(0.5);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 异常比例规则创建成功: ID=${data.data.id}`);
  });

  test('3. 熔断策略 - 异常数', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/error-count',
      grade: 2, // 异常数
      count: 10, // 异常数阈值
      timeWindow: 10, // 熔断时长
      minRequestAmount: 5, // 最小请求数
      statIntervalMs: 1000, // 统计时长
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.grade).toBe(2);
    expect(data.data.count).toBe(10);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 异常数规则创建成功: ID=${data.data.id}`);
  });

  test('4. 参数 - 最小请求数 = 1', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/min-req-1',
      grade: 2,
      count: 5,
      timeWindow: 10,
      minRequestAmount: 1, // 最小请求数 1
      statIntervalMs: 1000,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.minRequestAmount).toBe(1);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 最小请求数=1 规则创建成功: ID=${data.data.id}`);
  });

  test('5. 参数 - 最小请求数 = 100', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/min-req-100',
      grade: 2,
      count: 5,
      timeWindow: 10,
      minRequestAmount: 100, // 最小请求数 100
      statIntervalMs: 1000,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.minRequestAmount).toBe(100);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 最小请求数=100 规则创建成功: ID=${data.data.id}`);
  });

  test('6. 参数 - 统计时长 = 500ms', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/stat-500ms',
      grade: 2,
      count: 5,
      timeWindow: 10,
      minRequestAmount: 5,
      statIntervalMs: 500, // 统计时长 500ms
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.statIntervalMs).toBe(500);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 统计时长=500ms 规则创建成功: ID=${data.data.id}`);
  });

  test('7. 参数 - 统计时长 = 5000ms', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/stat-5000ms',
      grade: 2,
      count: 5,
      timeWindow: 10,
      minRequestAmount: 5,
      statIntervalMs: 5000, // 统计时长 5秒
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.statIntervalMs).toBe(5000);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 统计时长=5000ms 规则创建成功: ID=${data.data.id}`);
  });

  test('8. 参数 - 熔断时长 = 5秒', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/window-5s',
      grade: 2,
      count: 5,
      timeWindow: 5, // 熔断时长 5秒
      minRequestAmount: 5,
      statIntervalMs: 1000,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.timeWindow).toBe(5);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 熔断时长=5秒 规则创建成功: ID=${data.data.id}`);
  });

  test('9. 参数 - 熔断时长 = 60秒', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/window-60s',
      grade: 2,
      count: 5,
      timeWindow: 60, // 熔断时长 60秒
      minRequestAmount: 5,
      statIntervalMs: 1000,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.degradeRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.timeWindow).toBe(60);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 熔断时长=60秒 规则创建成功: ID=${data.data.id}`);
  });

  test('10. 验证所有降级规则已创建', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.degradeRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);

    const rules = data.data as Array<{ id: number }>;
    const foundCount = createdRuleIds.filter((id) => rules.some((r) => r.id === id)).length;

    console.log(`✅ 验证完成: 创建了 ${createdRuleIds.length} 条降级规则，找到 ${foundCount} 条`);
    expect(foundCount).toBe(createdRuleIds.length);
  });
});
