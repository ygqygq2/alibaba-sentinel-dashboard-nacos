/**
 * E2E 测试配置常量
 * 集中管理所有测试配置
 */

// 服务地址
// - 开发模式（DEV_MODE=1）：前端开发服务器 3000 + 后端 8080
// - 生产模式（默认）：打包后的前端在 8080
const isDev = process.env.DEV_MODE === '1';
export const DASHBOARD_URL = isDev
  ? process.env.DASHBOARD_URL || 'http://localhost:3000'
  : process.env.DASHBOARD_URL || 'http://localhost:8080';
export const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:8081';

// 测试应用名称
export const APP_NAME = 'sentinel-token-server';

// 测试账号
export const TEST_USER = {
  username: 'sentinel',
  password: 'sentinel',
};

// 超时配置
export const TIMEOUT = {
  short: 5000,
  medium: 15000,
  long: 30000,
  serviceReady: 60000,
};

// API 路径
export const API = {
  // Dashboard API
  dashboard: {
    login: '/auth/login',
    logout: '/auth/logout',
    check: '/auth/check',
    apps: '/app/briefinfos.json',
    machines: (app: string) => `/app/${app}/machines.json`,
    resource: '/resource/machineResource.json',
    // v2 API (Nacos 持久化，只需 app 参数)
    flowRules: '/v2/flow/rules',
    flowRule: '/v2/flow/rule',
    // v1 API (需要 app, ip, port 参数)
    degradeRules: '/degrade/rules.json',
    systemRules: '/system/rules.json',
    authorityRules: '/authority/rules',
    paramFlowRules: '/paramFlow/rules',
  },
  // Token Server API
  tokenServer: {
    health: '/actuator/health',
    hello: '/api/hello',
    chain: '/api/chain',
    flowQps: '/api/flow/qps',
    flowThread: '/api/flow/thread',
    degradeSlow: '/api/degrade/slow',
    degradeError: '/api/degrade/error',
    hotspot: (id: number | string) => `/api/hotspot/${id}`,
    hotspotMulti: '/api/hotspot/multi',
    systemQps: '/api/system/qps',
    authResource: '/api/auth/resource',
    orderCreate: '/api/order/create',
    user: (id: number | string) => `/api/user/${id}`,
  },
};
