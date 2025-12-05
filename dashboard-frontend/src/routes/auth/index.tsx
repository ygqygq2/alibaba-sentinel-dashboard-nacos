import * as React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import { StrategyGuard } from '@/components/auth/strategy-guard';
import { AuthStrategy } from '@/lib/auth/strategy';

export const route: RouteObject = {
  path: 'auth',
  element: (
    <StrategyGuard expected={AuthStrategy.CUSTOM}>
      <Outlet />
    </StrategyGuard>
  ),
  children: [
    {
      path: 'reset-password',
      lazy: async () => {
        const { Page } = await import('@/pages/auth/reset-password');
        return { Component: Page };
      },
    },
    {
      path: 'sign-in',
      lazy: async () => {
        const { Page } = await import('@/pages/auth/sign-in');
        return { Component: Page };
      },
    },
    {
      path: 'sign-up',
      lazy: async () => {
        const { Page } = await import('@/pages/auth/sign-up');
        return { Component: Page };
      },
    },
  ],
};
