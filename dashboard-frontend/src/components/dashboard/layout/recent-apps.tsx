'use client';

import { Box, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApps } from '@/hooks/api';
import { paths } from '@/paths';
import type { AppInfo } from '@/types/sentinel';

const RECENT_APPS_KEY = 'sentinel_recent_apps';
const RECENT_APPS_MAX = 5;

/**
 * 最近访问应用组件
 * 显示在侧边栏下方，自动记录最近访问过的应用
 */
export function RecentApps(): React.JSX.Element {
  const navigate = useNavigate();
  const { data: apps = [] } = useApps();
  const [isOpen, setIsOpen] = React.useState(false);
  const [recentAppNames, setRecentAppNames] = React.useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_APPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 获取最近访问的应用对象
  const recentApps = React.useMemo(
    () => recentAppNames.map((name) => apps.find((app) => app.app === name)).filter(Boolean) as AppInfo[],
    [recentAppNames, apps]
  );

  // 记录应用访问
  const recordAppAccess = React.useCallback((appName: string) => {
    setRecentAppNames((prev) => {
      const updated = [appName, ...prev.filter((name) => name !== appName)].slice(0, RECENT_APPS_MAX);
      try {
        localStorage.setItem(RECENT_APPS_KEY, JSON.stringify(updated));
      } catch {
        // localStorage 保存失败，忽略
      }
      return updated;
    });
  }, []);

  // 监听路由变化，记录应用访问
  React.useEffect(() => {
    const pathMatch = window.location.pathname.match(/\/dashboard\/apps\/([^/]+)/);
    if (pathMatch?.[1]) {
      recordAppAccess(pathMatch[1]);
    }
  }, [recordAppAccess]);

  const handleAppSelect = (appName: string) => {
    navigate(paths.dashboard.metric(appName));
  };

  if (recentApps.length === 0) {
    return <Box />;
  }

  return (
    <Box>
      {/* 最近访问标题 */}
      <Box
        as="button"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        px="20px"
        py="6px"
        bg="transparent"
        borderRadius="md"
        cursor="pointer"
        transition="all 0.2s"
        color="var(--NavItem-color)"
        _hover={{ bg: 'var(--NavItem-hover-background)' }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: 'none',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon
            icon="ph:star"
            style={{ fontSize: '1rem', color: 'var(--NavItem-icon-color)' }}
          />
          <Text
            fontSize="sm"
            fontWeight={600}
            color="inherit"
          >
            最近访问
          </Text>
        </Box>
        <Icon
          icon={isOpen ? 'ph:caret-up' : 'ph:caret-down'}
          style={{ fontSize: '0.875rem', color: 'var(--NavItem-expand-color)' }}
        />
      </Box>

      {/* 最近应用列表 */}
      {isOpen && (
        <Box
          mt={1}
          ml={2}
          borderLeft="1px solid"
          borderLeftColor="border.default"
          pl={2}
          display="flex"
          flexDirection="column"
          gap={0}
        >
          {recentApps.map((app) => (
            <Box
              key={app.app}
              as="button"
              display="flex"
              alignItems="center"
              gap={2}
              w="100%"
              px={2}
              py={1.5}
              textAlign="left"
              cursor="pointer"
              borderRadius="sm"
              color="var(--NavItem-color)"
              _hover={{ bg: 'var(--NavItem-hover-background)' }}
              transition="background 0.15s"
              onClick={() => handleAppSelect(app.app)}
              style={{
                border: 'none',
              }}
            >
              <Box
                w="0.875rem"
                h="0.875rem"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  icon={app.appType === 1 ? 'ph:cloud' : 'ph:cube'}
                  style={{ fontSize: '0.875rem', color: 'var(--NavItem-icon-color)' }}
                />
              </Box>
              <Text
                fontSize="sm"
                truncate
                flex={1}
                color="inherit"
              >
                {app.app}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
