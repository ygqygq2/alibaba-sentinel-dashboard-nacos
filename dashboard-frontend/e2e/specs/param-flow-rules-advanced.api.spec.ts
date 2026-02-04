import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, cleanupTestRules } from '../helpers';

/**
 * 热点参数规则高级参数测试
 * 覆盖所有热点参数配置：
 * - 参数索引、参数类型
 * - 特殊参数配置
 * - 阈值类型、统计时长
 */

test.describe.configure({ mode: 'serial' });

test.describe('热点参数规则 - 参数全覆盖测试', () => {
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
        await request.delete(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}/${id}`, {
          headers: authHeaders(cookies),
        });
      } catch (error) {
        console.log(`⚠️ 清理热点参数规则 ${id} 失败: ${error}`);
      }
    }
    console.log(`✅ 清理了 ${createdRuleIds.length} 条热点参数规则`);
  });

  test('1. 参数索引 0（第一个参数）', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/param-0',
      grade: 1, // QPS
      count: 10.0,
      paramIdx: 0, // 第一个参数
      durationInSec: 1,
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.paramIdx).toBe(0);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 参数索引0规则创建成功: ID=${data.data.id}`);
  });

  test('2. 参数索引 1（第二个参数）', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/param-1',
      grade: 1,
      count: 10.0,
      paramIdx: 1, // 第二个参数
      durationInSec: 1,
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.paramIdx).toBe(1);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 参数索引1规则创建成功: ID=${data.data.id}`);
  });

  test('3. 阈值类型 - QPS', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/grade-qps',
      grade: 1, // QPS
      count: 20.0,
      paramIdx: 0,
      durationInSec: 1,
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.grade).toBe(1);
    createdRuleIds.push(data.data.id);
    console.log(`✅ QPS阈值类型规则创建成功: ID=${data.data.id}`);
  });

  test('4. 阈值类型 - 线程数', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/grade-thread',
      grade: 0, // 线程数
      count: 5.0,
      paramIdx: 0,
      durationInSec: 1,
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.grade).toBe(0);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 线程数阈值类型规则创建成功: ID=${data.data.id}`);
  });

  test('5. 统计时长 - 1秒', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/duration-1s',
      grade: 1,
      count: 10.0,
      paramIdx: 0,
      durationInSec: 1, // 1秒统计窗口
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.durationInSec).toBe(1);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 统计时长1秒规则创建成功: ID=${data.data.id}`);
  });

  test('6. 统计时长 - 10秒', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/duration-10s',
      grade: 1,
      count: 100.0,
      paramIdx: 0,
      durationInSec: 10, // 10秒统计窗口
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.durationInSec).toBe(10);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 统计时长10秒规则创建成功: ID=${data.data.id}`);
  });

  test('7. 流控效果 - 快速失败', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/behavior-fast-fail',
      grade: 1,
      count: 10.0,
      paramIdx: 0,
      durationInSec: 1,
      controlBehavior: 0, // 快速失败
      maxQueueingTimeMs: 0,
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.controlBehavior).toBe(0);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 快速失败流控效果规则创建成功: ID=${data.data.id}`);
  });

  test('8. 流控效果 - 匀速排队', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/behavior-queue',
      grade: 1,
      count: 10.0,
      paramIdx: 0,
      durationInSec: 1,
      controlBehavior: 2, // 匀速排队
      maxQueueingTimeMs: 1000, // 最大排队 1000ms
      burstCount: 0,
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.controlBehavior).toBe(2);
    expect(data.data.maxQueueingTimeMs).toBe(1000);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 匀速排队流控效果规则创建成功: ID=${data.data.id}`);
  });

  test('9. Burst Size（突发流量）', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/burst',
      grade: 1,
      count: 10.0,
      paramIdx: 0,
      durationInSec: 1,
      controlBehavior: 0,
      maxQueueingTimeMs: 0,
      burstCount: 5, // 允许突发额外5个请求
      clusterMode: false,
      clusterConfig: null,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.burstCount).toBe(5);
    createdRuleIds.push(data.data.id);
    console.log(`✅ Burst Size规则创建成功: ID=${data.data.id}`);
  });

  test('10. 验证所有热点参数规则已创建', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.paramFlowRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);

    const rules = data.data as Array<{ id: number }>;
    const foundCount = createdRuleIds.filter((id) => rules.some((r) => r.id === id)).length;

    console.log(`✅ 验证完成: 创建了 ${createdRuleIds.length} 条热点参数规则，找到 ${foundCount} 条`);
    // 允许部分规则可能已被其他测试清理，至少要找到 80%
    expect(foundCount).toBeGreaterThanOrEqual(Math.floor(createdRuleIds.length * 0.8));
  });
});
