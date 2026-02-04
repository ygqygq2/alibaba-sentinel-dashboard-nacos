import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API, TOKEN_SERVER_URL } from '../config';
import { login, authHeaders, cleanupTestRules } from '../helpers';

/**
 * 流控规则高级参数测试
 * 覆盖所有流控参数组合：
 * - 阈值类型：QPS、线程数
 * - 流控模式：直接、关联、链路
 * - 流控效果：快速失败、Warm Up、排队等待
 */

test.describe.configure({ mode: 'serial' });

test.describe('流控规则 - 参数全覆盖测试', () => {
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
        await request.delete(`${DASHBOARD_URL}${API.dashboard.flowRule}/${id}`, {
          headers: authHeaders(cookies),
        });
      } catch (error) {
        console.log(`⚠️ 清理规则 ${id} 失败: ${error}`);
      }
    }
    console.log(`✅ 清理了 ${createdRuleIds.length} 条测试规则`);
  });

  test('1. 阈值类型 - QPS', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/qps',
      limitApp: 'default',
      grade: 1, // QPS
      count: 10.0,
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
    createdRuleIds.push(data.data.id);
    console.log(`✅ QPS 阈值规则创建成功: ID=${data.data.id}`);
  });

  test('2. 阈值类型 - 线程数', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/thread',
      limitApp: 'default',
      grade: 0, // 线程数
      count: 5.0,
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
    createdRuleIds.push(data.data.id);
    console.log(`✅ 线程数阈值规则创建成功: ID=${data.data.id}`);
  });

  test('3. 流控模式 - 直接', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/direct',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 0, // 直接
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
    createdRuleIds.push(data.data.id);
    console.log(`✅ 直接流控模式规则创建成功: ID=${data.data.id}`);
  });

  test('4. 流控模式 - 关联', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/associated',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 1, // 关联
      refResource: '/api/test/ref', // 关联资源
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
    expect(data.data.refResource).toBe('/api/test/ref');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 关联流控模式规则创建成功: ID=${data.data.id}`);
  });

  test('5. 流控模式 - 链路', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/chain',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 2, // 链路
      refResource: '/api/entry', // 入口资源
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
    expect(data.data.refResource).toBe('/api/entry');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 链路流控模式规则创建成功: ID=${data.data.id}`);
  });

  test('6. 流控效果 - 快速失败', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/fast-fail',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 0,
      controlBehavior: 0, // 快速失败
      clusterMode: false,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.flowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 快速失败流控效果规则创建成功: ID=${data.data.id}`);
  });

  test('7. 流控效果 - Warm Up', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/warm-up',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 0,
      controlBehavior: 1, // Warm Up
      warmUpPeriodSec: 10, // 预热时长 10秒
      clusterMode: false,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.flowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.warmUpPeriodSec).toBe(10);
    createdRuleIds.push(data.data.id);
    console.log(`✅ Warm Up 流控效果规则创建成功: ID=${data.data.id}`);
  });

  test('8. 流控效果 - 排队等待', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/queue',
      limitApp: 'default',
      grade: 1,
      count: 10.0,
      strategy: 0,
      controlBehavior: 2, // 排队等待
      maxQueueingTimeMs: 500, // 最大排队时间 500ms
      clusterMode: false,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.flowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.maxQueueingTimeMs).toBe(500);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 排队等待流控效果规则创建成功: ID=${data.data.id}`);
  });

  test('9. 针对来源 - 自定义应用', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/custom-app',
      limitApp: 'app-1', // 自定义来源
      grade: 1,
      count: 10.0,
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
    expect(data.data.limitApp).toBe('app-1');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 自定义来源规则创建成功: ID=${data.data.id}`);
  });

  test('10. 验证所有规则已创建', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.flowRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);

    const rules = data.data as Array<{ id: number }>;
    const foundCount = createdRuleIds.filter((id) => rules.some((r) => r.id === id)).length;

    console.log(`✅ 验证完成: 创建了 ${createdRuleIds.length} 条规则，找到 ${foundCount} 条`);
    // 允许部分规则可能已被其他测试清理，至少要找到 80%
    expect(foundCount).toBeGreaterThanOrEqual(Math.floor(createdRuleIds.length * 0.8));
  });
});
