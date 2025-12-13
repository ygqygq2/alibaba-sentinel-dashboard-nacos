/**
 * 检测当前页面是否在新标签页打开，以及获取传递的数据
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface OpenedInNewTabData {
  /** 是否在新标签页打开 */
  isOpenedInNewTab: boolean;
  /** 从 sessionStorage 获取的数据 */
  data?: Record<string, unknown>;
  /**
   * 关闭当前标签页
   * 如果不是在新标签页打开，则使用 navigate(-1) 回退
   */
  closeTab: () => void;
}

/**
 * 检测页面是否在新标签页中打开
 * 如果是，则提供关闭标签页的功能
 */
export function useOpenedInNewTab(): OpenedInNewTabData {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<Record<string, unknown> | undefined>();

  const isOpenedInNewTab = searchParams.get('opened_in_new_tab') === 'true';

  useEffect(() => {
    if (isOpenedInNewTab) {
      const dataId = searchParams.get('data_id');
      if (dataId) {
        const storedData = sessionStorage.getItem(dataId);
        if (storedData) {
          try {
            setData(JSON.parse(storedData));
            // 数据读取后立即清除，避免内存泄漏
            sessionStorage.removeItem(dataId);
          } catch (error) {
            console.error('Failed to parse sessionStorage data:', error);
          }
        }
      }
    }
  }, [isOpenedInNewTab, searchParams]);

  const closeTab = () => {
    if (isOpenedInNewTab) {
      // 如果是在新标签页打开的，则关闭当前标签页
      window.close();
    } else {
      // 否则使用浏览器后退
      window.history.back();
    }
  };

  return {
    isOpenedInNewTab,
    data,
    closeTab,
  };
}
