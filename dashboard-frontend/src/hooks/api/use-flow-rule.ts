/**
 * 流控规则相关 hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { flowRuleApi } from '@/lib/api';
import type { FlowRule } from '@/types/rule';

// Query Keys
export const flowRuleKeys = {
  all: ['flowRules'] as const,
  list: (app: string) => [...flowRuleKeys.all, 'list', app] as const,
  detail: (app: string, id: number) => [...flowRuleKeys.all, 'detail', app, id] as const,
};

/**
 * 获取流控规则列表
 */
export function useFlowRules(app: string) {
  return useQuery({
    queryKey: flowRuleKeys.list(app),
    queryFn: () => flowRuleApi.getRules(app),
    enabled: !!app,
  });
}

/**
 * 创建流控规则
 */
export function useCreateFlowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<FlowRule, 'id'>) => flowRuleApi.createRule(rule),
    onSuccess: (_, rule) => {
      queryClient.invalidateQueries({
        queryKey: flowRuleKeys.list(rule.app),
      });
    },
  });
}

/**
 * 更新流控规则
 */
export function useUpdateFlowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: FlowRule) => flowRuleApi.updateRule(rule),
    onSuccess: (_, rule) => {
      queryClient.invalidateQueries({
        queryKey: flowRuleKeys.list(rule.app),
      });
    },
  });
}

/**
 * 删除流控规则
 */
export function useDeleteFlowRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => flowRuleApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: flowRuleKeys.list(app),
      });
    },
  });
}
