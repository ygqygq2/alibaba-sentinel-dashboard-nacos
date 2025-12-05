/**
 * 系统规则列表页面
 */

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/pagination';
import { useDeleteSystemRule, useSystemRules } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { SystemRule } from '@/types/rule';

/** 系统规则类型名称映射 */
const getSystemRuleType = (rule: SystemRule): string => {
  if (rule.highestSystemLoad !== undefined && rule.highestSystemLoad >= 0) {
    return 'LOAD';
  }
  if (rule.avgRt !== undefined && rule.avgRt >= 0) {
    return 'RT';
  }
  if (rule.maxThread !== undefined && rule.maxThread >= 0) {
    return '线程数';
  }
  if (rule.qps !== undefined && rule.qps >= 0) {
    return '入口 QPS';
  }
  if (rule.highestCpuUsage !== undefined && rule.highestCpuUsage >= 0) {
    return 'CPU 使用率';
  }
  return '未知';
};

/** 获取系统规则阈值 */
const getSystemRuleThreshold = (rule: SystemRule): string => {
  if (rule.highestSystemLoad !== undefined && rule.highestSystemLoad >= 0) {
    return String(rule.highestSystemLoad);
  }
  if (rule.avgRt !== undefined && rule.avgRt >= 0) {
    return `${rule.avgRt}ms`;
  }
  if (rule.maxThread !== undefined && rule.maxThread >= 0) {
    return String(rule.maxThread);
  }
  if (rule.qps !== undefined && rule.qps >= 0) {
    return String(rule.qps);
  }
  if (rule.highestCpuUsage !== undefined && rule.highestCpuUsage >= 0) {
    return `${(rule.highestCpuUsage * 100).toFixed(0)}%`;
  }
  return '-';
};

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useSystemRules(app ?? '');
  const deleteRule = useDeleteSystemRule(app ?? '');

  // 分页
  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    defaultPageSize: 10,
  });

  const handleCreate = () => {
    if (app) {
      navigate(paths.dashboard.system.create(app));
    }
  };

  const handleEdit = (rule: SystemRule) => {
    if (app && rule.id) {
      navigate(paths.dashboard.system.edit(app, String(rule.id)));
    }
  };

  const handleDelete = async (rule: SystemRule) => {
    if (!rule.id) return;
    if (window.confirm('确定要删除此系统规则吗？')) {
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
        <title>系统规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">系统规则</Heading>
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
                  <Text color="fg.muted">暂无系统规则</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    系统规则用于保护整个应用的入口流量
                  </Text>
                </Box>
              ) : (
                <>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>规则类型</Table.ColumnHeader>
                        <Table.ColumnHeader>阈值</Table.ColumnHeader>
                        <Table.ColumnHeader>操作</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredData.map((rule) => (
                        <Table.Row key={rule.id}>
                          <Table.Cell>
                            <Badge colorPalette="cyan">{getSystemRuleType(rule)}</Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight="medium">{getSystemRuleThreshold(rule)}</Text>
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
