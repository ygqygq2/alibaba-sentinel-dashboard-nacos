/**
 * 客户端 API 鉴权测试
 * 测试 Sentinel 客户端 8719 端口的 app_secret 鉴权机制
 *
 * 注意：Sentinel 认证失败返回 HTTP 400（不是标准的 401）
 * 原因：CommandResponse.ofFailure() 固定返回 400，无法自定义状态码
 */

import { test, expect } from '@playwright/test';
import { CLIENT_API_URL, CLIENT_API_SECRET } from '../config';

test.describe('客户端 API 鉴权', () => {
  test('无 app_secret 访问 getRules 应该被拒绝', async ({ request }) => {
    const response = await request.get(`${CLIENT_API_URL}/getRules`, {
      params: { type: 'flow' },
    });

    // Sentinel 鉴权失败返回 400（不是 401）
    expect([200, 400]).toContain(response.status());
    const text = await response.text();
    expect(text).toContain('app_secret is required');
  });

  test('错误的 app_secret 访问 getRules 应该被拒绝', async ({ request }) => {
    const response = await request.get(`${CLIENT_API_URL}/getRules`, {
      params: {
        type: 'flow',
        app_secret: 'wrong_secret',
      },
    });

    expect([200, 400]).toContain(response.status());
    const text = await response.text();
    expect(text).toContain('Invalid app_secret');
  });

  test('正确的 app_secret 访问 getRules 应该成功', async ({ request }) => {
    const response = await request.get(`${CLIENT_API_URL}/getRules`, {
      params: {
        type: 'flow',
        app_secret: CLIENT_API_SECRET,
      },
    });

    expect(response.status()).toBe(200);
    const text = await response.text();
    // 成功应该返回 JSON 数组（即使为空）
    expect(text).toMatch(/^\[.*\]$/);
  });

  test('无 app_secret 访问 setRules 应该被拒绝', async ({ request }) => {
    const response = await request.get(`${CLIENT_API_URL}/setRules`, {
      params: {
        type: 'flow',
        data: JSON.stringify([]),
      },
    });

    expect([200, 400]).toContain(response.status());
    const text = await response.text();
    expect(text).toContain('app_secret is required');
  });

  test('错误的 app_secret 访问 setRules 应该被拒绝', async ({ request }) => {
    const response = await request.get(`${CLIENT_API_URL}/setRules`, {
      params: {
        type: 'flow',
        data: JSON.stringify([]),
        app_secret: 'wrong_secret',
      },
    });

    expect([200, 400]).toContain(response.status());
    const text = await response.text();
    expect(text).toContain('Invalid app_secret');
  });

  test('正确的 app_secret 访问 setRules 应该成功', async ({ request }) => {
    const testRule = [
      {
        resource: 'test-resource',
        limitApp: 'default',
        grade: 1,
        count: 100,
        strategy: 0,
        controlBehavior: 0,
      },
    ];

    const response = await request.get(`${CLIENT_API_URL}/setRules`, {
      params: {
        type: 'flow',
        data: JSON.stringify(testRule),
        app_secret: CLIENT_API_SECRET,
      },
    });

    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('success');

    // 验证规则已生效（用正确的密钥）
    const verifyResponse = await request.get(`${CLIENT_API_URL}/getRules`, {
      params: {
        type: 'flow',
        app_secret: CLIENT_API_SECRET,
      },
    });

    expect(verifyResponse.status()).toBe(200);
    const rules = await verifyResponse.json();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.some((r: any) => r.resource === 'test-resource')).toBe(true);

    // 清理：删除测试规则
    await request.get(`${CLIENT_API_URL}/setRules`, {
      params: {
        type: 'flow',
        data: JSON.stringify([]),
        app_secret: CLIENT_API_SECRET,
      },
    });
  });

  test('测试所有规则类型的鉴权', async ({ request }) => {
    const ruleTypes = ['flow', 'degrade', 'authority', 'system'];

    for (const type of ruleTypes) {
      // 无密码访问
      const noSecretResponse = await request.get(`${CLIENT_API_URL}/getRules`, {
        params: { type },
      });
      const noSecretText = await noSecretResponse.text();
      expect(noSecretText).toContain('app_secret is required');

      // 正确密码访问
      const validResponse = await request.get(`${CLIENT_API_URL}/getRules`, {
        params: {
          type,
          app_secret: CLIENT_API_SECRET,
        },
      });
      expect(validResponse.status()).toBe(200);
      const validText = await validResponse.text();
      expect(validText).toMatch(/^\[.*\]$/);
    }
  });

  test('setClusterMode 需要鉴权', async ({ request }) => {
    // 无密码访问
    const noSecretResponse = await request.get(`${CLIENT_API_URL}/setClusterMode`, {
      params: { mode: '0' },
    });
    const noSecretText = await noSecretResponse.text();
    expect(noSecretText).toContain('app_secret is required');

    // 错误密码
    const wrongSecretResponse = await request.get(`${CLIENT_API_URL}/setClusterMode`, {
      params: {
        mode: '0',
        app_secret: 'wrong',
      },
    });
    const wrongSecretText = await wrongSecretResponse.text();
    expect(wrongSecretText).toContain('Invalid app_secret');

    // 正确密码（实际测试中可能需要根据当前模式调整）
    const validResponse = await request.get(`${CLIENT_API_URL}/setClusterMode`, {
      params: {
        mode: '0',
        app_secret: CLIENT_API_SECRET,
      },
    });
    expect(validResponse.status()).toBe(200);
    const validText = await validResponse.text();
    // 成功或特定错误（如果 SPI 不可用）
    expect(validText).toMatch(/success|not available/);
  });

  test('监控类 API 不需要鉴权', async ({ request }) => {
    // metric 端点应该可以无密码访问
    const metricResponse = await request.get(`${CLIENT_API_URL}/metric`);
    expect(metricResponse.status()).toBe(200);
    // 不应该返回鉴权错误
    const metricText = await metricResponse.text();
    expect(metricText).not.toContain('app_secret is required');

    // version 端点应该可以无密码访问
    const versionResponse = await request.get(`${CLIENT_API_URL}/version`);
    expect(versionResponse.status()).toBe(200);
  });
});
