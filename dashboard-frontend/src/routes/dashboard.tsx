/**
 * Dashboard 路由配置
 */

import type { RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import { Layout as DashboardLayout } from '@/components/dashboard/layout/layout';

export const route: RouteObject = {
  path: 'dashboard',
  element: (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
  children: [
    // 首页 - 应用列表
    {
      index: true,
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/overview');
        return { Component: Page };
      },
    },
    // 机器列表
    {
      path: 'apps/:app/machines',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/machines/list');
        return { Component: Page };
      },
    },
    // 实时监控
    {
      path: 'apps/:app/metric',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/metric');
        return { Component: Page };
      },
    },
    // 簇点链路
    {
      path: 'apps/:app/identity',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/identity');
        return { Component: Page };
      },
    },
    // 流控规则
    {
      path: 'apps/:app/flow',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/flow/list');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/flow/create',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/flow/create');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/flow/:id/edit',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/flow/edit');
        return { Component: Page };
      },
    },
    // 降级规则
    {
      path: 'apps/:app/degrade',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/degrade/list');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/degrade/create',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/degrade/create');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/degrade/:id/edit',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/degrade/edit');
        return { Component: Page };
      },
    },
    // 热点参数规则
    {
      path: 'apps/:app/param-flow',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/param-flow/list');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/param-flow/create',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/param-flow/create');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/param-flow/:id/edit',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/param-flow/edit');
        return { Component: Page };
      },
    },
    // 系统规则
    {
      path: 'apps/:app/system',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/system/list');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/system/create',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/system/create');
        return { Component: Page };
      },
    },
    // 授权规则
    {
      path: 'apps/:app/authority',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/authority/list');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/authority/create',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/authority/create');
        return { Component: Page };
      },
    },
    {
      path: 'apps/:app/authority/:id/edit',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/authority/edit');
        return { Component: Page };
      },
    },
    // 集群流控 - Token Server
    {
      path: 'apps/:app/cluster/server',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/cluster/server');
        return { Component: Page };
      },
    },
    // 集群流控 - Token Client
    {
      path: 'apps/:app/cluster/client',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/cluster/client');
        return { Component: Page };
      },
    },
    // 全局集群管理 - Token Server 列表
    {
      path: 'cluster/server',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/cluster/server-list');
        return { Component: Page };
      },
    },
    // 全局集群管理 - Token Client 列表
    {
      path: 'cluster/client',
      lazy: async () => {
        const { Page } = await import('@/pages/dashboard/cluster/client-list');
        return { Component: Page };
      },
    },
  ],
};
