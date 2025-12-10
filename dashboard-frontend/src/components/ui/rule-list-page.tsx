/**
 * 通用规则列表页组件
 * 统一所有规则列表页的布局和行为
 */

import { Badge, Box, Button, Card, Flex, Heading, IconButton, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { Pagination } from '@/components/ui/pagination';

/** 表格列定义 */
export interface TableColumn<T> {
  /** 列标题 */
  header: string;
  /** 列宽度 */
  width?: string;
  /** 渲染单元格内容 */
  render: (item: T) => React.ReactNode;
}

/** 规则列表页属性 */
export interface RuleListPageProps<T> {
  /** 页面标题 */
  title: string;
  /** 应用名称 */
  app: string;
  /** 数据列表 */
  data: T[] | undefined;
  /** 过滤后的数据 */
  filteredData: T[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 错误信息 */
  error: unknown;
  /** 表格列定义 */
  columns: TableColumn<T>[];
  /** 获取行 key */
  getRowKey: (item: T) => string | number;
  /** 新增处理 */
  onCreate: () => void;
  /** 编辑处理 */
  onEdit: (item: T) => void;
  /** 删除处理 */
  onDelete: (item: T) => void;
  /** 删除中状态 */
  isDeleting?: boolean;
  /** 分页信息 */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  /** 空数据提示 */
  emptyText?: string;
  /** 无搜索结果提示 */
  noResultText?: string;
}

/**
 * 通用规则列表页组件
 */
export function RuleListPage<T>({
  title,
  app,
  data,
  filteredData,
  isLoading,
  error,
  columns,
  getRowKey,
  onCreate,
  onEdit,
  onDelete,
  isDeleting,
  pagination,
  emptyText,
  noResultText,
}: RuleListPageProps<T>): React.JSX.Element {
  const { page, pageSize, total, onPageChange } = pagination;

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
        <title>
          {title} - {app} | Sentinel Dashboard
        </title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          {/* 页面头部 */}
          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Heading size="lg">{title}</Heading>
              <Text
                color="fg.muted"
                fontSize="sm"
                mt={1}
              >
                应用：{app}
              </Text>
            </Box>
            <Button onClick={onCreate}>
              <Icon icon="mdi:plus" />
              新增规则
            </Button>
          </Flex>

          {/* 数据表格 */}
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
              ) : !data?.length ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">{emptyText || `暂无${title}`}</Text>
                  <Text
                    color="fg.muted"
                    fontSize="sm"
                    mt={2}
                  >
                    点击"新增规则"添加{title}
                  </Text>
                </Box>
              ) : filteredData.length === 0 ? (
                <Box
                  p={8}
                  textAlign="center"
                >
                  <Text color="fg.muted">{noResultText || '未找到匹配的规则'}</Text>
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
                        {columns.map((col, idx) => (
                          <Table.ColumnHeader
                            key={idx}
                            width={col.width}
                          >
                            {col.header}
                          </Table.ColumnHeader>
                        ))}
                        <Table.ColumnHeader width="100px">操作</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredData.map((item) => (
                        <Table.Row key={getRowKey(item)}>
                          {columns.map((col, idx) => (
                            <Table.Cell key={idx}>{col.render(item)}</Table.Cell>
                          ))}
                          <Table.Cell>
                            <Flex gap={2}>
                              <IconButton
                                aria-label="编辑"
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(item)}
                              >
                                <Icon icon="mdi:pencil" />
                              </IconButton>
                              <IconButton
                                aria-label="删除"
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => onDelete(item)}
                                loading={isDeleting}
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
                      onPageChange={onPageChange}
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

/** Badge 渲染辅助 */
export interface BadgeConfig {
  value: string | number;
  label: string;
  color?: string;
}

/** 渲染 Badge */
export function renderBadge(value: string | number, config: Record<string | number, BadgeConfig>): React.ReactNode {
  const item = config[value];
  if (!item) return <Text>{String(value)}</Text>;
  return <Badge colorPalette={item.color || 'gray'}>{item.label}</Badge>;
}

/** 渲染截断文本 */
export function renderTruncateText(text: string, maxW = '200px', fontWeight?: string): React.ReactNode {
  return (
    <Text
      fontWeight={fontWeight}
      maxW={maxW}
      truncate
    >
      {text}
    </Text>
  );
}

/** 渲染是/否 Badge */
export function renderYesNoBadge(value: boolean): React.ReactNode {
  return <Badge colorPalette={value ? 'green' : 'gray'}>{value ? '是' : '否'}</Badge>;
}
