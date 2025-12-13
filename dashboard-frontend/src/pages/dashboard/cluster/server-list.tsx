/**
 * 全局集群管理 - Token Server 列表
 */

import { Badge, Box, Button, Card, Flex, Heading, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { useAllTokenServers } from '@/hooks/api';
import type { TokenServer } from '@/types/cluster';

export function Page(): React.JSX.Element {
  const { data: servers, isLoading, error, refetch } = useAllTokenServers();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Helmet>
        <title>Token Server 列表 | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">Token Server 列表</Heading>
            </Box>
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              <Icon icon="mdi:refresh" />
              刷新
            </Button>
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
              ) : !servers?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无 Token Server</Text>
                </Box>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>应用</Table.ColumnHeader>
                      <Table.ColumnHeader>IP</Table.ColumnHeader>
                      <Table.ColumnHeader>端口</Table.ColumnHeader>
                      <Table.ColumnHeader>Token Server 端口</Table.ColumnHeader>
                      <Table.ColumnHeader>模式</Table.ColumnHeader>
                      <Table.ColumnHeader>服务命名空间</Table.ColumnHeader>
                      <Table.ColumnHeader>客户端数量</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {servers.map((server: TokenServer) => {
                      const appName = server.state?.appName || '-';
                      const tokenServerPort = server.state?.port || '-';
                      const embedded = server.state?.embedded;
                      const namespaces = server.state?.namespaceSet?.join(', ') || '-';
                      const clientCount =
                        server.state?.connection?.reduce((sum, conn) => sum + (conn.connectedCount || 0), 0) || 0;

                      return (
                        <Table.Row key={server.id}>
                          <Table.Cell>
                            <Text fontWeight="medium">{appName}</Text>
                          </Table.Cell>
                          <Table.Cell>{server.ip}</Table.Cell>
                          <Table.Cell>{server.port}</Table.Cell>
                          <Table.Cell>{tokenServerPort}</Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={embedded ? 'blue' : 'green'}>
                              {embedded ? '嵌入模式' : '独立模式'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              maxW="200px"
                              truncate
                              title={namespaces}
                            >
                              {namespaces}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>{clientCount}</Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              )}
            </Card.Body>
          </Card.Root>
        </Stack>
      </Box>
    </>
  );
}
