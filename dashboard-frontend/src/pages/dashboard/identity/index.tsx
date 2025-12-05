/**
 * 簇点链路页面
 * 显示应用的资源调用链路，支持快速添加规则
 */

import { Box, Button, ButtonGroup, Card, Flex, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { MachineSelector, ResourceTable } from '@/components/dashboard/identity';
import { useMachineResources } from '@/hooks/api';

type ViewMode = 'tree' | 'list';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();

  // 状态
  const [selectedMachine, setSelectedMachine] = React.useState<{
    ip: string;
    port: number;
  } | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [searchKey, setSearchKey] = React.useState('');
  const [debouncedSearchKey, setDebouncedSearchKey] = React.useState('');

  // 防抖搜索
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKey]);

  // 获取资源数据
  const {
    data: resources = [],
    isLoading,
    error,
    refetch,
  } = useMachineResources({
    ip: selectedMachine?.ip ?? '',
    port: selectedMachine?.port ?? 0,
    type: viewMode === 'tree' ? 'root' : 'cluster',
    searchKey: debouncedSearchKey || undefined,
    enabled: !!selectedMachine,
    refetchInterval: 10000, // 10秒自动刷新
  });

  const handleMachineChange = (machine: { ip: string; port: number } | null) => {
    setSelectedMachine(machine);
  };

  const handleRefresh = () => {
    refetch();
  };

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
            <ButtonGroup
              size="sm"
              variant="outline"
              attached
            >
              <Button
                colorPalette={viewMode === 'tree' ? 'blue' : 'gray'}
                variant={viewMode === 'tree' ? 'solid' : 'outline'}
                onClick={() => setViewMode('tree')}
              >
                树状视图
              </Button>
              <Button
                colorPalette={viewMode === 'list' ? 'blue' : 'gray'}
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
            </ButtonGroup>
          </Flex>

          {/* 工具栏 */}
          <Card.Root>
            <Card.Body py={3}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={3}
              >
                <HStack gap={4}>
                  <HStack gap={2}>
                    <Text
                      fontSize="sm"
                      color="fg.muted"
                      whiteSpace="nowrap"
                    >
                      机器:
                    </Text>
                    <MachineSelector
                      app={app}
                      value={selectedMachine ? `${selectedMachine.ip}:${selectedMachine.port}` : undefined}
                      onChange={handleMachineChange}
                    />
                  </HStack>
                  <HStack gap={2}>
                    <Text
                      fontSize="sm"
                      color="fg.muted"
                      whiteSpace="nowrap"
                    >
                      关键字:
                    </Text>
                    <Input
                      size="sm"
                      width="200px"
                      placeholder="搜索资源名"
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                    />
                  </HStack>
                </HStack>
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={handleRefresh}
                  disabled={!selectedMachine}
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
              {!selectedMachine ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">请先选择一台机器</Text>
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
