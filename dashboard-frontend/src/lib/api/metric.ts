/**
 * 实时监控相关 API
 */

import type { MetricData } from '@/types/sentinel';

import { apiClient } from './client';

/**
 * 监控 API
 */
export const metricApi = {
  /**
   * 获取实时监控数据
   * @param app 应用名称
   * @param startTime 开始时间戳（毫秒）
   * @param endTime 结束时间戳（毫秒）
   * @param maxPoints 最大数据点数（可选）
   */
  queryTopResource(app: string, startTime?: number, endTime?: number, maxPoints?: number): Promise<MetricData[]> {
    return apiClient.get<MetricData[]>('/metric/queryTopResourceMetric.json', {
      app,
      startTime,
      endTime,
      maxPoints,
    });
  },

  /**
   * 按资源名获取监控数据
   */
  queryByResource(app: string, resource: string, startTime?: number, endTime?: number): Promise<MetricData[]> {
    return apiClient.get<MetricData[]>('/metric/queryByResource.json', {
      app,
      resource,
      startTime,
      endTime,
    });
  },

  /**
   * 按机器获取监控数据
   */
  queryByMachine(app: string, ip: string, port: number, startTime?: number, endTime?: number): Promise<MetricData[]> {
    return apiClient.get<MetricData[]>('/metric/queryByMachine.json', {
      app,
      ip,
      port,
      startTime,
      endTime,
    });
  },
};
