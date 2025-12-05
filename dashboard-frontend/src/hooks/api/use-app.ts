/**
 * 应用和机器相关 hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { appApi } from '@/lib/api';

// Query Keys
export const appKeys = {
  all: ['apps'] as const,
  list: () => [...appKeys.all, 'list'] as const,
  machines: (app: string) => [...appKeys.all, 'machines', app] as const,
};

/**
 * 获取应用列表
 */
export function useApps() {
  return useQuery({
    queryKey: appKeys.list(),
    queryFn: () => appApi.getApps(),
    refetchInterval: 30000, // 30秒刷新一次
  });
}

/**
 * 获取机器列表
 */
export function useMachines(app: string) {
  return useQuery({
    queryKey: appKeys.machines(app),
    queryFn: () => appApi.getMachines(app),
    enabled: !!app,
    refetchInterval: 10000, // 10秒刷新一次
  });
}

/**
 * 删除机器
 */
export function useRemoveMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ app, ip, port }: { app: string; ip: string; port: number }) => appApi.removeMachine(app, ip, port),
    onSuccess: (_, { app }) => {
      // 刷新机器列表
      queryClient.invalidateQueries({ queryKey: appKeys.machines(app) });
      // 刷新应用列表
      queryClient.invalidateQueries({ queryKey: appKeys.list() });
    },
  });
}
