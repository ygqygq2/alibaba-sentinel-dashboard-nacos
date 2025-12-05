/**
 * 流控规则列表页面
 * 使用通用列表组件构建
 */

import { Badge, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RuleListPage, type TableColumn } from '@/components/ui/rule-list-page';
import { useGlobalSearch } from '@/contexts/search-context';
import { useDeleteFlowRule, useFlowRules } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { FlowRule } from '@/types/rule';

/** 限流阈值类型 */
const GRADE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '线程数', color: 'orange' },
  1: { label: 'QPS', color: 'blue' },
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

/** 表格列配置 */
const columns: TableColumn<FlowRule>[] = [
  {
    header: '资源名',
    render: (rule) => (
      <Text
        fontWeight="medium"
        maxW="200px"
        truncate
      >
        {rule.resource}
      </Text>
    ),
  },
  {
    header: '来源',
    render: (rule) => <Text>{rule.limitApp || 'default'}</Text>,
  },
  {
    header: '阈值类型',
    render: (rule) => {
      const config = GRADE_MAP[rule.grade];
      return <Badge colorPalette={config?.color || 'gray'}>{config?.label || rule.grade}</Badge>;
    },
  },
  {
    header: '阈值',
    render: (rule) => <Text>{rule.count}</Text>,
  },
  {
    header: '流控模式',
    render: (rule) => <Text>{STRATEGY_MAP[rule.strategy] ?? rule.strategy}</Text>,
  },
  {
    header: '流控效果',
    render: (rule) => <Text>{CONTROL_BEHAVIOR_MAP[rule.controlBehavior] ?? rule.controlBehavior}</Text>,
  },
  {
    header: '集群',
    render: (rule) => (
      <Badge colorPalette={rule.clusterMode ? 'green' : 'gray'}>{rule.clusterMode ? '是' : '否'}</Badge>
    ),
  },
];

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useFlowRules(app ?? '');
  const deleteRule = useDeleteFlowRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource', 'limitApp'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) navigate(paths.dashboard.flow.create(app));
  };

  const handleEdit = (rule: FlowRule) => {
    if (app) navigate(paths.dashboard.flow.edit(app, String(rule.id)));
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

  return (
    <RuleListPage
      title="流控规则"
      app={app ?? ''}
      data={rules}
      filteredData={filteredData}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowKey={(rule) => rule.id}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteRule.isPending}
      pagination={{ page, pageSize, total, onPageChange: setPage }}
    />
  );
}
