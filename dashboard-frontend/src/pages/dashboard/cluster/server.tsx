/**
 * 集群流控 - Token Server 管理页面
 */

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useTokenServers } from '@/hooks/api';
import type { TokenServer } from '@/types/cluster';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const { data: servers, isLoading, error, refetch } = useTokenServers(app ?? '');

  const handleRefresh = () => {
    refetch();
  };

  const handleAssign = () => {
    // TODO: 打开分配 Token Server 对话框
    console.log('Assign Token Server');
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
        <title>集群流控 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">集群流控 - Token Server</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                应用：{app}
              </Text>
            </Box>
            <Flex gap={2}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <Icon icon="mdi:refresh" />
                刷新
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleAssign}
              >
                <Icon icon="mdi:server-plus" />
                分配 Token Server
              </Button>
            </Flex>
          </Flex>

          {/* Token Server 列表 */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Token Server 列表</Heading>
            </Card.Header>
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
              ) : !servers?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无 Token Server</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    点击"分配 Token Server"来配置集群流控
                  </Text>
                </Box>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>地址</Table.ColumnHeader>
                      <Table.ColumnHeader>端口</Table.ColumnHeader>
                      <Table.ColumnHeader>状态</Table.ColumnHeader>
                      <Table.ColumnHeader>客户端数</Table.ColumnHeader>
                      <Table.ColumnHeader>命名空间</Table.ColumnHeader>
                      <Table.ColumnHeader>操作</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {servers.map((server: TokenServer, index: number) => {
                      const embedded = server.state?.embedded;
                      const namespaces = server.state?.namespaceSet?.join(', ') || '-';
                      const clientCount =
                        server.state?.connection?.reduce((sum, conn) => sum + (conn.connectedCount || 0), 0) || 0;

                      return (
                        <Table.Row key={`${server.ip}-${server.port}-${index}`}>
                          <Table.Cell>
                            <Text fontWeight="medium">{server.ip}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{server.port}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={embedded ? 'blue' : 'green'}>
                              {embedded ? '嵌入模式' : '独立模式'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{clientCount}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              color="fg.muted"
                              maxW="200px"
                              truncate
                            >
                              {namespaces}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap={2}>
                              <IconButton
                                aria-label="详情"
                                size="sm"
                                variant="ghost"
                              >
                                <Icon icon="mdi:information-outline" />
                              </IconButton>
                              <IconButton
                                aria-label="配置"
                                size="sm"
                                variant="ghost"
                                colorPalette="blue"
                              >
                                <Icon icon="mdi:cog" />
                              </IconButton>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              )}
            </Card.Body>
          </Card.Root>

          {/* 说明信息 */}
          <Card.Root>
            <Card.Body>
              <Stack gap={3}>
                <Heading size="sm">关于集群流控</Heading>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  集群流控可以精确控制整个集群的调用总量，配合单机限流兜底，可以更好地发挥流量控制的效果。
                </Text>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  • Token Server：负责集群 token 的计算和分发
                </Text>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  • Token Client：向 Token Server 请求 token，根据返回结果进行限流
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Box>
    </>
  );
}
