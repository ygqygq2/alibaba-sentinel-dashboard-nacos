/**
 * 系统规则 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCreateSystemRule,
  useDeleteSystemRule,
  useSystemRules,
  useUpdateSystemRule,
} from '@/hooks/api/use-system-rule';
import { systemRuleApi } from '@/lib/api';
import type { SystemRule } from '@/types/rule';

// Mock API
vi.mock('@/lib/api', () => ({
  systemRuleApi: {
    getRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

const mockSystemRuleApi = systemRuleApi as {
  getRules: ReturnType<typeof vi.fn>;
  createRule: ReturnType<typeof vi.fn>;
  updateRule: ReturnType<typeof vi.fn>;
  deleteRule: ReturnType<typeof vi.fn>;
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

const mockSystemRule: SystemRule = {
  id: 1,
  app: 'test-app',
  highestSystemLoad: 10.0,
  highestCpuUsage: 0.8,
  avgRt: 1000,
  maxThread: 100,
  qps: 1000,
};

describe('useSystemRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取系统规则列表', async () => {
    const mockRules: SystemRule[] = [mockSystemRule];
    mockSystemRuleApi.getRules.mockResolvedValueOnce(mockRules);

    const { result } = renderHook(() => useSystemRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockSystemRuleApi.getRules).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useSystemRules(''), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockSystemRuleApi.getRules).not.toHaveBeenCalled();
  });
});

describe('useCreateSystemRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该创建系统规则', async () => {
    const newRule: Omit<SystemRule, 'id'> = {
      app: 'test-app',
      highestSystemLoad: 15.0,
      qps: 500,
    };
    const createdRule = { ...newRule, id: 2 };
    mockSystemRuleApi.createRule.mockResolvedValueOnce(createdRule);

    const { result } = renderHook(() => useCreateSystemRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(newRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSystemRuleApi.createRule).toHaveBeenCalled();
  });
});

describe('useUpdateSystemRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该更新系统规则', async () => {
    const updatedRule = { ...mockSystemRule, qps: 2000 };
    mockSystemRuleApi.updateRule.mockResolvedValueOnce(updatedRule);

    const { result } = renderHook(() => useUpdateSystemRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSystemRuleApi.updateRule).toHaveBeenCalledWith(updatedRule);
  });
});

describe('useDeleteSystemRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该删除系统规则', async () => {
    mockSystemRuleApi.deleteRule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteSystemRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSystemRuleApi.deleteRule).toHaveBeenCalledWith(1);
  });
});
