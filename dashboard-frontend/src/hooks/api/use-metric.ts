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
  byMachine: (app: string, ip: string, port: number) => [...metricKeys.all, 'byMachine', app, ip, port] as const,
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
    refetchInterval?: number;
  }
) {
  const { startTime, endTime, maxPoints, refetchInterval = 5000 } = options ?? {};

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
  const { startTime, endTime, refetchInterval = 5000 } = options ?? {};

  return useQuery({
    queryKey: metricKeys.byResource(app, resource),
    queryFn: () => metricApi.queryByResource(app, resource, startTime, endTime),
    enabled: !!app && !!resource,
    refetchInterval,
  });
}

/**
 * 按机器获取监控数据
 */
export function useMachineMetric(
  app: string,
  ip: string,
  port: number,
  options?: {
    startTime?: number;
    endTime?: number;
    refetchInterval?: number;
  }
) {
  const { startTime, endTime, refetchInterval = 5000 } = options ?? {};

  return useQuery({
    queryKey: metricKeys.byMachine(app, ip, port),
    queryFn: () => metricApi.queryByMachine(app, ip, port, startTime, endTime),
    enabled: !!app && !!ip && !!port,
    refetchInterval,
  });
}
