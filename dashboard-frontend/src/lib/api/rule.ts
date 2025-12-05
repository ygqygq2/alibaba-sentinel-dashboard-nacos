/**
 * 规则相关 API
 */

import type { AuthorityRule, DegradeRule, FlowRule, ParamFlowRule, SystemRule } from '@/types/rule';

import { apiClient } from './client';

/**
 * 流控规则 API (V2 版本，使用 Nacos 持久化)
 */
export const flowRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<FlowRule[]> {
    return apiClient.get<FlowRule[]>('/v2/flow/rules', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<FlowRule, 'id'>): Promise<FlowRule> {
    return apiClient.post<FlowRule>('/v2/flow/rule', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: FlowRule): Promise<FlowRule> {
    return apiClient.put<FlowRule>(`/v2/flow/rule/${rule.id}`, rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`/v2/flow/rule/${id}`);
  },
};

/**
 * 降级规则 API (V2 版本)
 */
export const degradeRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<DegradeRule[]> {
    return apiClient.get<DegradeRule[]>('/v2/degrade/rules', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<DegradeRule, 'id'>): Promise<DegradeRule> {
    return apiClient.post<DegradeRule>('/v2/degrade/rule', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: DegradeRule): Promise<DegradeRule> {
    return apiClient.put<DegradeRule>(`/v2/degrade/rule/${rule.id}`, rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`/v2/degrade/rule/${id}`);
  },
};

/**
 * 热点参数规则 API (V2 版本)
 */
export const paramFlowRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<ParamFlowRule[]> {
    return apiClient.get<ParamFlowRule[]>('/v2/paramFlow/rules', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<ParamFlowRule, 'id'>): Promise<ParamFlowRule> {
    return apiClient.post<ParamFlowRule>('/v2/paramFlow/rule', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: ParamFlowRule): Promise<ParamFlowRule> {
    return apiClient.put<ParamFlowRule>(`/v2/paramFlow/rule/${rule.id}`, rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`/v2/paramFlow/rule/${id}`);
  },
};

/**
 * 系统规则 API (V2 版本)
 */
export const systemRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<SystemRule[]> {
    return apiClient.get<SystemRule[]>('/v2/system/rules', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<SystemRule, 'id'>): Promise<SystemRule> {
    return apiClient.post<SystemRule>('/v2/system/rule', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: SystemRule): Promise<SystemRule> {
    return apiClient.put<SystemRule>(`/v2/system/rule/${rule.id}`, rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`/v2/system/rule/${id}`);
  },
};

/**
 * 授权规则 API (V2 版本)
 */
export const authorityRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<AuthorityRule[]> {
    return apiClient.get<AuthorityRule[]>('/v2/authority/rules', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<AuthorityRule, 'id'>): Promise<AuthorityRule> {
    return apiClient.post<AuthorityRule>('/v2/authority/rule', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: AuthorityRule): Promise<AuthorityRule> {
    return apiClient.put<AuthorityRule>(`/v2/authority/rule/${rule.id}`, rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`/v2/authority/rule/${id}`);
  },
};
