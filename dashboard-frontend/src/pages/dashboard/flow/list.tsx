/**
 * 流控规则列表页面
 */

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/pagination';
import { useGlobalSearch } from '@/contexts/search-context';
import { useDeleteFlowRule, useFlowRules } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { FlowRule } from '@/types/rule';

/** 限流阈值类型 */
const GRADE_MAP: Record<number, string> = {
  0: '线程数',
  1: 'QPS',
};

/** 流控模式 */
const STRATEGY_MAP: Record<number, string> = {
  0: '直接',
  1: '关联',
  2: '链路',
};

/** 流控效果 */
const CONTROL_BEHAVIOR_MAP: Record<number, string> = {
  0: '快速失败',
  1: 'Warm Up',
  2: '排队等待',
};

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useFlowRules(app ?? '');
  const deleteRule = useDeleteFlowRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  // 分页和搜索（使用全局搜索）
  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource', 'limitApp'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) {
      navigate(paths.dashboard.flow.create(app));
    }
  };

  const handleEdit = (rule: FlowRule) => {
    if (app) {
      navigate(paths.dashboard.flow.edit(app, String(rule.id)));
    }
  };

  const handleDelete = async (rule: FlowRule) => {
    if (window.confirm(`确定要删除规则 "${rule.resource}" 吗？`)) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (err) {
        console.error('删除规则失败:', err);
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
        <title>流控规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">流控规则</Heading>
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
                  <Text color="fg.muted">暂无流控规则</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    点击"新增规则"添加流控规则
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
                        <Table.ColumnHeader>来源</Table.ColumnHeader>
                        <Table.ColumnHeader>阈值类型</Table.ColumnHeader>
                        <Table.ColumnHeader>阈值</Table.ColumnHeader>
                        <Table.ColumnHeader>流控模式</Table.ColumnHeader>
                        <Table.ColumnHeader>流控效果</Table.ColumnHeader>
                        <Table.ColumnHeader>集群</Table.ColumnHeader>
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
                            <Text>{rule.limitApp || 'default'}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={rule.grade === 1 ? 'blue' : 'orange'}>
                              {GRADE_MAP[rule.grade] ?? rule.grade}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{rule.count}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{STRATEGY_MAP[rule.strategy] ?? rule.strategy}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{CONTROL_BEHAVIOR_MAP[rule.controlBehavior] ?? rule.controlBehavior}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={rule.clusterMode ? 'green' : 'gray'}>
                              {rule.clusterMode ? '是' : '否'}
                            </Badge>
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
