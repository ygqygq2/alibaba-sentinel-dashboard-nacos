/**
 * 热点参数规则相关 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { paramFlowRuleApi } from '@/lib/api';
import type { ParamFlowRule } from '@/types/rule';

/** 查询键 */
const QUERY_KEYS = {
  paramFlowRules: (app: string) => ['paramFlowRules', app] as const,
};

/**
 * 获取热点参数规则列表
 */
export function useParamFlowRules(app: string) {
  return useQuery({
    queryKey: QUERY_KEYS.paramFlowRules(app),
    queryFn: () => paramFlowRuleApi.getRules(app),
    enabled: !!app,
  });
}

/**
 * 创建热点参数规则
 */
export function useCreateParamFlowRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<ParamFlowRule, 'id'>) => paramFlowRuleApi.createRule({ ...rule, app }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paramFlowRules(app) });
    },
  });
}

/**
 * 更新热点参数规则
 */
export function useUpdateParamFlowRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: ParamFlowRule) => paramFlowRuleApi.updateRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paramFlowRules(app) });
    },
  });
}

/**
 * 删除热点参数规则
 */
export function useDeleteParamFlowRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paramFlowRuleApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paramFlowRules(app) });
    },
  });
}
