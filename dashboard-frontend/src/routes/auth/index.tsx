import type { RouteObject } from 'react-router-dom';

import { route as customRoute } from './custom';

export const route: RouteObject = {
  path: 'auth',
  children: [
    // 简化的登录路由 /auth/sign-in
    {
      path: 'sign-in',
      lazy: async () => {
        const { Page } = await import('@/pages/auth/custom/sign-in');
        return { Component: Page };
      },
    },
    customRoute,
  ],
};
