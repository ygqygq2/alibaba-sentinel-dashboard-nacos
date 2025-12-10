/**
 * 实时监控相关 hooks
 */

import { useQuery } from '@tanstack/react-query';

import { metricApi } from '@/lib/api';

// Query Keys
export const metricKeys = {
  all: ['metrics'] as const,
  topResource: (app: string) => [...metricKeys.all, 'topResource', app] as const,
  byResource: (app: string, resource: string) => [...metricKeys.all, 'byResource', app, resource] as const,
  byInstance: (app: string, ip: string, port: number) => [...metricKeys.all, 'byInstance', app, ip, port] as const,
  byViewMode: (app: string, viewMode: 'aggregate' | 'instance', instance?: string) =>
    [...metricKeys.all, 'byViewMode', app, viewMode, instance] as const,
};

/**
 * 获取 Top 资源监控数据
 */
export function useTopResourceMetric(
  app: string,
  options?: {
    startTime?: number;
    endTime?: number;
    maxPoints?: number;
    refetchInterval?: number | false;
  }
) {
  const { startTime, endTime, maxPoints, refetchInterval = false } = options ?? {};

  return useQuery({
    queryKey: metricKeys.topResource(app),
    queryFn: () => metricApi.queryTopResource(app, startTime, endTime, maxPoints),
    enabled: !!app,
    refetchInterval,
  });
}

/**
 * 按资源获取监控数据
 */
export function useResourceMetric(
  app: string,
  resource: string,
  options?: {
    startTime?: number;
    endTime?: number;
    refetchInterval?: number;
  }
) {
  const { startTime, endTime, refetchInterval = 10000 } = options ?? {};

  return useQuery({
    queryKey: metricKeys.byResource(app, resource),
    queryFn: () => metricApi.queryByResource(app, resource, startTime, endTime),
    enabled: !!app && !!resource,
    refetchInterval,
  });
}

/**
 * 按实例获取监控数据
 */
export function useInstanceMetric(
  app: string,
  ip: string,
  port: number,
  options?: {
    startTime?: number;
    endTime?: number;
    refetchInterval?: number;
  }
) {
  const { startTime, endTime, refetchInterval = 10000 } = options ?? {};

  return useQuery({
    queryKey: metricKeys.byInstance(app, ip, port),
    queryFn: () => metricApi.queryByInstance(app, ip, port, startTime, endTime),
    enabled: !!app && !!ip && !!port,
    refetchInterval,
  });
}

/**
 * 按视图模式获取监控数据
 */
export function useMetricByViewMode(
  app: string,
  viewMode: 'aggregate' | 'instance',
  options?: {
    instance?: string; // ip:port 格式
    startTime?: number;
    endTime?: number;
    refetchInterval?: number | false;
  }
) {
  const { instance, startTime, endTime, refetchInterval = false } = options ?? {};

  return useQuery({
    queryKey: metricKeys.byViewMode(app, viewMode, instance),
    queryFn: () => metricApi.queryByViewMode(app, viewMode, instance, startTime, endTime),
    enabled: !!app && (viewMode === 'aggregate' || !!instance), // 实例视图需要选择实例
    refetchInterval,
  });
}
