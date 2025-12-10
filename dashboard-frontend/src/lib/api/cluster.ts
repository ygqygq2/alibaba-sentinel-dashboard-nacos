/**
 * 集群流控相关 API
 */

import type { ClusterAssignRequest, ClusterState, TokenClient, TokenServer } from '@/types/cluster';

import { apiClient } from './client';

/**
 * 集群状态 API
 */
export const clusterApi = {
  /**
   * 获取应用的集群状态列表
   */
  getClusterState(app: string): Promise<ClusterState[]> {
    return apiClient.get<ClusterState[]>('/cluster/state_all', { app });
  },

  /**
   * 获取单个实例的集群状态
   */
  getInstanceClusterState(app: string, ip: string, port: number): Promise<ClusterState> {
    return apiClient.get<ClusterState>('/cluster/state_single', {
      app,
      ip,
      port,
    });
  },

  /**
   * 修改集群模式
   * @param mode 0-单机，1-Token Server，2-Token Client
   */
  modifyClusterMode(app: string, ip: string, port: number, mode: number): Promise<void> {
    return apiClient.post<void>('/cluster/config/modify_single', null, {
      app,
      ip,
      port,
      mode,
    });
  },
};

/**
 * Token Server API
 */
export const tokenServerApi = {
  /**
   * 获取所有 Token Server 列表
   */
  getAllServers(): Promise<TokenServer[]> {
    return apiClient.get<TokenServer[]>('/cluster/server_list');
  },

  /**
   * 获取应用的 Token Server 列表
   */
  getServers(app: string): Promise<TokenServer[]> {
    return apiClient.get<TokenServer[]>('/cluster/server_list', { app });
  },

  /**
   * 分配 Token Server
   */
  assignServer(request: ClusterAssignRequest): Promise<void> {
    return apiClient.post<void>('/cluster/assign', request);
  },

  /**
   * 解绑 Token Server
   */
  unbindServer(app: string, instanceId: string): Promise<void> {
    return apiClient.post<void>('/cluster/unbind', null, { app, instanceId });
  },

  /**
   * 修改 Token Server 配置
   */
  modifyServerConfig(app: string, ip: string, port: number, namespaceSet: string[]): Promise<void> {
    return apiClient.post<void>('/cluster/server/modify_config', {
      app,
      ip,
      port,
      namespaceSet,
    });
  },
};

/**
 * Token Client API
 */
export const tokenClientApi = {
  /**
   * 获取所有 Token Client 列表
   */
  getAllClients(): Promise<TokenClient[]> {
    return apiClient.get<TokenClient[]>('/cluster/client_list');
  },

  /**
   * 获取应用的 Token Client 列表
   */
  getClients(app: string): Promise<TokenClient[]> {
    return apiClient.get<TokenClient[]>('/cluster/client_list', { app });
  },

  /**
   * 修改 Token Client 配置
   */
  modifyClientConfig(app: string, ip: string, port: number, serverHost: string, serverPort: number): Promise<void> {
    return apiClient.post<void>('/cluster/client/modify_config', {
      app,
      ip,
      port,
      serverHost,
      serverPort,
    });
  },
};
