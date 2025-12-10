/**
 * 实时监控页面
 */

import {
  Badge,
  Box,
  Button,
  Card,
  Collapsible,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CHART_COLORS, ChartContainer } from '@/components/dashboard/chart-container';
import { InstanceFilter } from '@/components/dashboard/metric';
import { useGlobalSearch } from '@/contexts/search-context';
import { useMetricByViewMode } from '@/hooks/api';
import { useColorMode } from '@/hooks/use-color-mode';
import { CHART_SERIES } from '@/lib/theme/chart-colors';
import type { MetricData } from '@/types/sentinel';

const ITEMS_PER_PAGE = 2; // 每页显示2个图表

type ViewMode = 'aggregate' | 'instance';

/** 资源监控图表组件 */
interface ResourceChartProps {
  resource: string;
  data: MetricData[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

function ResourceChart({ resource, data, isExpanded = false, onToggle }: ResourceChartProps) {
  // 格式化数据用于图表
  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      passQps: d.passQps,
      blockQps: d.blockQps,
      successQps: d.successQps,
      exceptionQps: d.exceptionQps,
      rt: d.rt,
    }));
  }, [data]);

  return (
    <Card.Root>
      <Card.Header
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: 'bg.subtle' }}
        transition="background 0.2s"
        py={2.5}
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading
            size="sm"
            fontWeight="medium"
            fontFamily="mono"
            fontSize="md"
            flex="1"
            mr={2}
            title={resource}
            truncate
          >
            {resource}
          </Heading>
          <Icon
            icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            fontSize="20px"
          />
        </Flex>
      </Card.Header>
      <Collapsible.Root open={isExpanded}>
        <Collapsible.Content>
          <Card.Body
            pt={0}
            pb={3}
          >
            {/* 单列图表 */}
            <Box>
              {chartData.length > 0 ? (
                <ChartContainer
                  data={chartData}
                  height={220}
                  type="line"
                  series={[
                    {
                      dataKey: 'passQps',
                      stroke: CHART_COLORS.passQps,
                      name: '通过 QPS',
                      strokeWidth: 2,
                    },
                    {
                      dataKey: 'blockQps',
                      stroke: CHART_COLORS.blockQps,
                      name: '拒绝 QPS',
                      strokeWidth: 2,
                    },
                  ]}
                />
              ) : (
                <Box
                  height="220px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="bg.subtle"
                  borderRadius="md"
                >
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                  >
                    暂无数据
                  </Text>
                </Box>
              )}
            </Box>
          </Card.Body>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Root>
  );
}

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
      <Card.Body
        py={3}
        px={3.5}
      >
        <Flex
          alignItems="center"
          gap={2.5}
        >
          <Box
            bg={`${colorPalette}.100`}
            color={`${colorPalette}.600`}
            p={2.5}
            borderRadius="lg"
          >
            <Icon
              icon={icon}
              width={20}
              height={20}
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
              fontSize="xl"
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

/** QPS 趋势图组件 */
interface TrendChartData {
  time: string;
  passQps: number;
  blockQps: number;
  successQps: number;
  exceptionQps: number;
  rt: number;
}

function QpsTrendChart({ data }: { data: TrendChartData[] }) {
  const { resolvedColorMode } = useColorMode();
  const series = CHART_SERIES.qpsArea(resolvedColorMode);

  return (
    <Card.Root>
      <Card.Header py={2.5}>
        <Heading size="md">QPS 趋势</Heading>
      </Card.Header>
      <Card.Body
        pt={0}
        pb={3}
      >
        {data.length > 0 ? (
          <ChartContainer
            data={data}
            height={240}
            type="area"
            series={series}
          />
        ) : (
          <Box
            height="240px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="bg.subtle"
            borderRadius="md"
          >
            <Stack
              gap={2}
              textAlign="center"
            >
              <Icon
                icon="mdi:chart-line"
                fontSize="40px"
                color="fg.muted"
              />
              <Text
                color="fg.muted"
                fontSize="sm"
              >
                暂无趋势数据，请等待数据采集...
              </Text>
            </Stack>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}

/** RT 趋势图组件 */
function RtTrendChart({ data }: { data: TrendChartData[] }) {
  const { resolvedColorMode } = useColorMode();
  const series = CHART_SERIES.rtArea(resolvedColorMode);

  return (
    <Card.Root>
      <Card.Header py={2.5}>
        <Heading size="md">RT 趋势</Heading>
      </Card.Header>
      <Card.Body
        pt={0}
        pb={3}
      >
        {data.length > 0 ? (
          <ChartContainer
            data={data}
            height={240}
            type="area"
            series={series}
          />
        ) : (
          <Box
            height="240px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="bg.subtle"
            borderRadius="md"
          >
            <Stack
              gap={2}
              textAlign="center"
            >
              <Icon
                icon="mdi:timer-outline"
                fontSize="40px"
                color="fg.muted"
              />
              <Text
                color="fg.muted"
                fontSize="sm"
              >
                暂无趋势数据，请等待数据采集...
              </Text>
            </Stack>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const { searchKey } = useGlobalSearch(); // 使用全局搜索

  // 视图模式：汇总视图 vs 实例视图
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => {
    const stored = localStorage.getItem('metric-view-mode');
    return (stored as ViewMode) || 'aggregate';
  });

  // 实例视图模式下选中的实例
  const [selectedInstance, setSelectedInstance] = React.useState<string | null>(null);

  // 从 localStorage 读取自动刷新状态
  const [autoRefresh, setAutoRefresh] = React.useState(() => {
    const stored = localStorage.getItem('metric-auto-refresh');
    return stored ? JSON.parse(stored) : false;
  });

  const [expandedResources, setExpandedResources] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1); // 分页状态
  const [historyData, setHistoryData] = React.useState<
    Array<{
      time: string;
      passQps: number;
      blockQps: number;
      successQps: number;
      exceptionQps: number;
      rt: number;
    }>
  >([]);

  // 按资源分组的历史数据
  const [resourceHistory, setResourceHistory] = React.useState<Map<string, MetricData[]>>(new Map());

  const { data, isLoading, error, refetch } = useMetricByViewMode(app ?? '', viewMode, {
    instance: viewMode === 'instance' ? (selectedInstance ?? undefined) : undefined,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // 从返回数据中提取当前值和历史数据
  const metrics = data?.current || [];
  const historyFromApi = data?.history || new Map();

  // 更新资源历史数据
  React.useEffect(() => {
    if (historyFromApi.size > 0) {
      setResourceHistory(historyFromApi);
    }
  }, [historyFromApi]);

  // 更新汇总历史数据用于总览图表
  React.useEffect(() => {
    if (metrics?.length) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const totalPassQps = metrics.reduce((sum, m) => sum + m.passQps, 0);
      const totalBlockQps = metrics.reduce((sum, m) => sum + m.blockQps, 0);
      const totalSuccessQps = metrics.reduce((sum, m) => sum + m.successQps, 0);
      const totalExceptionQps = metrics.reduce((sum, m) => sum + m.exceptionQps, 0);
      const avgRt = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.rt, 0) / metrics.length : 0;

      setHistoryData((prev) => {
        const newData = [
          ...prev,
          {
            time: timeStr,
            passQps: totalPassQps,
            blockQps: totalBlockQps,
            successQps: totalSuccessQps,
            exceptionQps: totalExceptionQps,
            rt: avgRt,
          },
        ];
        // 保留最近 20 个数据点
        return newData.slice(-20);
      });
    }
  }, [metrics]);

  const handleRefresh = () => {
    refetch();
  };

  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    // 持久化到 localStorage
    localStorage.setItem('metric-auto-refresh', JSON.stringify(newValue));
  };

  const handleViewModeChange = (mode: string) => {
    const newMode = mode as ViewMode;
    setViewMode(newMode);
    localStorage.setItem('metric-view-mode', newMode);
    // 重置展开状态和分页
    setExpandedResources(new Set());
    setCurrentPage(1);
  };

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  };

  // 按资源或实例分组并过滤搜索
  const resourceGroups = React.useMemo(() => {
    if (!metrics) return [];

    if (viewMode === 'instance') {
      // 实例视图：按 instance/resource 分组
      const groups = new Map<string, MetricData[]>();
      metrics.forEach((metric) => {
        const key = `${metric.instance || 'unknown'}${metric.resource}`;
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, metric]);
      });

      let filtered = Array.from(groups.entries()).map(([key, data]) => ({
        resource: key, // 使用 instance/resource 作为显示
        data: resourceHistory.get(key) || data,
        latest: data[data.length - 1] || data[0],
      }));

      // 应用搜索过滤
      if (searchKey) {
        filtered = filtered.filter(
          (group) =>
            group.resource.toLowerCase().includes(searchKey.toLowerCase()) ||
            (group.latest?.instance?.toLowerCase().includes(searchKey.toLowerCase()) ?? false)
        );
      }

      // 按实例和资源名称排序
      filtered.sort((a, b) => a.resource.localeCompare(b.resource));

      return filtered;
    } else {
      // 汇总视图：按资源名分组
      const groups = new Map<string, MetricData[]>();
      metrics.forEach((metric) => {
        const existing = groups.get(metric.resource) || [];
        groups.set(metric.resource, [...existing, metric]);
      });

      let filtered = Array.from(groups.entries()).map(([resource, data]) => ({
        resource,
        data: resourceHistory.get(resource) || data,
        latest: data[data.length - 1] || data[0],
      }));

      // 应用搜索过滤
      if (searchKey) {
        filtered = filtered.filter((group) => group.resource.toLowerCase().includes(searchKey.toLowerCase()));
      }

      // 按资源名称排序
      filtered.sort((a, b) => a.resource.localeCompare(b.resource));

      return filtered;
    }
  }, [metrics, resourceHistory, searchKey, viewMode]);

  // 计算分页
  const totalPages = Math.ceil(resourceGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return resourceGroups.slice(startIndex, endIndex);
  }, [resourceGroups, currentPage]);

  // 过滤监控表格数据（也应用搜索）并排序
  const filteredMetrics = React.useMemo(() => {
    const result = searchKey
      ? metrics.filter((m) => m.resource.toLowerCase().includes(searchKey.toLowerCase()))
      : metrics;

    // 按资源名称排序
    return result.sort((a, b) => a.resource.localeCompare(b.resource));
  }, [metrics, searchKey]);

  // 当搜索关键词变化时，重置到第1页
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchKey]);

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
        <Stack gap={4}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex
              alignItems="center"
              gap={3}
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
              {viewMode === 'instance' && (
                <InstanceFilter
                  app={app}
                  value={selectedInstance}
                  onChange={setSelectedInstance}
                />
              )}
            </Flex>
            <Flex
              gap={2}
              alignItems="center"
            >
              {/* 视图模式切换 */}
              <Flex
                gap={1}
                borderWidth="1px"
                borderRadius="md"
                p={0.5}
              >
                <Button
                  size="sm"
                  variant={viewMode === 'aggregate' ? 'solid' : 'ghost'}
                  onClick={() => handleViewModeChange('aggregate')}
                >
                  汇总视图
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'instance' ? 'solid' : 'ghost'}
                  onClick={() => handleViewModeChange('instance')}
                >
                  实例视图
                </Button>
              </Flex>
              {autoRefresh && (
                <Badge colorPalette="green">
                  <Icon icon="mdi:sync" />
                  自动刷新中 (10s)
                </Badge>
              )}
              <Button
                variant={autoRefresh ? 'solid' : 'outline'}
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
            gap={3}
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

          {/* QPS 趋势图 */}
          <QpsTrendChart data={historyData} />

          {/* RT 趋势图 */}
          <RtTrendChart data={historyData} />

          {/* 按资源展示的详细图表 */}
          {resourceGroups.length > 0 && (
            <Card.Root>
              <Card.Header py={2.5}>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Heading size="md">资源详情</Heading>
                  {/* 分页控件 */}
                  <Flex
                    gap={2}
                    alignItems="center"
                  >
                    <Text fontSize="sm">共 {resourceGroups.length} 个资源</Text>
                    <Flex gap={1}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <Icon icon="mdi:chevron-left" />
                      </Button>
                      <Text
                        fontSize="sm"
                        px={2}
                        alignSelf="center"
                      >
                        {currentPage} / {totalPages || 1}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        <Icon icon="mdi:chevron-right" />
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Card.Header>
              <Card.Body
                pt={0}
                pb={3}
              >
                <Stack gap={2}>
                  {paginatedGroups.map((group) => (
                    <ResourceChart
                      key={group.resource}
                      resource={group.resource}
                      data={group.data}
                      isExpanded={expandedResources.has(group.resource)}
                      onToggle={() => toggleResource(group.resource)}
                    />
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>
          )}

          {/* 资源列表 */}
          <Card.Root>
            <Card.Header py={2.5}>
              <Heading size="md">资源监控</Heading>
            </Card.Header>
            <Card.Body p={0}>
              {isLoading ? (
                <Stack
                  p={4}
                  gap={2}
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
              ) : !filteredMetrics?.length ? (
                <Box
                  p={6}
                  textAlign="center"
                >
                  <Text color="fg.muted">{searchKey ? '未找到匹配的资源' : '暂无监控数据'}</Text>
                  {!searchKey && (
                    <Text
                      color="fg.muted"
                      fontSize="sm"
                      mt={2}
                    >
                      请确保应用已接入 Sentinel 并有流量访问
                    </Text>
                  )}
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
                    {filteredMetrics.map((metric: MetricData, index: number) => (
                      <Table.Row key={`${metric.resource}-${index}`}>
                        <Table.Cell>
                          <Text
                            fontWeight="medium"
                            maxW="300px"
                            fontSize="sm"
                            fontFamily="mono"
                            truncate
                            title={metric.resource}
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
