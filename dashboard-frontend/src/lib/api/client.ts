/**
 * API 客户端 - 统一的 HTTP 请求封装
 */

import type { ApiResponse } from '@/types/sentinel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * HTTP 请求错误
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 处理 401 未授权错误，跳转到登录页
 */
function handleUnauthorized(): void {
  // 检查是否已经在登录页或认证相关页面
  if (window.location.pathname.startsWith('/auth/')) {
    console.warn('[API] 401 error on auth page, ignoring');
    return;
  }

  // 检查 localStorage 中的认证状态
  const isLoggedIn = localStorage.getItem('sentinel-auth') === 'true';

  // 如果 localStorage 显示已登录，可能是后端 session 过期
  // 先清除本地状态，然后跳转
  if (isLoggedIn) {
    console.warn('[API] Session expired (401), clearing local auth state');
    localStorage.removeItem('sentinel-auth');
    localStorage.removeItem('sentinel-user');
  }

  // 保存当前路径，登录后可以跳回
  const returnUrl = window.location.pathname + window.location.search;
  window.location.href = `/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
}

/**
 * 请求配置
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

/**
 * 构建 URL 查询参数
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 发送 HTTP 请求
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  const headers: HeadersInit = {
    ...customHeaders,
  };

  // 如果有 body，设置 Content-Type
  if (body !== undefined) {
    if (body instanceof FormData) {
      // FormData 让浏览器自动设置 Content-Type
    } else {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // 携带 Cookie
  });

  // 处理非 JSON 响应
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      // 401 未授权，跳转到登录页
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new ApiError(response.status, response.statusText);
    }
    return {} as T;
  }

  // 401 未授权，跳转到登录页（JSON 响应）
  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }

  const result: ApiResponse<T> = await response.json();

  // 业务错误处理
  if (result.code !== 0) {
    throw new ApiError(result.code, result.msg || '请求失败', result.data);
  }

  return result.data;
}

/**
 * API 客户端
 */
export const apiClient = {
  /**
   * GET 请求
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'GET', params });
  },

  /**
   * POST 请求
   */
  post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body, params });
  },

  /**
   * PUT 请求
   */
  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body, params });
  },

  /**
   * DELETE 请求
   */
  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE', params });
  },
};
