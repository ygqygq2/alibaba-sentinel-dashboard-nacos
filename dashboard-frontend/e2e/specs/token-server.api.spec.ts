import { test, expect } from '@playwright/test';
import { TOKEN_SERVER_URL, API } from '../config';

/**
 * Token Server API 测试
 */
test.describe('Token Server - 基础接口', () => {
  test('hello 接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.hello}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).message).toBe('Hello, Sentinel!');
  });

  test('chain 调用链接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.chain}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.paymentService).toBe('success');
    expect(data.orderService).toBe('success');
    expect(data.userService).toBe('success');
  });
});

test.describe('Token Server - 流控', () => {
  test('QPS 流控接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.flowQps}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).message).toContain('Flow QPS test passed');
  });

  test('Thread 流控接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.flowThread}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).message).toContain('Flow Thread test passed');
  });
});

test.describe('Token Server - 降级', () => {
  test('慢调用接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.degradeSlow}`, {
      params: { delay: 100 },
    });
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).delay).toBeDefined();
  });

  test('错误率接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.degradeError}`, {
      params: { errorRate: 0 },
    });
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).message).toContain('test passed');
  });
});

test.describe('Token Server - 热点', () => {
  test('单参数热点接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.hotspot(123)}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).id).toBe(123);
  });

  test('多参数热点接口', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.hotspotMulti}`, {
      params: { userId: 1, productId: 100 },
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.userId).toBe(1);
    expect(data.productId).toBe(100);
  });
});

test.describe('Token Server - 业务', () => {
  test('创建订单', async ({ request }) => {
    const response = await request.post(`${TOKEN_SERVER_URL}${API.tokenServer.orderCreate}`, {
      params: { userId: 1, productId: 100, quantity: 2 },
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.orderId).toBeDefined();
    expect(data.queryProduct).toBe('success');
  });

  test('获取用户信息', async ({ request }) => {
    const response = await request.get(`${TOKEN_SERVER_URL}${API.tokenServer.user(123)}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.userId).toBe(123);
    expect(data.username).toBe('user_123');
  });
});
