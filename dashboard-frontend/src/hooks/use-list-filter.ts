/**
 * 通用列表分页和搜索 Hook
 */

import * as React from 'react';

export interface UseListFilterOptions<T> {
  /** 原始数据 */
  data: T[] | undefined;
  /** 搜索字段（支持嵌套路径如 'a.b'） */
  searchFields?: (keyof T | string)[];
  /** 默认每页数量 */
  defaultPageSize?: number;
  /** 外部搜索关键字（用于全局搜索） */
  externalSearchKey?: string;
}

export interface UseListFilterResult<T> {
  /** 过滤后的数据（当前页） */
  filteredData: T[];
  /** 全部过滤后的数据 */
  allFilteredData: T[];
  /** 搜索关键字 */
  searchKey: string;
  /** 设置搜索关键字 */
  setSearchKey: (key: string) => void;
  /** 当前页（从 1 开始） */
  page: number;
  /** 设置页码 */
  setPage: (page: number) => void;
  /** 每页数量 */
  pageSize: number;
  /** 设置每页数量 */
  setPageSize: (size: number) => void;
  /** 总条数（过滤后） */
  total: number;
}

/**
 * 获取对象的嵌套属性值
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * 通用列表分页和搜索 Hook
 */
export function useListFilter<T>(options: UseListFilterOptions<T>): UseListFilterResult<T> {
  const { data = [], searchFields = [], defaultPageSize = 10, externalSearchKey } = options;

  const [internalSearchKey, setInternalSearchKey] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  // 使用外部或内部搜索关键字
  const searchKey = externalSearchKey ?? internalSearchKey;
  const setSearchKey = setInternalSearchKey;

  // 搜索过滤
  const allFilteredData = React.useMemo(() => {
    if (!searchKey.trim()) {
      return data;
    }

    const keyword = searchKey.toLowerCase().trim();

    return data.filter((item) => {
      if (searchFields.length === 0) {
        // 没有指定搜索字段，搜索所有字符串字段
        return Object.values(item as object).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(keyword);
          }
          if (typeof value === 'number') {
            return String(value).includes(keyword);
          }
          return false;
        });
      }

      // 搜索指定字段
      return searchFields.some((field) => {
        const value = getNestedValue(item, String(field));
        if (typeof value === 'string') {
          return value.toLowerCase().includes(keyword);
        }
        if (typeof value === 'number') {
          return String(value).includes(keyword);
        }
        return false;
      });
    });
  }, [data, searchKey, searchFields]);

  // 总条数
  const total = allFilteredData.length;

  // 搜索或数据变化时重置页码
  React.useEffect(() => {
    setPage(1);
  }, [searchKey, data]);

  // 分页
  const filteredData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return allFilteredData.slice(start, start + pageSize);
  }, [allFilteredData, page, pageSize]);

  return {
    filteredData,
    allFilteredData,
    searchKey,
    setSearchKey,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  };
}
