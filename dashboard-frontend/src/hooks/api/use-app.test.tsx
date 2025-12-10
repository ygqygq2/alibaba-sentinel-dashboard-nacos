/**
 * 应用 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useApps, useInstances } from '@/hooks/api/use-app';
import { appApi } from '@/lib/api';
import type { AppInfo, InstanceInfo } from '@/types/sentinel';

// Mock API
vi.mock('@/lib/api', () => ({
  appApi: {
    getApps: vi.fn(),
    getInstances: vi.fn(),
    removeInstance: vi.fn(),
  },
}));

const mockAppApi = appApi as {
  getApps: ReturnType<typeof vi.fn>;
  getInstances: ReturnType<typeof vi.fn>;
  removeInstance: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useApps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取应用列表', async () => {
    const mockApps: AppInfo[] = [
      {
        app: 'test-app',
        appType: 0,
        activeCount: 2,
        healthCount: 2,
        unhealthyCount: 0,
      },
    ];
    mockAppApi.getApps.mockResolvedValueOnce(mockApps);

    const { result } = renderHook(() => useApps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockApps);
    expect(mockAppApi.getApps).toHaveBeenCalledTimes(1);
  });

  it('应该处理获取失败', async () => {
    mockAppApi.getApps.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useApps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useInstances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取实例列表', async () => {
    const mockInstances: InstanceInfo[] = [
      {
        app: 'test-app',
        id: 'instance-1',
        hostname: 'host1',
        ip: '192.168.1.1',
        port: 8719,
        healthy: true,
      },
    ];
    mockAppApi.getInstances.mockResolvedValueOnce(mockInstances);

    const { result } = renderHook(() => useInstances('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockInstances);
    expect(mockAppApi.getInstances).toHaveBeenCalledWith('test-app');
  });

  it('应用名为空时不应该发起请求', async () => {
    const { result } = renderHook(() => useInstances(''), {
      wrapper: createWrapper(),
    });

    // 等待一小段时间确保不会发起请求
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isFetching).toBe(false);
    expect(mockAppApi.getInstances).not.toHaveBeenCalled();
  });
});
