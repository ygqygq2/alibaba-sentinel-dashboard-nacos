/**
 * 实例列表页面
 */

import { Badge, Box, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useInstances, useRemoveInstance } from '@/hooks/api';
import { getInstanceAddress } from '@/lib/utils/instance';
import type { InstanceInfo } from '@/types/sentinel';

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
  const { data: instances, isLoading, error } = useInstances(app ?? '');
  const removeInstance = useRemoveInstance();

  const handleRemove = async (instance: InstanceInfo) => {
    if (window.confirm(`确定要移除实例 ${instance.ip}:${instance.port} 吗？`)) {
      try {
        await removeInstance.mutateAsync({
          app: instance.app,
          ip: instance.ip,
          port: instance.port,
        });
      } catch (err) {
        console.error('移除实例失败:', err);
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
        <title>实例列表 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">实例列表</Heading>
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
              共 {instances?.length ?? 0} 台实例
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
              ) : !instances?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无实例</Text>
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
                      <Table.ColumnHeader>地址</Table.ColumnHeader>
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
                    {instances.map((instance) => {
                      const address = getInstanceAddress(instance);
                      const showAddress = address !== instance.ip; // 只在不同时显示
                      return (
                        <Table.Row key={instance.id}>
                          <Table.Cell>
                            {showAddress ? <Text fontWeight="medium">{address}</Text> : <Text color="fg.muted">-</Text>}
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight={showAddress ? 'normal' : 'medium'}>{instance.ip}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{instance.port}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              maxW="150px"
                              truncate
                            >
                              {instance.hostname || '-'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize="sm">{instance.version || '-'}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={instance.healthy ? 'green' : 'red'}>
                              {instance.healthy ? '健康' : '不健康'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              fontSize="sm"
                              color={instance.healthy ? 'fg.muted' : 'red.500'}
                              title={formatTimestamp(instance.lastHeartbeat)}
                            >
                              {formatRelativeTime(instance.lastHeartbeat)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <IconButton
                              aria-label="移除"
                              size="sm"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => handleRemove(instance)}
                              loading={removeInstance.isPending}
                            >
                              <Icon icon="mdi:delete" />
                            </IconButton>
                          </Table.Cell>
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
