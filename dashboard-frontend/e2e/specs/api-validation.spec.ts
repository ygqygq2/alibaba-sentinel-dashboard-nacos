/**
 * API 测试：验证后端 API 的具体错误信息
 */
import { test, expect } from '@playwright/test';
import { DASHBOARD_URL } from '../config';

const APP_NAME = 'sentinel-token-server';
const API_BASE_URL = DASHBOARD_URL;

test.describe('后端 API 验证测试', () => {
  test.use({ storageState: '.auth/user.json' });

  test('测试降级规则（慢调用比例，grade=0）', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'test-slow-call-api',
      grade: 0, // 慢调用比例
      count: 0, // 后端要求的字段
      timeWindow: 5,
      minRequestAmount: 5,
      slowRatioThreshold: 0.5,
      statIntervalMs: 1000,
    };

    console.log('发送数据:', JSON.stringify(rule, null, 2));

    const response = await request.post(`${API_BASE_URL}/v2/degrade/rule`, {
      data: rule,
    });

    const data = await response.json();
    console.log('响应状态:', response.status());
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      console.error('❌ 失败:', data.msg);
    }

    expect(data.code).toBe(0);
  });

  test('测试降级规则（异常比例，grade=1）', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'test-error-ratio-api',
      grade: 1, // 异常比例
      count: 0.5, // 异常比例阈值
      timeWindow: 5,
      minRequestAmount: 5,
    };

    console.log('发送数据:', JSON.stringify(rule, null, 2));

    const response = await request.post(`${API_BASE_URL}/v2/degrade/rule`, {
      data: rule,
    });

    const data = await response.json();
    console.log('响应状态:', response.status());
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      console.error('❌ 失败:', data.msg);
    }

    expect(data.code).toBe(0);
  });

  test('测试热点参数规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'test-hotspot-api',
      paramIdx: 0,
      grade: 1, // QPS
      count: 10,
      durationInSec: 1,
      controlBehavior: 0,
      paramFlowItemList: [],
      clusterMode: false,
    };

    console.log('发送数据:', JSON.stringify(rule, null, 2));

    const response = await request.post(`${API_BASE_URL}/v2/paramFlow/rule`, {
      data: rule,
    });

    const data = await response.json();
    console.log('响应状态:', response.status());
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      console.error('❌ 失败:', data.msg);
    }

    expect(data.code).toBe(0);
  });

  test('测试授权规则', async ({ request }) => {
    const rule = {
      app: APP_NAME,
      resource: 'test-authority-api',
      limitApp: 'test-app',
      strategy: 0, // 白名单
    };

    console.log('发送数据:', JSON.stringify(rule, null, 2));

    const response = await request.post(`${API_BASE_URL}/v2/authority/rule`, {
      data: rule,
    });

    const data = await response.json();
    console.log('响应状态:', response.status());
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      console.error('❌ 失败:', data.msg);
    }

    expect(data.code).toBe(0);
  });
});
