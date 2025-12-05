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
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                全局 Token Server 管理
              </Text>
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
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    请先在应用中配置集群模式
                  </Text>
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
                      <Table.ColumnHeader>客户端数量</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {servers.map((server: TokenServer) => (
                      <Table.Row key={`${server.ip}:${server.port}`}>
                        <Table.Cell>
                          <Text fontWeight="medium">{server.app}</Text>
                        </Table.Cell>
                        <Table.Cell>{server.ip}</Table.Cell>
                        <Table.Cell>{server.port}</Table.Cell>
                        <Table.Cell>{server.tokenServerPort ?? '-'}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={server.embedded ? 'blue' : 'green'}>
                            {server.embedded ? '嵌入模式' : '独立模式'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{server.currentClientCount ?? '-'}</Table.Cell>
                      </Table.Row>
                    ))}
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
