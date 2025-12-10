import { useEffect, useState } from 'react';

/**
 * 防抖 Hook
 *
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * ```tsx
 * const [searchKey, setSearchKey] = useState('');
 * const debouncedSearchKey = useDebounce(searchKey, 300);
 *
 * // debouncedSearchKey 会在 searchKey 停止变化 300ms 后更新
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在 value 变化或组件卸载时清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
