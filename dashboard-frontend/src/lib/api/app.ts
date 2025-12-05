/**
 * 应用和机器相关 API
 */

import type { AppInfo, AppInfoRaw, MachineInfo, ResourceInfo } from '@/types/sentinel';

import { apiClient } from './client';

/**
 * 将后端原始 AppInfo 转换为前端展示格式
 */
function transformAppInfo(raw: AppInfoRaw): AppInfo {
  const machines = raw.machines || [];
  const healthCount = machines.filter((m) => m.healthy).length;
  const activeCount = machines.length;

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
   * 获取机器列表
   */
  getMachines(app: string): Promise<MachineInfo[]> {
    return apiClient.get<MachineInfo[]>(`/app/${encodeURIComponent(app)}/machines.json`);
  },

  /**
   * 移除机器
   */
  removeMachine(app: string, ip: string, port: number): Promise<void> {
    return apiClient.delete<void>(`/app/${encodeURIComponent(app)}/machine/remove.json`, { ip, port });
  },
};

/**
 * 资源 API
 */
export const resourceApi = {
  /**
   * 获取机器的资源列表
   */
  getResources(app: string, ip: string, port: number, type?: string): Promise<ResourceInfo[]> {
    return apiClient.get<ResourceInfo[]>('/resource/machineResource.json', {
      app,
      ip,
      port,
      type,
    });
  },
};
