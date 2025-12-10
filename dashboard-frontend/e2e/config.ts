/**
 * E2E 测试配置常量
 * 集中管理所有测试配置
 */

// 服务地址
// - 本地开发（CI 未设置）：前端开发服务器 3000 + 后端 8080
// - CI 环境（CI=true）：打包后的前端在 8080
const isCI = process.env.CI === 'true';
export const DASHBOARD_URL = isCI
  ? process.env.DASHBOARD_URL || 'http://localhost:8080'
  : process.env.DASHBOARD_URL || 'http://localhost:3000';
export const TOKEN_SERVER_URL = process.env.TOKEN_SERVER_URL || 'http://localhost:8081';

// 客户端 API 端口（Sentinel 客户端暴露的 8719 端口）
export const CLIENT_API_PORT = process.env.CLIENT_API_PORT || '8719';
export const CLIENT_API_URL = `http://localhost:${CLIENT_API_PORT}`;

// 客户端 API 密钥（用于测试 8719 端口的鉴权）
export const CLIENT_API_SECRET = process.env.CLIENT_API_SECRET || 'sentinel_app_secret';

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
    instances: (app: string) => `/app/${app}/instances.json`,
    resource: '/resource/instanceResource.json',
    // v2 API (Nacos 持久化，只需 app 参数)
    flowRules: '/v2/flow/rules',
    flowRule: '/v2/flow/rule',
    // v1 API (需要 app, ip, port 参数)
    degradeRules: '/degrade/rules.json',
    degradeRule: '/degrade/rule',
    systemRules: '/system/rules.json',
    systemRule: '/system/rule',
    authorityRules: '/authority/rules',
    authorityRule: '/authority/rule',
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
