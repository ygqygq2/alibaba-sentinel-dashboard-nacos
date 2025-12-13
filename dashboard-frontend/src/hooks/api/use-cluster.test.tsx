/**
 * 集群流控 hooks 单元测试
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useAllTokenClients,
  useAllTokenServers,
  useClusterState,
  useTokenClients,
  useTokenServers,
} from '@/hooks/api/use-cluster';
import { clusterApi, tokenClientApi, tokenServerApi } from '@/lib/api';
import type { ClusterState, ClusterStateInfo, TokenClient, TokenServer } from '@/types/cluster';

// Mock API
vi.mock('@/lib/api', () => ({
  clusterApi: {
    getClusterState: vi.fn(),
    modifyClusterMode: vi.fn(),
    assignCluster: vi.fn(),
  },
  tokenServerApi: {
    getAllServers: vi.fn(),
    getServers: vi.fn(),
  },
  tokenClientApi: {
    getAllClients: vi.fn(),
    getClients: vi.fn(),
  },
}));

const mockClusterApi = clusterApi as unknown as {
  getClusterState: ReturnType<typeof vi.fn>;
  modifyClusterMode: ReturnType<typeof vi.fn>;
  assignCluster: ReturnType<typeof vi.fn>;
};

const mockTokenServerApi = tokenServerApi as unknown as {
  getAllServers: ReturnType<typeof vi.fn>;
  getServers: ReturnType<typeof vi.fn>;
};

const mockTokenClientApi = tokenClientApi as unknown as {
  getAllClients: ReturnType<typeof vi.fn>;
  getClients: ReturnType<typeof vi.fn>;
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

const mockStateInfo: ClusterStateInfo = {
  mode: 0,
  embedded: false,
};

const mockClusterState: ClusterState = {
  app: 'test-app',
  instanceId: 'instance-1',
  ip: '192.168.1.1',
  port: 8719,
  stateInfo: mockStateInfo,
};

const mockTokenServer: TokenServer = {
  id: '192.168.1.1@8719',
  ip: '192.168.1.1',
  port: 8719,
  connectedCount: 0,
  belongToApp: true,
  state: {
    appName: 'test-app',
    port: 18730,
    embedded: false,
    namespaceSet: ['default'],
    connection: [],
  },
};

const mockTokenClient: TokenClient = {
  app: 'test-app',
  ip: '192.168.1.2',
  port: 8719,
  instanceId: 'instance-2',
  serverHost: '192.168.1.1',
  serverPort: 18730,
};

describe('useClusterState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该获取集群状态', async () => {
    mockClusterApi.getClusterState.mockResolvedValueOnce(mockClusterState);

    const { result } = renderHook(() => useClusterState('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockClusterState);
    expect(mockClusterApi.getClusterState).toHaveBeenCalledWith('test-app');
  });

  it('app 为空时不应发起请求', async () => {
    const { result } = renderHook(() => useClusterState(''), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isPending).toBe(true);
    expect(mockClusterApi.getClusterState).not.toHaveBeenCalled();
  });
});

describe('useAllTokenServers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取所有 Token Server 列表', async () => {
    const mockServers: TokenServer[] = [mockTokenServer];
    mockTokenServerApi.getAllServers.mockResolvedValueOnce(mockServers);

    const { result } = renderHook(() => useAllTokenServers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockServers);
    expect(mockTokenServerApi.getAllServers).toHaveBeenCalledTimes(1);
  });
});

describe('useTokenServers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取应用的 Token Server 列表', async () => {
    const mockServers: TokenServer[] = [mockTokenServer];
    mockTokenServerApi.getServers.mockResolvedValueOnce(mockServers);

    const { result } = renderHook(() => useTokenServers('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockServers);
    expect(mockTokenServerApi.getServers).toHaveBeenCalledWith('test-app');
  });
});

describe('useAllTokenClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取所有 Token Client 列表', async () => {
    const mockClients: TokenClient[] = [mockTokenClient];
    mockTokenClientApi.getAllClients.mockResolvedValueOnce(mockClients);

    const { result } = renderHook(() => useAllTokenClients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockClients);
    expect(mockTokenClientApi.getAllClients).toHaveBeenCalledTimes(1);
  });
});

describe('useTokenClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取应用的 Token Client 列表', async () => {
    const mockClients: TokenClient[] = [mockTokenClient];
    mockTokenClientApi.getClients.mockResolvedValueOnce(mockClients);

    const { result } = renderHook(() => useTokenClients('test-app'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockClients);
    expect(mockTokenClientApi.getClients).toHaveBeenCalledWith('test-app');
  });
});
