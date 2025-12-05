/**
 * 授权规则 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useAuthorityRules,
  useCreateAuthorityRule,
  useDeleteAuthorityRule,
  useUpdateAuthorityRule,
} from '@/hooks/api/use-authority-rule';
import { authorityRuleApi } from '@/lib/api';
import type { AuthorityRule } from '@/types/rule';

// Mock API
vi.mock('@/lib/api', () => ({
  authorityRuleApi: {
    getRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

const mockAuthorityRuleApi = authorityRuleApi as {
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

const mockAuthorityRule: AuthorityRule = {
  id: 1,
  app: 'test-app',
  resource: '/api/test',
  limitApp: 'app1,app2',
  strategy: 0, // 白名单
};

describe('useAuthorityRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取授权规则列表', async () => {
    const mockRules: AuthorityRule[] = [mockAuthorityRule];
    mockAuthorityRuleApi.getRules.mockResolvedValueOnce(mockRules);

    const { result } = renderHook(() => useAuthorityRules('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockAuthorityRuleApi.getRules).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useAuthorityRules(''), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockAuthorityRuleApi.getRules).not.toHaveBeenCalled();
  });
});

describe('useCreateAuthorityRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该创建授权规则', async () => {
    const newRule: Omit<AuthorityRule, 'id'> = {
      app: 'test-app',
      resource: '/api/new',
      limitApp: 'app3',
      strategy: 1, // 黑名单
    };
    const createdRule = { ...newRule, id: 2 };
    mockAuthorityRuleApi.createRule.mockResolvedValueOnce(createdRule);

    const { result } = renderHook(() => useCreateAuthorityRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(newRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockAuthorityRuleApi.createRule).toHaveBeenCalled();
  });
});

describe('useUpdateAuthorityRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该更新授权规则', async () => {
    const updatedRule = { ...mockAuthorityRule, limitApp: 'app1,app2,app3' };
    mockAuthorityRuleApi.updateRule.mockResolvedValueOnce(updatedRule);

    const { result } = renderHook(() => useUpdateAuthorityRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(updatedRule);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockAuthorityRuleApi.updateRule).toHaveBeenCalledWith(updatedRule);
  });
});

describe('useDeleteAuthorityRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该删除授权规则', async () => {
    mockAuthorityRuleApi.deleteRule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteAuthorityRule('test-app'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockAuthorityRuleApi.deleteRule).toHaveBeenCalledWith(1);
  });
});
