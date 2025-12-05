/**
 * API 客户端单元测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/client';

describe('ApiError', () => {
  it('应该正确创建错误实例', () => {
    const error = new ApiError(1001, '参数错误', { field: 'name' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(1001);
    expect(error.message).toBe('参数错误');
    expect(error.data).toEqual({ field: 'name' });
    expect(error.name).toBe('ApiError');
  });

  it('data 可以为空', () => {
    const error = new ApiError(500, '服务器错误');

    expect(error.code).toBe(500);
    expect(error.message).toBe('服务器错误');
    expect(error.data).toBeUndefined();
  });
});

describe('apiClient', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('请求发送', () => {
    it('GET 请求应该使用正确的方法', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ code: 0, data: { id: 1 } }),
      });

      // 动态导入以确保使用新的 mock
      const { apiClient } = await import('@/lib/api/client');
      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe('GET');
    });

    it('POST 请求应该携带 body', async () => {
      const requestBody = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ code: 0, data: { id: 1 } }),
      });

      const { apiClient } = await import('@/lib/api/client');
      await apiClient.post('/test', requestBody);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify(requestBody));
    });
  });

  describe('错误处理', () => {
    it('业务错误应该抛出 ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ code: 1001, msg: '参数错误' }),
      });

      const { apiClient } = await import('@/lib/api/client');

      try {
        await apiClient.get('/test');
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe(1001);
        expect((error as ApiError).message).toBe('参数错误');
      }
    });

    it('HTTP 错误应该抛出 ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/plain' }),
      });

      const { apiClient } = await import('@/lib/api/client');

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });
});
