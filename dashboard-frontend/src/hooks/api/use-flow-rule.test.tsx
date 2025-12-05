/**
 * 流控规则 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateFlowRule, useDeleteFlowRule, useFlowRules, useUpdateFlowRule } from '@/hooks/api/use-flow-rule';
import { flowRuleApi } from '@/lib/api';
import type { FlowRule } from '@/types/rule';

// Mock API
vi.mock('@/lib/api', () => ({
  flowRuleApi: {
    getRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

const mockFlowRuleApi = flowRuleApi as {
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

const mockFlowRule: FlowRule = {
  id: 1,
  app: 'test-app',
  resource: '/api/test',
  grade: 1,
  count: 100,
  strategy: 0,
  controlBehavior: 0,
  limitApp: 'default',
};

describe('useFlowRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取流控规则列表', async () => {
    const mockRules: FlowRule[] = [mockFlowRule];
    mockFlowRuleApi.getRules.mockResolvedValueOnce(mockRules);

    const { result } = renderHook(() => useFlowRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockFlowRuleApi.getRules).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useFlowRules(''), {
      wrapper: createWrapper(),
    });

    // 等待一段时间确保没有请求发起
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockFlowRuleApi.getRules).not.toHaveBeenCalled();
  });

  it('应该处理获取失败', async () => {
    mockFlowRuleApi.getRules.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useFlowRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useCreateFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该创建流控规则', async () => {
    const newRule: Omit<FlowRule, 'id'> = {
      app: 'test-app',
      resource: '/api/new',
      grade: 1,
      count: 50,
      strategy: 0,
      controlBehavior: 0,
      limitApp: 'default',
    };
    const createdRule = { ...newRule, id: 2 };
    mockFlowRuleApi.createRule.mockResolvedValueOnce(createdRule);

    const { result } = renderHook(() => useCreateFlowRule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(newRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFlowRuleApi.createRule).toHaveBeenCalledWith(newRule);
  });

  it('应该处理创建失败', async () => {
    mockFlowRuleApi.createRule.mockRejectedValueOnce(new Error('Create failed'));

    const { result } = renderHook(() => useCreateFlowRule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        app: 'test-app',
        resource: '/api/test',
        grade: 1,
        count: 100,
        strategy: 0,
        controlBehavior: 0,
        limitApp: 'default',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该更新流控规则', async () => {
    const updatedRule = { ...mockFlowRule, count: 200 };
    mockFlowRuleApi.updateRule.mockResolvedValueOnce(updatedRule);

    const { result } = renderHook(() => useUpdateFlowRule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFlowRuleApi.updateRule).toHaveBeenCalledWith(updatedRule);
  });
});

describe('useDeleteFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该删除流控规则', async () => {
    mockFlowRuleApi.deleteRule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteFlowRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFlowRuleApi.deleteRule).toHaveBeenCalledWith(1);
  });
});
