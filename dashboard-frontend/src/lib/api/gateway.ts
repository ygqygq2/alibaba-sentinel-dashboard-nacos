/**
 * 网关相关 API
 */

import type { GatewayApi, GatewayFlowRule } from '@/types/rule';

import { apiClient } from './client';

/**
 * 网关 API 管理
 */
export const gatewayApiApi = {
  /**
   * 获取 API 列表
   */
  getApis(app: string): Promise<GatewayApi[]> {
    return apiClient.get<GatewayApi[]>('/gateway/api/list.json', { app });
  },

  /**
   * 新增 API
   */
  createApi(api: Omit<GatewayApi, 'id'>): Promise<GatewayApi> {
    return apiClient.post<GatewayApi>('/gateway/api/new.json', api);
  },

  /**
   * 更新 API
   */
  updateApi(api: GatewayApi): Promise<GatewayApi> {
    return apiClient.post<GatewayApi>('/gateway/api/save.json', api);
  },

  /**
   * 删除 API
   */
  deleteApi(id: number): Promise<void> {
    return apiClient.post<void>('/gateway/api/delete.json', { id });
  },
};

/**
 * 网关流控规则 API
 */
export const gatewayFlowRuleApi = {
  /**
   * 获取规则列表
   */
  getRules(app: string): Promise<GatewayFlowRule[]> {
    return apiClient.get<GatewayFlowRule[]>('/gateway/flow/list.json', { app });
  },

  /**
   * 新增规则
   */
  createRule(rule: Omit<GatewayFlowRule, 'id'>): Promise<GatewayFlowRule> {
    return apiClient.post<GatewayFlowRule>('/gateway/flow/new.json', rule);
  },

  /**
   * 更新规则
   */
  updateRule(rule: GatewayFlowRule): Promise<GatewayFlowRule> {
    return apiClient.post<GatewayFlowRule>('/gateway/flow/save.json', rule);
  },

  /**
   * 删除规则
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.post<void>('/gateway/flow/delete.json', { id });
  },
};
