/**
 * 降级规则 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCreateDegradeRule,
  useDegradeRules,
  useDeleteDegradeRule,
  useUpdateDegradeRule,
} from '@/hooks/api/use-degrade-rule';
import { degradeRuleApi } from '@/lib/api';
import type { DegradeRule } from '@/types/rule';

// Mock API
vi.mock('@/lib/api', () => ({
  degradeRuleApi: {
    getRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

const mockDegradeRuleApi = degradeRuleApi as {
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

const mockDegradeRule: DegradeRule = {
  id: 1,
  app: 'test-app',
  resource: '/api/test',
  grade: 0, // 慢调用比例
  count: 1000, // 慢调用阈值 RT
  timeWindow: 10,
  minRequestAmount: 5,
  slowRatioThreshold: 0.5,
  statIntervalMs: 1000,
};

describe('useDegradeRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取降级规则列表', async () => {
    const mockRules: DegradeRule[] = [mockDegradeRule];
    mockDegradeRuleApi.getRules.mockResolvedValueOnce(mockRules);

    const { result } = renderHook(() => useDegradeRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockDegradeRuleApi.getRules).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useDegradeRules(''), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockDegradeRuleApi.getRules).not.toHaveBeenCalled();
  });

  it('应该处理获取失败', async () => {
    mockDegradeRuleApi.getRules.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useDegradeRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useCreateDegradeRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该创建降级规则', async () => {
    const newRule: Omit<DegradeRule, 'id'> = {
      app: 'test-app',
      resource: '/api/new',
      grade: 1, // 异常比例
      count: 0.5,
      timeWindow: 10,
      minRequestAmount: 5,
      statIntervalMs: 1000,
    };
    const createdRule = { ...newRule, id: 2 };
    mockDegradeRuleApi.createRule.mockResolvedValueOnce(createdRule);

    const { result } = renderHook(() => useCreateDegradeRule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(newRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockDegradeRuleApi.createRule).toHaveBeenCalledWith(newRule);
  });
});

describe('useUpdateDegradeRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该更新降级规则', async () => {
    const updatedRule = { ...mockDegradeRule, count: 2000 };
    mockDegradeRuleApi.updateRule.mockResolvedValueOnce(updatedRule);

    const { result } = renderHook(() => useUpdateDegradeRule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockDegradeRuleApi.updateRule).toHaveBeenCalledWith(updatedRule);
  });
});

describe('useDeleteDegradeRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该删除降级规则', async () => {
    mockDegradeRuleApi.deleteRule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteDegradeRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockDegradeRuleApi.deleteRule).toHaveBeenCalledWith(1);
  });
});
