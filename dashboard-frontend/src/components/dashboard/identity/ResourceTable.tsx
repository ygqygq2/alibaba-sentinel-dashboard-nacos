/**
 * 资源表格组件
 */

import { Box, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import * as React from 'react';

import { Pagination } from '@/components/ui/pagination';
import { useListFilter } from '@/hooks/use-list-filter';
import type { ClusterNode } from '@/types/sentinel';

import { QuickRuleButtons } from './QuickRuleButtons';

export interface ResourceTableProps {
  /** 应用名称 */
  app: string;
  /** 资源数据 */
  data: ClusterNode[];
  /** 是否加载中 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: Error | null;
  /** 是否树状视图 */
  treeView?: boolean;
  /** 搜索关键词 */
  searchKey?: string;
}

/**
 * 资源表格
 * 展示簇点链路资源列表，支持树状和列表两种视图
 */
export function ResourceTable({
  app,
  data,
  isLoading,
  error,
  treeView = false,
  searchKey = '',
}: ResourceTableProps): React.JSX.Element {
  // 树状视图的展开/折叠状态（存储节点的 resource 名称）
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  // 根据 parentId 构建树形结构
  const treeData = React.useMemo(() => {
    if (!treeView || !data.length) return data;
    return buildTree(data);
  }, [data, treeView]);

  // 展平树形数据用于列表视图
  const flattenData = React.useMemo(() => {
    if (!treeView) {
      return flattenResources(data);
    }
    return treeData;
  }, [data, treeData, treeView]);

  // 分页（仅在列表视图时启用）
  const {
    filteredData: paginatedData,
    page,
    setPage,
    pageSize,
    total,
  } = useListFilter({
    data: !treeView ? flattenData : undefined,
    searchFields: ['resource'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  // 切换节点展开/折叠状态
  const toggleNode = (resource: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">加载失败：{error.message}</Text>
      </Box>
    );
  }

  if (!flattenData?.length) {
    return (
      <Box
        p={8}
        textAlign="center"
      >
        <Text color="fg.muted">暂无资源数据</Text>
        <Text
          color="fg.muted"
          fontSize="sm"
          mt={2}
        >
          请确保应用已接入 Sentinel 并有流量访问
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              width="40%"
              minWidth="200px"
            >
              资源名
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="8%"
              textAlign="right"
            >
              通过QPS
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="8%"
              textAlign="right"
            >
              拒绝QPS
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="8%"
              textAlign="right"
            >
              线程数
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="8%"
              textAlign="right"
            >
              平均RT
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="10%"
              textAlign="right"
            >
              分钟通过
            </Table.ColumnHeader>
            <Table.ColumnHeader
              width="10%"
              textAlign="right"
            >
              分钟拒绝
            </Table.ColumnHeader>
            <Table.ColumnHeader width="18%">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {treeView
            ? renderTreeRows(app, treeData, 0, expandedNodes, toggleNode)
            : paginatedData.map((node) => (
                <ResourceRow
                  key={node.id ?? node.resource}
                  app={app}
                  node={node}
                  depth={0}
                  hasChildren={false}
                  isExpanded={false}
                  onToggle={() => {}}
                />
              ))}
        </Table.Body>
      </Table.Root>
      {!treeView && total > pageSize && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      )}
    </>
  );
}

interface ResourceRowProps {
  app: string;
  node: ClusterNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function ResourceRow({ app, node, depth, hasChildren, isExpanded, onToggle }: ResourceRowProps): React.JSX.Element {
  return (
    <Table.Row>
      <Table.Cell>
        <Box
          pl={depth * 4}
          fontSize="sm"
          maxWidth="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          title={node.resource}
          cursor="default"
          display="flex"
          alignItems="center"
          gap={1}
        >
          {hasChildren ? (
            <Box
              as="button"
              onClick={onToggle}
              cursor="pointer"
              display="inline-flex"
              alignItems="center"
              color="gray.500"
              _hover={{ color: 'blue.500' }}
              bg="transparent"
              border="none"
              p={0}
              minW="16px"
            >
              <Text fontSize="12px">{isExpanded ? '▼' : '▶'}</Text>
            </Box>
          ) : (
            <Box minW="16px" />
          )}
          {depth > 0 && (
            <Text
              as="span"
              color="gray.400"
              mr={1}
            >
              └─
            </Text>
          )}
          <Text as="span">{node.resource}</Text>
        </Box>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text color="green.500">{node.passQps}</Text>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text color={node.blockQps > 0 ? 'red.500' : 'gray.500'}>{node.blockQps}</Text>
      </Table.Cell>
      <Table.Cell textAlign="right">{node.threadNum}</Table.Cell>
      <Table.Cell textAlign="right">{node.averageRt}ms</Table.Cell>
      <Table.Cell textAlign="right">{node.oneMinutePass}</Table.Cell>
      <Table.Cell textAlign="right">
        <Text color={node.oneMinuteBlock > 0 ? 'red.500' : 'gray.500'}>{node.oneMinuteBlock}</Text>
      </Table.Cell>
      <Table.Cell>
        <QuickRuleButtons
          app={app}
          resource={node.resource}
          size="xs"
        />
      </Table.Cell>
    </Table.Row>
  );
}

/**
 * 根据 parentId 和 id 构建树形结构
 */
function buildTree(nodes: ClusterNode[]): ClusterNode[] {
  if (!nodes || nodes.length === 0) return [];

  // 创建 id 到节点的映射
  const nodeMap = new Map<string, ClusterNode>();
  const result: ClusterNode[] = [];

  // 第一遍：创建所有节点的副本并建立映射
  nodes.forEach((node) => {
    const nodeCopy = { ...node, children: [] };
    if (node.id) {
      nodeMap.set(node.id, nodeCopy);
    }
  });

  // 第二遍：建立父子关系
  nodes.forEach((node) => {
    const currentNode = node.id ? nodeMap.get(node.id) : undefined;
    if (!currentNode) return;

    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(currentNode);
      } else {
        // 找不到父节点，作为根节点
        result.push(currentNode);
      }
    } else {
      // 没有 parentId，作为根节点
      result.push(currentNode);
    }
  });

  return result;
}

/**
 * 递归渲染树形行（支持折叠展开）
 */
function renderTreeRows(
  app: string,
  nodes: ClusterNode[],
  depth: number,
  expandedNodes: Set<string>,
  toggleNode: (resource: string) => void
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];

  for (const node of nodes) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedNodes.has(node.resource);

    rows.push(
      <ResourceRow
        key={node.id ?? node.resource}
        app={app}
        node={node}
        depth={depth}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.resource)}
      />
    );

    // 只有展开状态才渲染子节点
    if (hasChildren && isExpanded) {
      rows.push(...renderTreeRows(app, node.children!, depth + 1, expandedNodes, toggleNode));
    }
  }

  return rows;
}

/**
 * 展平树形资源数据
 */
function flattenResources(nodes: ClusterNode[]): ClusterNode[] {
  const result: ClusterNode[] = [];

  function traverse(node: ClusterNode) {
    result.push(node);
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return result;
}
