/**
 * 集群流控相关 hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clusterApi, tokenClientApi, tokenServerApi } from '@/lib/api';
import type { ClusterAssignRequest } from '@/types/cluster';

// Query Keys
export const clusterKeys = {
  all: ['cluster'] as const,
  state: (app: string) => [...clusterKeys.all, 'state', app] as const,
  servers: () => [...clusterKeys.all, 'servers'] as const,
  serversByApp: (app: string) => [...clusterKeys.all, 'servers', app] as const,
  clients: () => [...clusterKeys.all, 'clients'] as const,
  clientsByApp: (app: string) => [...clusterKeys.all, 'clients', app] as const,
};

/**
 * 获取应用的集群状态
 */
export function useClusterState(app: string) {
  return useQuery({
    queryKey: clusterKeys.state(app),
    queryFn: () => clusterApi.getClusterState(app),
    enabled: !!app,
  });
}

/**
 * 获取所有 Token Server 列表
 */
export function useAllTokenServers() {
  return useQuery({
    queryKey: clusterKeys.servers(),
    queryFn: () => tokenServerApi.getAllServers(),
    refetchInterval: 10000,
  });
}

/**
 * 获取应用的 Token Server 列表
 */
export function useTokenServers(app: string) {
  return useQuery({
    queryKey: clusterKeys.serversByApp(app),
    queryFn: () => tokenServerApi.getServers(app),
    enabled: !!app,
  });
}

/**
 * 获取所有 Token Client 列表
 */
export function useAllTokenClients() {
  return useQuery({
    queryKey: clusterKeys.clients(),
    queryFn: () => tokenClientApi.getAllClients(),
    refetchInterval: 10000,
  });
}

/**
 * 获取应用的 Token Client 列表
 */
export function useTokenClients(app: string) {
  return useQuery({
    queryKey: clusterKeys.clientsByApp(app),
    queryFn: () => tokenClientApi.getClients(app),
    enabled: !!app,
  });
}

/**
 * 修改集群模式
 */
export function useModifyClusterMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ app, ip, port, mode }: { app: string; ip: string; port: number; mode: number }) =>
      clusterApi.modifyClusterMode(app, ip, port, mode),
    onSuccess: (_, { app }) => {
      queryClient.invalidateQueries({ queryKey: clusterKeys.state(app) });
      queryClient.invalidateQueries({ queryKey: clusterKeys.servers() });
      queryClient.invalidateQueries({ queryKey: clusterKeys.clients() });
    },
  });
}

/**
 * 分配 Token Server
 */
export function useAssignTokenServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ClusterAssignRequest) => tokenServerApi.assignServer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clusterKeys.all });
    },
  });
}

/**
 * 解绑 Token Server
 */
export function useUnbindTokenServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ app, instanceId }: { app: string; instanceId: string }) =>
      tokenServerApi.unbindServer(app, instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clusterKeys.all });
    },
  });
}
