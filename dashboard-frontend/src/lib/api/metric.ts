/**
 * 实时监控相关 API
 */

import type { MetricData } from '@/types/sentinel';

import { apiClient } from './client';

/**
 * 后端返回的监控数据结构
 */
interface MetricResponse {
  totalCount: number;
  totalPage: number;
  pageIndex: number;
  pageSize: number;
  metric: Record<string, MetricData[]>;
}

/**
 * 处理后的监控数据（包含历史数据）
 */
export interface ProcessedMetricData {
  current: MetricData[];
  history: Map<string, MetricData[]>;
}

/**
 * 监控 API
 */
export const metricApi = {
  /**
   * 获取实时监控数据（返回当前值和历史数据）
   * @param app 应用名称
   * @param startTime 开始时间戳（毫秒）
   * @param endTime 结束时间戳（毫秒）
   * @param maxPoints 最大数据点数（可选）
   */
  async queryTopResource(
    app: string,
    startTime?: number,
    endTime?: number,
    maxPoints?: number
  ): Promise<ProcessedMetricData> {
    const response = await apiClient.get<MetricResponse>('/metric/queryTopResourceMetric.json', {
      app,
      startTime,
      endTime,
      maxPoints,
    });

    // 转换 { metric: { [resource]: MetricVo[] } } 为 MetricData[]
    if (!response || !response.metric) {
      return { current: [], history: new Map() };
    }

    const current: MetricData[] = [];
    const history = new Map<string, MetricData[]>();

    Object.entries(response.metric).forEach(([resource, metrics]) => {
      if (metrics && metrics.length > 0) {
        // 保存历史数据
        history.set(
          resource,
          metrics.map((m) => ({ ...m, resource }))
        );

        // 取最新的一条数据作为当前资源的指标
        const latest = metrics[metrics.length - 1];
        if (latest) {
          current.push({
            resource,
            timestamp: latest.timestamp ?? Date.now(),
            passQps: latest.passQps ?? 0,
            successQps: latest.successQps ?? 0,
            blockQps: latest.blockQps ?? 0,
            exceptionQps: latest.exceptionQps ?? 0,
            rt: latest.rt ?? 0,
            count: latest.count ?? 0,
          });
        }
      }
    });

    return { current, history };
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
