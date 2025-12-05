/**
 * 实时监控页面
 */

import { Badge, Box, Button, Card, Flex, Grid, Heading, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useTopResourceMetric } from '@/hooks/api';
import type { MetricData } from '@/types/sentinel';

/** 统计卡片组件 */
interface StatCardProps {
  label: string;
  value: string | number;
  colorPalette?: string;
  icon: string;
}

function StatCard({ label, value, colorPalette = 'blue', icon }: StatCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Flex
          alignItems="center"
          gap={4}
        >
          <Box
            bg={`${colorPalette}.100`}
            color={`${colorPalette}.600`}
            p={3}
            borderRadius="lg"
          >
            <Icon
              icon={icon}
              width={24}
              height={24}
            />
          </Box>
          <Box>
            <Text
              fontSize="sm"
              color="fg.muted"
            >
              {label}
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
            >
              {value}
            </Text>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const { data: metrics, isLoading, error, refetch } = useTopResourceMetric(app ?? '');
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  // 自动刷新
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // 计算汇总数据
  const summary = React.useMemo(() => {
    if (!metrics?.length) {
      return { totalQps: 0, totalSuccess: 0, totalBlock: 0, avgRt: 0 };
    }
    const totalQps = metrics.reduce((sum: number, m: MetricData) => sum + m.passQps, 0);
    const totalSuccess = metrics.reduce((sum: number, m: MetricData) => sum + m.successQps, 0);
    const totalBlock = metrics.reduce((sum: number, m: MetricData) => sum + m.blockQps, 0);
    const avgRt =
      metrics.length > 0 ? metrics.reduce((sum: number, m: MetricData) => sum + m.rt, 0) / metrics.length : 0;
    return { totalQps, totalSuccess, totalBlock, avgRt };
  }, [metrics]);

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
        <title>实时监控 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">实时监控</Heading>
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
                variant={autoRefresh ? 'solid' : 'outline'}
                colorPalette={autoRefresh ? 'green' : 'gray'}
                onClick={toggleAutoRefresh}
              >
                <Icon icon={autoRefresh ? 'mdi:pause' : 'mdi:play'} />
                {autoRefresh ? '停止刷新' : '自动刷新'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
              >
                <Icon icon="mdi:refresh" />
                刷新
              </Button>
            </Flex>
          </Flex>

          {/* 汇总统计 */}
          <Grid
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            <StatCard
              label="通过 QPS"
              value={summary.totalQps.toFixed(0)}
              colorPalette="green"
              icon="mdi:check-circle"
            />
            <StatCard
              label="成功 QPS"
              value={summary.totalSuccess.toFixed(0)}
              colorPalette="blue"
              icon="mdi:thumb-up"
            />
            <StatCard
              label="拒绝 QPS"
              value={summary.totalBlock.toFixed(0)}
              colorPalette="red"
              icon="mdi:block-helper"
            />
            <StatCard
              label="平均 RT"
              value={`${summary.avgRt.toFixed(2)}ms`}
              colorPalette="orange"
              icon="mdi:timer"
            />
          </Grid>

          {/* 资源列表 */}
          <Card.Root>
            <Card.Header>
              <Flex
                justifyContent="space-between"
                alignItems="center"
              >
                <Heading size="md">资源监控</Heading>
                {autoRefresh && (
                  <Badge colorPalette="green">
                    <Icon icon="mdi:sync" />
                    自动刷新中 (5s)
                  </Badge>
                )}
              </Flex>
            </Card.Header>
            <Card.Body p={0}>
              {isLoading ? (
                <Stack
                  p={4}
                  gap={3}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
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
              ) : !metrics?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无监控数据</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    请确保应用已接入 Sentinel 并有流量访问
                  </Text>
                </Box>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>资源名</Table.ColumnHeader>
                      <Table.ColumnHeader>通过 QPS</Table.ColumnHeader>
                      <Table.ColumnHeader>拒绝 QPS</Table.ColumnHeader>
                      <Table.ColumnHeader>成功 QPS</Table.ColumnHeader>
                      <Table.ColumnHeader>异常 QPS</Table.ColumnHeader>
                      <Table.ColumnHeader>平均 RT(ms)</Table.ColumnHeader>
                      <Table.ColumnHeader>线程数</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {metrics.map((metric: MetricData, index: number) => (
                      <Table.Row key={`${metric.resource}-${index}`}>
                        <Table.Cell>
                          <Text
                            fontWeight="medium"
                            maxW="200px"
                            truncate
                          >
                            {metric.resource}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            color="green.600"
                            fontWeight="medium"
                          >
                            {metric.passQps.toFixed(0)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color={metric.blockQps > 0 ? 'red.600' : 'inherit'}>{metric.blockQps.toFixed(0)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{metric.successQps.toFixed(0)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color={metric.exceptionQps > 0 ? 'orange.600' : 'inherit'}>
                            {metric.exceptionQps.toFixed(0)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{metric.rt.toFixed(2)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{metric.count}</Text>
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
