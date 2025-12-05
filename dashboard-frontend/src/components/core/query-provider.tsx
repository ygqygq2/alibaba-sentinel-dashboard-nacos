/**
 * React Query Provider
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存时间 5 分钟
      staleTime: 5 * 60 * 1000,
      // 失败重试 3 次
      retry: 3,
      // 窗口聚焦时重新获取
      refetchOnWindowFocus: true,
    },
    mutations: {
      // mutation 失败不重试
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
