/**
 * 簇点链路（资源）Hooks
 */

import { useQuery } from '@tanstack/react-query';

import { resourceApi, type ResourceType } from '@/lib/api/resource';

/** 查询键 */
export const resourceKeys = {
  all: ['resources'] as const,
  machine: (ip: string, port: number, type?: ResourceType, searchKey?: string) =>
    [...resourceKeys.all, 'machine', ip, port, type, searchKey] as const,
};

export interface UseMachineResourcesOptions {
  /** 机器 IP */
  ip: string;
  /** 机器端口 */
  port: number;
  /** 资源类型 */
  type?: ResourceType;
  /** 搜索关键字 */
  searchKey?: string;
  /** 是否启用查询 */
  enabled?: boolean;
  /** 自动刷新间隔（毫秒），默认不刷新 */
  refetchInterval?: number;
}

/**
 * 获取机器资源列表
 */
export function useMachineResources(options: UseMachineResourcesOptions) {
  const { ip, port, type = 'root', searchKey, enabled = true, refetchInterval } = options;

  return useQuery({
    queryKey: resourceKeys.machine(ip, port, type, searchKey),
    queryFn: () => resourceApi.getMachineResource(ip, port, type, searchKey),
    enabled: enabled && !!ip && !!port,
    refetchInterval,
  });
}
