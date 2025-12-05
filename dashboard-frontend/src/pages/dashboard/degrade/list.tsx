/**
 * 降级规则列表页面
 */

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/pagination';
import { useGlobalSearch } from '@/contexts/search-context';
import { useDegradeRules, useDeleteDegradeRule } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { DegradeRule } from '@/types/rule';

/** 降级策略 */
const GRADE_MAP: Record<number, string> = {
  0: '慢调用比例',
  1: '异常比例',
  2: '异常数',
};

/** 降级策略颜色 */
const GRADE_COLOR_MAP: Record<number, string> = {
  0: 'orange',
  1: 'red',
  2: 'purple',
};

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useDegradeRules(app ?? '');
  const deleteRule = useDeleteDegradeRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  // 分页和搜索（使用全局搜索）
  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) {
      navigate(paths.dashboard.degrade.create(app));
    }
  };

  const handleEdit = (rule: DegradeRule) => {
    if (app && rule.id) {
      navigate(paths.dashboard.degrade.edit(app, String(rule.id)));
    }
  };

  const handleDelete = async (rule: DegradeRule) => {
    if (!rule.id) return;
    if (window.confirm(`确定要删除规则 "${rule.resource}" 吗？`)) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (err) {
        console.error('删除规则失败:', err);
      }
    }
  };

  /**
   * 格式化阈值显示
   */
  const formatThreshold = (rule: DegradeRule): string => {
    switch (rule.grade) {
      case 0: // 慢调用比例
        return `RT>${rule.statIntervalMs ?? 0}ms, 比例>${rule.count}`;
      case 1: // 异常比例
        return `${(rule.count * 100).toFixed(0)}%`;
      case 2: // 异常数
        return `${rule.count}`;
      default:
        return String(rule.count);
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
        <title>降级规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">降级规则</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                应用：{app}
              </Text>
            </Box>
            <Button
              colorPalette="blue"
              onClick={handleCreate}
            >
              <Icon icon="mdi:plus" />
              新增规则
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
              ) : !rules?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">暂无降级规则</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    点击"新增规则"添加降级规则
                  </Text>
                </Box>
              ) : filteredData.length === 0 ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">未找到匹配的规则</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    请尝试其他搜索条件
                  </Text>
                </Box>
              ) : (
                <>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>资源名</Table.ColumnHeader>
                        <Table.ColumnHeader>降级策略</Table.ColumnHeader>
                        <Table.ColumnHeader>阈值</Table.ColumnHeader>
                        <Table.ColumnHeader>熔断时长(s)</Table.ColumnHeader>
                        <Table.ColumnHeader>最小请求数</Table.ColumnHeader>
                        <Table.ColumnHeader>操作</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredData.map((rule) => (
                        <Table.Row key={rule.id}>
                          <Table.Cell>
                            <Text
                              fontWeight="medium"
                              maxW="200px"
                              truncate
                            >
                              {rule.resource}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={GRADE_COLOR_MAP[rule.grade] ?? 'gray'}>
                              {GRADE_MAP[rule.grade] ?? rule.grade}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{formatThreshold(rule)}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{rule.timeWindow}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{rule.minRequestAmount}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap={2}>
                              <IconButton
                                aria-label="编辑"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(rule)}
                              >
                                <Icon icon="mdi:pencil" />
                              </IconButton>
                              <IconButton
                                aria-label="删除"
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDelete(rule)}
                                loading={deleteRule.isPending}
                              >
                                <Icon icon="mdi:delete" />
                              </IconButton>
                            </Flex>
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
