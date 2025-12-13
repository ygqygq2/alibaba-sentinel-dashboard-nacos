/**
 * 簇点链路页面
 * 显示应用的资源调用链路，支持快速添加规则
 */

import { Box, Button, Card, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { InstanceSelector, ResourceTable } from '@/components/dashboard/identity';
import { ViewSwitcher } from '@/components/ui/view-switcher';
import { useInstanceResources } from '@/hooks/api';
import { useDebounce } from '@/hooks/use-debounce';

type ViewMode = 'tree' | 'list';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();

  // 状态
  const [selectedInstance, setSelectedInstance] = React.useState<{
    ip: string;
    port: number;
  } | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [searchKey, _setSearchKey] = React.useState('');
  const [autoSelectedRef] = React.useState({ hasAutoSelected: false });
  const debouncedSearchKey = useDebounce(searchKey, 300);

  // 获取资源数据
  const {
    data: resources = [],
    isLoading,
    error,
    refetch,
  } = useInstanceResources({
    ip: selectedInstance?.ip ?? '',
    port: selectedInstance?.port ?? 0,
    type: viewMode === 'tree' ? 'root' : 'cluster',
    searchKey: debouncedSearchKey || undefined,
    enabled: !!selectedInstance,
    refetchInterval: 10000, // 10秒自动刷新
  });

  const handleInstanceChange = (instance: { ip: string; port: number } | null) => {
    setSelectedInstance(instance);
    autoSelectedRef.hasAutoSelected = false; // 重置自动选择标记
  };

  const handleRefresh = () => {
    refetch();
  };

  // 如果没有手动选择实例，则自动选择第一个实例（仅首次加载时）
  const handleAutoSelectInstance = React.useCallback(
    (instance: { ip: string; port: number } | null) => {
      if (instance && !selectedInstance && !autoSelectedRef.hasAutoSelected) {
        setSelectedInstance(instance);
        autoSelectedRef.hasAutoSelected = true;
      }
    },
    [selectedInstance, autoSelectedRef]
  );

  if (!app) {
    return (
      <Box p={6}>
        <Text color="red.500">应用名称不能为空</Text>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>簇点链路 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          {/* 页面标题 */}
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">{app}</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                簇点链路
              </Text>
            </Box>
            {/* 视图切换 */}
            <ViewSwitcher
              value={viewMode}
              options={[
                { value: 'tree', label: '树状视图' },
                { value: 'list', label: '列表视图' },
              ]}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
          </Flex>

          {/* 工具栏 */}
          <Card.Root>
            <Card.Body py={3}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap={3}
              >
                <HStack gap={2}>
                  <Text
                    fontSize="sm"
                    color="fg.muted"
                    whiteSpace="nowrap"
                  >
                    实例:
                  </Text>
                  <InstanceSelector
                    app={app}
                    value={selectedInstance ? `${selectedInstance.ip}:${selectedInstance.port}` : undefined}
                    onChange={handleInstanceChange}
                    onAutoSelect={handleAutoSelectInstance}
                  />
                </HStack>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={!selectedInstance}
                >
                  <Icon icon="mdi:refresh" />
                  刷新
                </Button>
              </Flex>
            </Card.Body>
          </Card.Root>

          {/* 资源表格 */}
          <Card.Root>
            <Card.Body p={0}>
              {!selectedInstance ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">请先选择一台实例</Text>
                </Box>
              ) : (
                <ResourceTable
                  app={app}
                  data={resources}
                  isLoading={isLoading}
                  error={error as Error | null}
                  treeView={viewMode === 'tree'}
                />
              )}
            </Card.Body>
            {/* 分页信息 */}
            {resources.length > 0 && (
              <Card.Footer py={3}>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  共 {countResources(resources)} 条记录
                </Text>
              </Card.Footer>
            )}
          </Card.Root>
        </Stack>
      </Box>
    </>
  );
}

/**
 * 递归统计资源数量
 */
function countResources(nodes: { children?: unknown[] }[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    if (node.children) {
      count += countResources(node.children as { children?: unknown[] }[]);
    }
  }
  return count;
}
