/**
 * 资源表格组件
 */

import { Box, Skeleton, Stack, Table, Text } from '@chakra-ui/react';
import * as React from 'react';

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
}: ResourceTableProps): React.JSX.Element {
  // 展平树形数据用于列表视图
  const flattenData = React.useMemo(() => {
    if (!treeView) {
      return flattenResources(data);
    }
    return data;
  }, [data, treeView]);

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
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader width="30%">资源名</Table.ColumnHeader>
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
          ? renderTreeRows(app, data, 0)
          : flattenData.map((node) => (
              <ResourceRow
                key={node.id ?? node.resource}
                app={app}
                node={node}
                depth={0}
              />
            ))}
      </Table.Body>
    </Table.Root>
  );
}

interface ResourceRowProps {
  app: string;
  node: ClusterNode;
  depth: number;
}

function ResourceRow({ app, node, depth }: ResourceRowProps): React.JSX.Element {
  return (
    <Table.Row>
      <Table.Cell>
        <Text
          pl={depth * 4}
          fontSize="sm"
          wordBreak="break-all"
          title={node.resource}
        >
          {depth > 0 && (
            <Text
              as="span"
              color="gray.400"
              mr={1}
            >
              └─
            </Text>
          )}
          {node.resource}
        </Text>
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
 * 递归渲染树形行
 */
function renderTreeRows(app: string, nodes: ClusterNode[], depth: number): React.ReactNode[] {
  const rows: React.ReactNode[] = [];

  for (const node of nodes) {
    rows.push(
      <ResourceRow
        key={node.id ?? node.resource}
        app={app}
        node={node}
        depth={depth}
      />
    );

    if (node.children?.length) {
      rows.push(...renderTreeRows(app, node.children, depth + 1));
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
