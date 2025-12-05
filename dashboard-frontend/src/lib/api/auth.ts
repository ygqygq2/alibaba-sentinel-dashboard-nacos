/**
 * 认证相关 API
 */

import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
}

export interface UserInfo {
  username: string;
  roles?: string[];
}

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    // 使用 URL 参数形式发送登录请求
    return apiClient.post<LoginResponse>('/auth/login', null, {
      username: data.username,
      password: data.password,
    });
  },

  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<UserInfo> {
    return apiClient.get<UserInfo>('/auth/check');
  },
};
