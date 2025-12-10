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
