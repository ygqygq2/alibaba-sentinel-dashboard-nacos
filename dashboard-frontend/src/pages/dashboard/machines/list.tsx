/**
 * 机器列表页面
 */

import { Badge, Box, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useMachines, useRemoveMachine } from '@/hooks/api';
import type { MachineInfo } from '@/types/sentinel';

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('zh-CN');
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return '-';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const { data: machines, isLoading, error } = useMachines(app ?? '');
  const removeMachine = useRemoveMachine();

  const handleRemove = async (machine: MachineInfo) => {
    if (window.confirm(`确定要移除机器 ${machine.ip}:${machine.port} 吗？`)) {
      try {
        await removeMachine.mutateAsync({
          app: machine.app,
          ip: machine.ip,
          port: machine.port,
        });
      } catch (err) {
        console.error('移除机器失败:', err);
      }
    }
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
        <title>机器列表 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">机器列表</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                应用：{app}
              </Text>
            </Box>
            <Text
              color="fg.muted"
              fontSize="sm"
            >
              共 {machines?.length ?? 0} 台机器
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
              ) : !machines?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无机器</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    请确保 Sentinel 客户端已正确配置并启动
                  </Text>
                </Box>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>IP</Table.ColumnHeader>
                      <Table.ColumnHeader>端口</Table.ColumnHeader>
                      <Table.ColumnHeader>主机名</Table.ColumnHeader>
                      <Table.ColumnHeader>版本</Table.ColumnHeader>
                      <Table.ColumnHeader>健康状态</Table.ColumnHeader>
                      <Table.ColumnHeader>最后心跳</Table.ColumnHeader>
                      <Table.ColumnHeader>操作</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {machines.map((machine) => (
                      <Table.Row key={machine.id}>
                        <Table.Cell>
                          <Text fontWeight="medium">{machine.ip}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{machine.port}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            maxW="150px"
                            truncate
                          >
                            {machine.hostname || '-'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm">{machine.version || '-'}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={machine.healthy ? 'green' : 'red'}>
                            {machine.healthy ? '健康' : '不健康'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            fontSize="sm"
                            color={machine.healthy ? 'fg.muted' : 'red.500'}
                            title={formatTimestamp(machine.lastHeartbeat)}
                          >
                            {formatRelativeTime(machine.lastHeartbeat)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <IconButton
                            aria-label="移除"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemove(machine)}
                            loading={removeMachine.isPending}
                          >
                            <Icon icon="mdi:delete" />
                          </IconButton>
                        </Table.Cell>
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
