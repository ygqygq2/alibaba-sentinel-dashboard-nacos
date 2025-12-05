/**
 * 测试工具函数
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * 创建测试用 QueryClient
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * 测试 Providers 包装器
 */
interface TestProvidersProps {
  children: ReactNode;
}

function TestProviders({ children }: TestProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * 自定义 render 函数，包含所有 Providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): ReturnType<typeof render> {
  return render(ui, { wrapper: TestProviders, ...options });
}

// 导出所有 testing-library 的方法
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };
