/**
 * Dashboard 首页 - 应用列表
 */

import { Badge, Box, Card, Flex, Heading, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { Pagination } from '@/components/ui/pagination';
import { useGlobalSearch } from '@/contexts/search-context';
import { useApps } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';

export function Page(): React.JSX.Element {
  const navigate = useNavigate();
  const { data: apps, isLoading, error } = useApps();
  const { searchKey } = useGlobalSearch();

  // 分页和搜索
  const {
    filteredData: filteredApps,
    page,
    setPage,
    pageSize,
    total,
  } = useListFilter({
    data: apps,
    searchFields: ['app'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleAppClick = (appName: string) => {
    navigate(paths.dashboard.flow.list(appName));
  };

  return (
    <>
      <Helmet>
        <title>应用列表 | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading size="lg">应用列表</Heading>
            <Text
              color="fg.muted"
              fontSize="sm"
              whiteSpace="nowrap"
            >
              共 {filteredApps.length} / {apps?.length ?? 0} 个应用
            </Text>
          </Flex>

          <Card.Root>
            <Card.Body p={0}>
              {isLoading ? (
                <Stack
                  p={4}
                  gap={3}
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      height="40px"
                    />
                  ))}
                </Stack>
              ) : error ? (
                <Box p={4}>
                  <Text color="red.500">加载失败：{String(error)}</Text>
                </Box>
              ) : !filteredApps.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">{searchKey ? '未找到匹配的应用' : '暂无应用'}</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    {searchKey ? '请尝试其他搜索条件' : '请启动 Sentinel 客户端应用后刷新页面'}
                  </Text>
                </Box>
              ) : (
                <>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>应用名称</Table.ColumnHeader>
                        <Table.ColumnHeader>应用类型</Table.ColumnHeader>
                        <Table.ColumnHeader>健康实例数</Table.ColumnHeader>
                        <Table.ColumnHeader>不健康实例数</Table.ColumnHeader>
                        <Table.ColumnHeader>最近心跳</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredApps.map((app) => (
                        <Table.Row
                          key={app.app}
                          cursor="pointer"
                          _hover={{ bg: 'bg.subtle' }}
                          onClick={() => handleAppClick(app.app)}
                        >
                          <Table.Cell>
                            <Text fontWeight="medium">{app.app}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={app.appType === 1 ? 'purple' : 'blue'}>
                              {app.appType === 1 ? '网关' : '普通'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="green.500">{app.healthCount}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color={app.unhealthyCount > 0 ? 'red.500' : 'fg.muted'}>{app.unhealthyCount}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{app.activeCount}</Text>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                  {total > pageSize && (
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      total={total}
                      onPageChange={setPage}
                    />
                  )}
                </>
              )}
            </Card.Body>
          </Card.Root>
        </Stack>
      </Box>
    </>
  );
}
