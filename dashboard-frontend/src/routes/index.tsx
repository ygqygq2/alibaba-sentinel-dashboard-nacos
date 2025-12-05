/**
 * 应用路由配置
 */

import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { Page as NotFoundPage } from '@/pages/not-found';
import { paths } from '@/paths';

import { route as authRoute } from './auth';
import { route as dashboardRoute } from './dashboard';

export const routes: RouteObject[] = [
  // 首页重定向到 dashboard
  {
    index: true,
    element: (
      <Navigate
        to={paths.dashboard.overview}
        replace
      />
    ),
  },
  // 认证路由
  authRoute,
  // Dashboard 路由
  dashboardRoute,
  // 404 页面
  { path: '*', element: <NotFoundPage /> },
];
