/**
 * 降级规则相关 hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { degradeRuleApi } from '@/lib/api';
import type { DegradeRule } from '@/types/rule';

// Query Keys
export const degradeRuleKeys = {
  all: ['degradeRules'] as const,
  list: (app: string) => [...degradeRuleKeys.all, 'list', app] as const,
};

/**
 * 获取降级规则列表
 */
export function useDegradeRules(app: string) {
  return useQuery({
    queryKey: degradeRuleKeys.list(app),
    queryFn: () => degradeRuleApi.getRules(app),
    enabled: !!app,
  });
}

/**
 * 创建降级规则
 */
export function useCreateDegradeRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<DegradeRule, 'id'>) => degradeRuleApi.createRule(rule),
    onSuccess: (_, rule) => {
      queryClient.invalidateQueries({
        queryKey: degradeRuleKeys.list(rule.app),
      });
    },
  });
}

/**
 * 更新降级规则
 */
export function useUpdateDegradeRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: DegradeRule) => degradeRuleApi.updateRule(rule),
    onSuccess: (_, rule) => {
      queryClient.invalidateQueries({
        queryKey: degradeRuleKeys.list(rule.app),
      });
    },
  });
}

/**
 * 删除降级规则
 */
export function useDeleteDegradeRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => degradeRuleApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: degradeRuleKeys.list(app),
      });
    },
  });
}
