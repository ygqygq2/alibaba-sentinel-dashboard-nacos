import { test, expect } from '@playwright/test';
import { DASHBOARD_URL, APP_NAME, API } from '../config';
import { login, authHeaders, cleanupTestRules } from '../helpers';

/**
 * 授权规则参数全覆盖测试
 * 覆盖所有授权策略：
 * - 黑名单、白名单
 * - 单个来源、多个来源
 */

test.describe.configure({ mode: 'serial' });

test.describe('授权规则 - 参数全覆盖测试', () => {
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
        await request.delete(`${DASHBOARD_URL}${API.dashboard.authorityRule}/${id}`, {
          headers: authHeaders(cookies),
        });
      } catch (error) {
        console.log(`⚠️ 清理授权规则 ${id} 失败: ${error}`);
      }
    }
    console.log(`✅ 清理了 ${createdRuleIds.length} 条授权规则`);
  });

  test('1. 白名单 - 单个来源', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/whitelist-single',
      limitApp: 'app-1', // 白名单来源
      strategy: 0, // 白名单模式
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.strategy).toBe(0);
    expect(data.data.limitApp).toBe('app-1');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 白名单单来源规则创建成功: ID=${data.data.id}`);
  });

  test('2. 白名单 - 多个来源', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/whitelist-multi',
      limitApp: 'app-1,app-2,app-3', // 多个白名单来源
      strategy: 0, // 白名单模式
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.strategy).toBe(0);
    expect(data.data.limitApp).toBe('app-1,app-2,app-3');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 白名单多来源规则创建成功: ID=${data.data.id}`);
  });

  test('3. 黑名单 - 单个来源', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/blacklist-single',
      limitApp: 'bad-app', // 黑名单来源
      strategy: 1, // 黑名单模式
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.strategy).toBe(1);
    expect(data.data.limitApp).toBe('bad-app');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 黑名单单来源规则创建成功: ID=${data.data.id}`);
  });

  test('4. 黑名单 - 多个来源', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/blacklist-multi',
      limitApp: 'bad-app-1,bad-app-2,bad-app-3', // 多个黑名单来源
      strategy: 1, // 黑名单模式
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.strategy).toBe(1);
    expect(data.data.limitApp).toBe('bad-app-1,bad-app-2,bad-app-3');
    createdRuleIds.push(data.data.id);
    console.log(`✅ 黑名单多来源规则创建成功: ID=${data.data.id}`);
  });

  test('5. 不同资源的白名单规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/resource-a',
      limitApp: 'trusted-app',
      strategy: 0,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 资源A白名单规则创建成功: ID=${data.data.id}`);
  });

  test('6. 不同资源的黑名单规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: '/api/test/resource-b',
      limitApp: 'untrusted-app',
      strategy: 1,
    };

    const response = await request.post(`${DASHBOARD_URL}${API.dashboard.authorityRule}`, {
      data: rule,
      headers: { ...authHeaders(cookies), 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    createdRuleIds.push(data.data.id);
    console.log(`✅ 资源B黑名单规则创建成功: ID=${data.data.id}`);
  });

  test('7. 验证所有授权规则已创建', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request.get(`${DASHBOARD_URL}${API.dashboard.authorityRules}`, {
      params: { app: APP_NAME },
      headers: authHeaders(cookies),
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);

    const rules = data.data as Array<{ id: number }>;
    const foundCount = createdRuleIds.filter((id) => rules.some((r) => r.id === id)).length;

    console.log(`✅ 验证完成: 创建了 ${createdRuleIds.length} 条授权规则，找到 ${foundCount} 条`);
    expect(foundCount).toBe(createdRuleIds.length);
  });
});
