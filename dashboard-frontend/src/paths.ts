/**
 * Sentinel Dashboard 路由路径配置
 */
export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    custom: {
      signIn: '/auth/sign-in',
      signUp: '/auth/sign-up',
      resetPassword: '/auth/reset-password',
    },
  },
  dashboard: {
    // 首页
    overview: '/dashboard',
    // 应用列表
    apps: '/dashboard/apps',
    // 实例列表
    instances: (app: string) => `/dashboard/apps/${app}/instances`,
    // 实时监控
    metric: (app: string) => `/dashboard/apps/${app}/metric`,
    // 簇点链路
    identity: (app: string) => `/dashboard/apps/${app}/identity`,
    // 流控规则
    flow: {
      list: (app: string) => `/dashboard/apps/${app}/flow`,
      create: (app: string) => `/dashboard/apps/${app}/flow/create`,
      edit: (app: string, id: string) => `/dashboard/apps/${app}/flow/${id}/edit`,
    },
    // 降级规则
    degrade: {
      list: (app: string) => `/dashboard/apps/${app}/degrade`,
      create: (app: string) => `/dashboard/apps/${app}/degrade/create`,
      edit: (app: string, id: string) => `/dashboard/apps/${app}/degrade/${id}/edit`,
    },
    // 热点规则
    paramFlow: {
      list: (app: string) => `/dashboard/apps/${app}/param-flow`,
      create: (app: string) => `/dashboard/apps/${app}/param-flow/create`,
      edit: (app: string, id: string) => `/dashboard/apps/${app}/param-flow/${id}/edit`,
    },
    // 系统规则
    system: {
      list: (app: string) => `/dashboard/apps/${app}/system`,
      create: (app: string) => `/dashboard/apps/${app}/system/create`,
      edit: (app: string, id: string) => `/dashboard/apps/${app}/system/${id}/edit`,
    },
    // 授权规则
    authority: {
      list: (app: string) => `/dashboard/apps/${app}/authority`,
      create: (app: string) => `/dashboard/apps/${app}/authority/create`,
      edit: (app: string, id: string) => `/dashboard/apps/${app}/authority/${id}/edit`,
    },
    // 集群流控
    cluster: {
      // Token Server 列表
      server: '/dashboard/cluster/server',
      // Token Client 列表
      client: '/dashboard/cluster/client',
      // 单机列表 - 分配 Token Server
      assign: (app: string) => `/dashboard/apps/${app}/cluster/assign`,
    },
    // 网关
    gateway: {
      // API 管理
      api: (app: string) => `/dashboard/apps/${app}/gateway/api`,
      // 流控规则
      flow: (app: string) => `/dashboard/apps/${app}/gateway/flow`,
    },
  },
  notFound: '/404',
} as const;
