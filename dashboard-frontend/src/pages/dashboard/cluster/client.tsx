/**
 * 集群流控 - Token Client 管理页面
 */

import { Badge, Box, Button, Card, Flex, Heading, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useTokenClients } from '@/hooks/api';
import type { TokenClient } from '@/types/cluster';

/** 集群状态映射 */
const STATE_MAP: Record<number, string> = {
  0: '离线',
  1: 'Token Client',
  2: 'Token Server',
};

/** 状态颜色映射 */
const STATE_COLOR_MAP: Record<number, string> = {
  0: 'gray',
  1: 'blue',
  2: 'green',
};

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const { data: clients, isLoading, error, refetch } = useTokenClients(app ?? '');

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
        <title>Token Client - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">集群流控 - Token Client</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                应用：{app}
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

          {/* Token Client 列表 */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Token Client 列表</Heading>
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
                    Token Client 会在应用接入集群流控后自动出现
                  </Text>
                </Box>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>地址</Table.ColumnHeader>
                      <Table.ColumnHeader>端口</Table.ColumnHeader>
                      <Table.ColumnHeader>状态</Table.ColumnHeader>
                      <Table.ColumnHeader>Token Server</Table.ColumnHeader>
                      <Table.ColumnHeader>请求超时(ms)</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {clients.map((client: TokenClient, index: number) => (
                      <Table.Row key={`${client.ip}-${client.port}-${index}`}>
                        <Table.Cell>
                          <Text fontWeight="medium">{client.ip}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{client.port}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={client.serverHost ? 'green' : 'gray'}>
                            {client.serverHost ? '已连接' : '未连接'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{client.serverHost ? `${client.serverHost}:${client.serverPort}` : '-'}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{client.requestTimeout ?? '-'}</Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Card.Body>
          </Card.Root>

          {/* 说明信息 */}
          <Card.Root>
            <Card.Body>
              <Stack gap={3}>
                <Heading size="sm">Token Client 说明</Heading>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  Token Client 是集群流控的客户端模式，负责向 Token Server 请求 token。
                </Text>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  • 每个 Token Client 会连接到配置的 Token Server
                </Text>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  • 请求超时表示 Client 等待 Server 响应的最大时间
                </Text>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                >
                  • 如果请求超时，会降级使用本地流控规则
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Box>
    </>
  );
}
