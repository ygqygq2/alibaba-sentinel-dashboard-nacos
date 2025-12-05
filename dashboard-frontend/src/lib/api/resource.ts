/**
 * 簇点链路（资源）API
 */

import type { ClusterNode } from '@/types/sentinel';

import { apiClient } from './client';

export type ResourceType = 'root' | 'default' | 'cluster';

export const resourceApi = {
  /**
   * 获取机器资源链路
   * @param ip 机器 IP
   * @param port 机器端口
   * @param type 资源类型：root-从根节点获取，default-从默认节点获取，cluster-获取集群节点
   * @param searchKey 搜索关键字
   */
  getMachineResource: async (
    ip: string,
    port: number,
    type: ResourceType = 'root',
    searchKey?: string
  ): Promise<ClusterNode[]> => {
    const response = await apiClient.get<ClusterNode[]>('/resource/machineResource.json', {
      ip,
      port,
      type,
      searchKey,
    });
    return response ?? [];
  },
};
