import { APIRequestContext } from '@playwright/test';
import { DASHBOARD_URL, TEST_USER, API, APP_NAME } from './config';

/**
 * 测试辅助函数
 */

/**
 * 登录并返回 cookie
 */
export async function login(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${DASHBOARD_URL}${API.dashboard.login}`, {
    params: TEST_USER,
  });
  const cookies = response.headers()['set-cookie']?.split(';')[0] || '';
  return cookies;
}

/**
 * 带认证的请求头
 */
export function authHeaders(cookies: string) {
  return { Cookie: cookies };
}

/**
 * 获取机器信息（ip 和 port）
 */
export async function getInstanceInfo(
  request: APIRequestContext,
  cookies: string,
  app = APP_NAME
): Promise<{ ip: string; port: number }> {
  const response = await request.get(`${DASHBOARD_URL}${API.dashboard.instances(app)}`, {
    headers: authHeaders(cookies),
  });
  const data = await response.json();
  const instance = data.data?.[0];
  if (!instance) {
    throw new Error(`No instance found for app: ${app}`);
  }
  return { ip: instance.ip, port: instance.port };
}

/**
 * 等待一段时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 清理测试规则
 * 删除所有资源名匹配测试模式的规则
 */
export async function cleanupTestRules(
  request: APIRequestContext,
  cookies: string,
  app = APP_NAME
): Promise<void> {
  const testPatterns = [
    '/api/test',
    '/e2e',
    'test-',
    '-test-',
    '/api/degrade/slow',
    '/api/degrade/error',
    '/api/degrade/exception',
    '/api/flow/',
    '/api/protected',
    '/api/param',
    'hotspot',
  ];

  // 清理流控规则
  try {
    const flowResp = await request.get(`${DASHBOARD_URL}${API.dashboard.flowRules}`, {
      params: { app },
      headers: authHeaders(cookies),
    });
    if (flowResp.ok()) {
      const flowData = await flowResp.json();
      const flowRules = flowData.data || [];
      for (const rule of flowRules) {
        if (testPatterns.some((pattern) => rule.resource?.includes(pattern))) {
          await request.delete(`${DASHBOARD_URL}${API.dashboard.flowRule}/${rule.id}`, {
            headers: authHeaders(cookies),
          });
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理流控规则失败:', error);
  }

  // 清理降级规则
  try {
    const degradeResp = await request.get(`${DASHBOARD_URL}${API.dashboard.degradeRules}`, {
      params: { app },
      headers: authHeaders(cookies),
    });
    if (degradeResp.ok()) {
      const degradeData = await degradeResp.json();
      const degradeRules = degradeData.data || [];
      for (const rule of degradeRules) {
        if (testPatterns.some((pattern) => rule.resource?.includes(pattern))) {
          await request.delete(`${DASHBOARD_URL}${API.dashboard.degradeRule}/${rule.id}`, {
            headers: authHeaders(cookies),
          });
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理降级规则失败:', error);
  }

  // 清理热点参数规则
  try {
    const paramResp = await request.get(`${DASHBOARD_URL}${API.dashboard.paramFlowRules}`, {
      params: { app },
      headers: authHeaders(cookies),
    });
    if (paramResp.ok()) {
      const paramData = await paramResp.json();
      const paramRules = paramData.data || [];
      for (const rule of paramRules) {
        if (testPatterns.some((pattern) => rule.resource?.includes(pattern))) {
          await request.delete(`${DASHBOARD_URL}${API.dashboard.paramFlowRule}/${rule.id}`, {
            headers: authHeaders(cookies),
          });
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理热点参数规则失败:', error);
  }

  // 清理系统规则（全部清理，测试规则通常是临时的）
  try {
    const systemResp = await request.get(`${DASHBOARD_URL}${API.dashboard.systemRules}`, {
      params: { app },
      headers: authHeaders(cookies),
    });
    if (systemResp.ok()) {
      const systemData = await systemResp.json();
      const systemRules = systemData.data || [];
      for (const rule of systemRules) {
        await request.delete(`${DASHBOARD_URL}${API.dashboard.systemRule}/${rule.id}`, {
          headers: authHeaders(cookies),
        });
      }
    }
  } catch (error) {
    console.log('⚠️ 清理系统规则失败:', error);
  }

  // 清理授权规则
  try {
    const authResp = await request.get(`${DASHBOARD_URL}${API.dashboard.authorityRules}`, {
      params: { app },
      headers: authHeaders(cookies),
    });
    if (authResp.ok()) {
      const authData = await authResp.json();
      const authRules = authData.data || [];
      for (const rule of authRules) {
        if (testPatterns.some((pattern) => rule.resource?.includes(pattern))) {
          await request.delete(`${DASHBOARD_URL}${API.dashboard.authorityRule}/${rule.id}`, {
            headers: authHeaders(cookies),
          });
        }
      }
    }
  } catch (error) {
    console.log('⚠️ 清理授权规则失败:', error);
  }
}

/**
 * 规则测试通用流程
 */
export interface RuleTestHelpers {
  /**
   * 创建规则
   * @param request API 请求上下文
   * @param cookies 认证 cookie
   * @param ruleData 规则数据
   * @returns 创建的规则 ID
   */
  createRule: (request: APIRequestContext, cookies: string, ruleData: any) => Promise<number>;

  /**
   * 获取规则列表
   * @param request API 请求上下文
   * @param cookies 认证 cookie
   * @param app 应用名
   * @returns 规则列表
   */
  getRules: (request: APIRequestContext, cookies: string, app: string) => Promise<any[]>;

  /**
   * 删除规则
   * @param request API 请求上下文
   * @param cookies 认证 cookie
   * @param ruleId 规则 ID
   */
  deleteRule: (request: APIRequestContext, cookies: string, ruleId: number) => Promise<void>;
}

/**
 * 触发 Token Server 产生资源数据
 */
export async function triggerResourceData(count = 5): Promise<void> {
  const { TOKEN_SERVER_URL, API } = await import('./config');

  for (let i = 0; i < count; i++) {
    await fetch(`${TOKEN_SERVER_URL}${API.tokenServer.hello}`).catch(() => {});
    await fetch(`${TOKEN_SERVER_URL}${API.tokenServer.chain}`).catch(() => {});
  }
  await sleep(2000);
}
