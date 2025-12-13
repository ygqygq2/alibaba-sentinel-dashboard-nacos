/**
 * 全局集群管理 - Token Client 列表
 */

import { Badge, Box, Button, Card, Flex, Heading, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { useAllTokenClients } from '@/hooks/api';
import type { TokenClient } from '@/types/cluster';

export function Page(): React.JSX.Element {
  const { data: clients, isLoading, error, refetch } = useAllTokenClients();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Helmet>
        <title>Token Client 列表 | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">Token Client 列表</Heading>
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
              ) : !clients?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无 Token Client</Text>
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
                      <Table.ColumnHeader>Token Server</Table.ColumnHeader>
                      <Table.ColumnHeader>请求超时</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {clients.map((client: TokenClient) => (
                      <Table.Row key={`${client.ip}:${client.port}`}>
                        <Table.Cell>
                          <Text fontWeight="medium">{client.app}</Text>
                        </Table.Cell>
                        <Table.Cell>{client.ip}</Table.Cell>
                        <Table.Cell>{client.port}</Table.Cell>
                        <Table.Cell>
                          {client.serverHost ? (
                            <Badge colorPalette="green">
                              {client.serverHost}:{client.serverPort}
                            </Badge>
                          ) : (
                            <Text color="fg.muted">未分配</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>{client.requestTimeout ?? '-'} ms</Table.Cell>
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
