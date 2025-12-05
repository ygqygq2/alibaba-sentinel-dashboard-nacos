/**
 * 系统规则相关 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { systemRuleApi } from '@/lib/api';
import type { SystemRule } from '@/types/rule';

/** 查询键 */
const QUERY_KEYS = {
  systemRules: (app: string) => ['systemRules', app] as const,
};

/**
 * 获取系统规则列表
 */
export function useSystemRules(app: string) {
  return useQuery({
    queryKey: QUERY_KEYS.systemRules(app),
    queryFn: () => systemRuleApi.getRules(app),
    enabled: !!app,
  });
}

/**
 * 创建系统规则
 */
export function useCreateSystemRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<SystemRule, 'id'>) => systemRuleApi.createRule({ ...rule, app }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.systemRules(app) });
    },
  });
}

/**
 * 更新系统规则
 */
export function useUpdateSystemRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: SystemRule) => systemRuleApi.updateRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.systemRules(app) });
    },
  });
}

/**
 * 删除系统规则
 */
export function useDeleteSystemRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => systemRuleApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.systemRules(app) });
    },
  });
}
