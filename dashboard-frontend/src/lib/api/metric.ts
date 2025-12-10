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
  viewMode?: 'aggregate' | 'instance'; // 视图模式
  metric: Record<string, MetricData[] | Record<string, MetricData[]>>; // 聚合视图是 Record<resource, MetricData[]>，实例视图是 Record<instance, Record<resource, MetricData[]>>
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
      if (Array.isArray(metrics) && metrics.length > 0) {
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
   * 按实例获取监控数据
   */
  queryByInstance(app: string, ip: string, port: number, startTime?: number, endTime?: number): Promise<MetricData[]> {
    return apiClient.get<MetricData[]>('/metric/queryByInstance.json', {
      app,
      ip,
      port,
      startTime,
      endTime,
    });
  },

  /**
   * 按视图模式获取监控数据
   * @param app 应用名称
   * @param viewMode 视图模式：'aggregate'（汇总视图）或 'instance'（实例视图）
   * @param instance 实例标识（实例视图时需要，格式：ip:port）
   * @param startTime 开始时间戳（毫秒）
   * @param endTime 结束时间戳（毫秒）
   */
  async queryByViewMode(
    app: string,
    viewMode: 'aggregate' | 'instance' = 'aggregate',
    instance?: string,
    startTime?: number,
    endTime?: number
  ): Promise<ProcessedMetricData> {
    // 实例视图需要 instance 参数
    const params: Record<string, string | number | undefined> = {
      app,
      viewMode,
      startTime,
      endTime,
      pageIndex: 1,
      pageSize: 100, // 获取足够多的数据
    };

    if (viewMode === 'instance' && instance) {
      const [ip, port] = instance.split(':');
      params.ip = ip;
      params.port = Number(port);
    }

    const response = await apiClient.get<MetricResponse>('/metric/queryByViewMode.json', params);

    if (!response || !response.metric) {
      return { current: [], history: new Map() };
    }

    const current: MetricData[] = [];
    const history = new Map<string, MetricData[]>();

    if (response.viewMode === 'instance') {
      // 实例视图：metric 是 Record<instance, Record<resource, MetricData[]>>
      Object.entries(response.metric).forEach(([instance, resourceMetrics]) => {
        if (typeof resourceMetrics === 'object' && !Array.isArray(resourceMetrics)) {
          Object.entries(resourceMetrics).forEach(([resource, metrics]) => {
            if (Array.isArray(metrics) && metrics.length > 0) {
              const key = `${instance}/${resource}`;
              history.set(
                key,
                metrics.map((m) => ({ ...m, resource, instance }))
              );

              const latest = metrics[metrics.length - 1];
              if (latest) {
                current.push({
                  resource,
                  instance,
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
        }
      });
    } else {
      // 聚合视图：metric 是 Record<resource, MetricData[]>
      Object.entries(response.metric).forEach(([resource, metrics]) => {
        if (Array.isArray(metrics) && metrics.length > 0) {
          history.set(
            resource,
            metrics.map((m) => ({ ...m, resource }))
          );

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
    }

    return { current, history };
  },
};
