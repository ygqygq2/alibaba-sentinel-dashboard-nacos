import { paths } from '@/paths';
import type { NavItemConfig } from '@/types/nav';

/**
 * Sentinel Dashboard 布局配置
 */
export interface LayoutConfig {
  navItems: NavItemConfig[];
}

/**
 * 获取应用的功能菜单项
 */
export function getAppFunctionMenuItems(appName: string): NavItemConfig[] {
  return [
    {
      key: `${appName}-metric`,
      title: '实时监控',
      href: paths.dashboard.metric(appName),
      icon: 'chart-line',
    },
    {
      key: `${appName}-identity`,
      title: '簇点链路',
      href: paths.dashboard.identity(appName),
      icon: 'sitemap',
    },
    {
      key: `${appName}-flow`,
      title: '流控规则',
      href: paths.dashboard.flow.list(appName),
      icon: 'funnel',
      matcher: { type: 'startsWith', href: paths.dashboard.flow.list(appName) },
    },
    {
      key: `${appName}-degrade`,
      title: '熔断规则',
      href: paths.dashboard.degrade.list(appName),
      icon: 'shield-warning',
      matcher: { type: 'startsWith', href: paths.dashboard.degrade.list(appName) },
    },
    {
      key: `${appName}-paramFlow`,
      title: '热点规则',
      href: paths.dashboard.paramFlow.list(appName),
      icon: 'fire',
      matcher: { type: 'startsWith', href: paths.dashboard.paramFlow.list(appName) },
    },
    {
      key: `${appName}-system`,
      title: '系统规则',
      href: paths.dashboard.system.list(appName),
      icon: 'gear',
      matcher: { type: 'startsWith', href: paths.dashboard.system.list(appName) },
    },
    {
      key: `${appName}-authority`,
      title: '授权规则',
      href: paths.dashboard.authority.list(appName),
      icon: 'key',
      matcher: { type: 'startsWith', href: paths.dashboard.authority.list(appName) },
    },
    {
      key: `${appName}-machines`,
      title: '机器列表',
      href: paths.dashboard.machines(appName),
      icon: 'desktop',
    },
  ];
}

/**
 * 获取主导航配置（不包含应用功能菜单）
 * 应用功能菜单由 SideNav 组件动态生成
 */
export function getMainNavConfig(): LayoutConfig {
  return {
    navItems: [
      // 首页
      {
        key: 'home',
        title: '首页',
        href: paths.dashboard.overview,
        icon: 'house',
      },
      // 集群管理
      {
        key: 'cluster-group',
        title: '集群管理',
        items: [
          {
            key: 'cluster-server',
            title: 'Token Server 列表',
            href: paths.dashboard.cluster.server,
            icon: 'hard-drives',
          },
          {
            key: 'cluster-client',
            title: 'Token Client 列表',
            href: paths.dashboard.cluster.client,
            icon: 'laptop',
          },
        ],
      },
    ],
  };
}

/**
 * 静态导航配置（用于加载应用列表前）
 */
export const layoutConfig: LayoutConfig = getMainNavConfig();
