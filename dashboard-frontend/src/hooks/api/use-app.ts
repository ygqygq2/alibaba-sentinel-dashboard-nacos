/**
 * 应用和实例相关 hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { appApi } from '@/lib/api';

// Query Keys
export const appKeys = {
  all: ['apps'] as const,
  list: () => [...appKeys.all, 'list'] as const,
  instances: (app: string) => [...appKeys.all, 'instances', app] as const,
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
 * 获取实例列表
 */
export function useInstances(app: string) {
  return useQuery({
    queryKey: appKeys.instances(app),
    queryFn: () => appApi.getInstances(app),
    enabled: !!app,
    refetchInterval: 10000, // 10秒刷新一次
  });
}

/**
 * 删除实例
 */
export function useRemoveInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ app, ip, port }: { app: string; ip: string; port: number }) => appApi.removeInstance(app, ip, port),
    onSuccess: (_, { app }) => {
      // 刷新实例列表
      queryClient.invalidateQueries({ queryKey: appKeys.instances(app) });
      // 刷新应用列表
      queryClient.invalidateQueries({ queryKey: appKeys.list() });
    },
  });
}
