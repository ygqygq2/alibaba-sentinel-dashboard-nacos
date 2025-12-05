/**
 * 热点参数规则 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCreateParamFlowRule,
  useDeleteParamFlowRule,
  useParamFlowRules,
  useUpdateParamFlowRule,
} from '@/hooks/api/use-param-flow-rule';
import { paramFlowRuleApi } from '@/lib/api';
import type { ParamFlowRule } from '@/types/rule';

// Mock API
vi.mock('@/lib/api', () => ({
  paramFlowRuleApi: {
    getRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

const mockParamFlowRuleApi = paramFlowRuleApi as {
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

const mockParamFlowRule: ParamFlowRule = {
  id: 1,
  app: 'test-app',
  resource: '/api/test',
  grade: 1, // QPS 模式
  count: 100,
  paramIdx: 0,
  durationInSec: 1,
  controlBehavior: 0,
};

describe('useParamFlowRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取热点参数规则列表', async () => {
    const mockRules: ParamFlowRule[] = [mockParamFlowRule];
    mockParamFlowRuleApi.getRules.mockResolvedValueOnce(mockRules);

    const { result } = renderHook(() => useParamFlowRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockParamFlowRuleApi.getRules).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useParamFlowRules(''), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockParamFlowRuleApi.getRules).not.toHaveBeenCalled();
  });
});

describe('useCreateParamFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该创建热点参数规则', async () => {
    const newRule: Omit<ParamFlowRule, 'id'> = {
      app: 'test-app',
      resource: '/api/new',
      grade: 1,
      count: 50,
      paramIdx: 1,
      durationInSec: 1,
      controlBehavior: 0,
    };
    const createdRule = { ...newRule, id: 2 };
    mockParamFlowRuleApi.createRule.mockResolvedValueOnce(createdRule);

    const { result } = renderHook(() => useCreateParamFlowRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(newRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockParamFlowRuleApi.createRule).toHaveBeenCalled();
  });
});

describe('useUpdateParamFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该更新热点参数规则', async () => {
    const updatedRule = { ...mockParamFlowRule, count: 200 };
    mockParamFlowRuleApi.updateRule.mockResolvedValueOnce(updatedRule);

    const { result } = renderHook(() => useUpdateParamFlowRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockParamFlowRuleApi.updateRule).toHaveBeenCalledWith(updatedRule);
  });
});

describe('useDeleteParamFlowRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该删除热点参数规则', async () => {
    mockParamFlowRuleApi.deleteRule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteParamFlowRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockParamFlowRuleApi.deleteRule).toHaveBeenCalledWith(1);
  });
});
