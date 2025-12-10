/**
 * 全局搜索上下文
 * 用于导航栏搜索框和各页面的搜索功能联动
 */

import * as React from 'react';
import { useLocation } from 'react-router-dom';

export interface SearchContextValue {
  /** 搜索关键词 */
  searchKey: string;
  /** 设置搜索关键词 */
  setSearchKey: (key: string) => void;
  /** 搜索占位符文本 */
  placeholder: string;
}

const SearchContext = React.createContext<SearchContextValue | null>(null);

export interface SearchProviderProps {
  children: React.ReactNode;
}

/**
 * 根据路由返回搜索占位符
 */
function getPlaceholderByPath(pathname: string): string {
  // 首页 - 搜索应用
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return '搜索应用名称...';
  }
  // 规则页面 - 搜索资源名
  if (pathname.includes('/flow')) {
    return '搜索资源名/来源...';
  }
  if (pathname.includes('/degrade')) {
    return '搜索资源名...';
  }
  if (pathname.includes('/param-flow')) {
    return '搜索资源名...';
  }
  if (pathname.includes('/authority')) {
    return '搜索资源名/来源应用...';
  }
  if (pathname.includes('/system')) {
    return '搜索...';
  }
  if (pathname.includes('/identity')) {
    return '搜索资源名...';
  }
  if (pathname.includes('/instances')) {
    return '搜索 IP/主机名...';
  }
  if (pathname.includes('/metric')) {
    return '搜索资源名...';
  }
  if (pathname.includes('/cluster')) {
    return '搜索...';
  }
  return '搜索...';
}

export function SearchProvider({ children }: SearchProviderProps): React.JSX.Element {
  const [searchKey, setSearchKey] = React.useState('');
  const location = useLocation();

  // 路由变化时清空搜索
  React.useEffect(() => {
    setSearchKey('');
  }, [location.pathname]);

  const placeholder = React.useMemo(() => {
    return getPlaceholderByPath(location.pathname);
  }, [location.pathname]);

  const value = React.useMemo(
    () => ({
      searchKey,
      setSearchKey,
      placeholder,
    }),
    [searchKey, placeholder]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useGlobalSearch(): SearchContextValue {
  const context = React.useContext(SearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within a SearchProvider');
  }
  return context;
}
