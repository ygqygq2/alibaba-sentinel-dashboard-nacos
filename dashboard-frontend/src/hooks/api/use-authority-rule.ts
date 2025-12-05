/**
 * 授权规则相关 Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authorityRuleApi } from '@/lib/api';
import type { AuthorityRule } from '@/types/rule';

/** 查询键 */
const QUERY_KEYS = {
  authorityRules: (app: string) => ['authorityRules', app] as const,
};

/**
 * 获取授权规则列表
 */
export function useAuthorityRules(app: string) {
  return useQuery({
    queryKey: QUERY_KEYS.authorityRules(app),
    queryFn: () => authorityRuleApi.getRules(app),
    enabled: !!app,
  });
}

/**
 * 创建授权规则
 */
export function useCreateAuthorityRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<AuthorityRule, 'id'>) => authorityRuleApi.createRule({ ...rule, app }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authorityRules(app) });
    },
  });
}

/**
 * 更新授权规则
 */
export function useUpdateAuthorityRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: AuthorityRule) => authorityRuleApi.updateRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authorityRules(app) });
    },
  });
}

/**
 * 删除授权规则
 */
export function useDeleteAuthorityRule(app: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authorityRuleApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authorityRules(app) });
    },
  });
}
