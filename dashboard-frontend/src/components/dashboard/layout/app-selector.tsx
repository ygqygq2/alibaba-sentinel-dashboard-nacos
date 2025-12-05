'use client';

import { Box, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApps } from '@/hooks/api';
import { useCurrentApp } from '@/hooks/use-current-app';
import { paths } from '@/paths';
import type { AppInfo } from '@/types/sentinel';

// 固定显示的应用数量
const VISIBLE_APP_COUNT = 6;

interface AppListItemProps {
  app: AppInfo;
  isSelected: boolean;
  onSelect: () => void;
}

function AppListItem({ app, isSelected, onSelect }: AppListItemProps): React.JSX.Element {
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      gap={2}
      w="100%"
      px={2}
      py={2}
      textAlign="left"
      cursor="pointer"
      bg={isSelected ? 'bg.muted' : 'transparent'}
      borderRadius="sm"
      _hover={{ bg: 'bg.muted' }}
      transition="background 0.15s"
      onClick={onSelect}
    >
      <Box
        flex={1}
        overflow="hidden"
        minW={0}
      >
        <Text
          fontSize="sm"
          fontWeight={isSelected ? 600 : 500}
          truncate
        >
          {app.app}
        </Text>
        <Text
          fontSize="xs"
          color="fg.muted"
        >
          {app.healthCount}/{app.healthCount + app.unhealthyCount} 机器
        </Text>
      </Box>
      {isSelected && (
        <Icon
          icon="ph:check"
          style={{ fontSize: '0.875rem', color: 'var(--chakra-colors-green-500)', flexShrink: 0 }}
        />
      )}
    </Box>
  );
}

/**
 * 服务列表选择器组件
 * 显示在侧边栏，可折叠展开，固定高度显示 6 个应用
 */
export function AppSelector(): React.JSX.Element {
  const navigate = useNavigate();
  const currentApp = useCurrentApp();
  const { data: apps = [], isLoading } = useApps();
  const [isOpen, setIsOpen] = React.useState(true); // 默认展开

  const handleAppSelect = (appName: string) => {
    // 导航到该应用的实时监控页面
    navigate(paths.dashboard.metric(appName));
  };

  // 计算每个应用项的高度（约 44px），固定显示 6 个
  const listHeight = VISIBLE_APP_COUNT * 44;

  return (
    <Box>
      {/* 折叠标题 */}
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
        _hover={{ bg: 'bg.muted' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon
            icon="ph:cube"
            style={{ fontSize: '1rem' }}
          />
          <Text
            fontSize="sm"
            fontWeight={600}
          >
            选择服务
          </Text>
        </Box>
        <Icon
          icon={isOpen ? 'ph:caret-up' : 'ph:caret-down'}
          style={{ fontSize: '0.875rem' }}
        />
      </Box>

      {/* 服务列表 - 固定高度，内部滚动 */}
      {isOpen && (
        <Box
          mt={1}
          ml={2}
          maxH={`${listHeight}px`}
          overflowY="auto"
          borderLeft="1px solid"
          borderLeftColor="border.default"
          pl={2}
          css={{
            scrollbarWidth: 'thin',
          }}
        >
          {isLoading ? (
            <Box
              px={2}
              py={2}
            >
              <Text
                fontSize="sm"
                color="fg.muted"
              >
                加载中...
              </Text>
            </Box>
          ) : apps.length === 0 ? (
            <Box
              px={2}
              py={2}
            >
              <Text
                fontSize="sm"
                color="fg.muted"
              >
                暂无应用
              </Text>
            </Box>
          ) : (
            apps.map((app) => (
              <AppListItem
                key={app.app}
                app={app}
                isSelected={app.app === currentApp}
                onSelect={() => handleAppSelect(app.app)}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
