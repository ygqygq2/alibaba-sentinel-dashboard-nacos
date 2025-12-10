/**
 * 应用和实例相关 API
 */

import type { AppInfo, AppInfoRaw, InstanceInfo, ResourceInfo } from '@/types/sentinel';

import { apiClient } from './client';

/**
 * 将后端原始 AppInfo 转换为前端展示格式
 */
function transformAppInfo(raw: AppInfoRaw): AppInfo {
  const instances = raw.instances || [];
  const healthCount = instances.filter((m) => m.healthy).length;
  const activeCount = instances.length;

  return {
    app: raw.app,
    appType: raw.appType,
    activeCount,
    healthCount,
    unhealthyCount: activeCount - healthCount,
  };
}

/**
 * 应用 API
 */
export const appApi = {
  /**
   * 获取应用列表
   */
  async getApps(): Promise<AppInfo[]> {
    const rawList = await apiClient.get<AppInfoRaw[]>('/app/briefinfos.json');
    return (rawList || []).map(transformAppInfo);
  },

  /**
   * 获取实例列表
   */
  getInstances(app: string): Promise<InstanceInfo[]> {
    return apiClient.get<InstanceInfo[]>(`/app/${encodeURIComponent(app)}/instances.json`);
  },

  /**
   * 移除实例
   */
  removeInstance(app: string, ip: string, port: number): Promise<void> {
    return apiClient.delete<void>(`/app/${encodeURIComponent(app)}/instance/remove.json`, { ip, port });
  },
};

/**
 * 资源 API
 */
export const resourceApi = {
  /**
   * 获取实例的资源列表
   */
  getResources(app: string, ip: string, port: number, type?: string): Promise<ResourceInfo[]> {
    return apiClient.get<ResourceInfo[]>('/resource/instanceResource.json', {
      app,
      ip,
      port,
      type,
    });
  },
};
