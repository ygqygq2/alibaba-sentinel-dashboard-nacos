/**
 * 从 URL 中提取当前应用名称的 Hook
 */

import { useParams } from 'react-router-dom';

/**
 * 获取当前选中的应用名称
 * 从 URL 参数中提取 app 参数
 */
export function useCurrentApp(): string | undefined {
  const { app } = useParams<{ app: string }>();
  return app;
}
