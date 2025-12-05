/**
 * 热点参数规则列表页面
 * 使用通用列表组件构建
 */

import { Badge, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RuleListPage, type TableColumn } from '@/components/ui/rule-list-page';
import { useGlobalSearch } from '@/contexts/search-context';
import { useDeleteParamFlowRule, useParamFlowRules } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { ParamFlowRule } from '@/types/rule';

/** 阈值类型 */
const GRADE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '线程数', color: 'orange' },
  1: { label: 'QPS', color: 'blue' },
};

/** 格式化参数例外项 */
const formatParamFlowItems = (rule: ParamFlowRule): string => {
  if (!rule.paramFlowItemList?.length) return '-';
  return (
    rule.paramFlowItemList
      .map((item) => `${item.object}: ${item.count}`)
      .slice(0, 2)
      .join(', ') + (rule.paramFlowItemList.length > 2 ? '...' : '')
  );
};

/** 表格列配置 */
const columns: TableColumn<ParamFlowRule>[] = [
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
    header: '参数索引',
    render: (rule) => <Text>{rule.paramIdx}</Text>,
  },
  {
    header: '阈值类型',
    render: (rule) => {
      const config = GRADE_MAP[rule.grade];
      return <Badge colorPalette={config?.color || 'gray'}>{config?.label || rule.grade}</Badge>;
    },
  },
  {
    header: '单机阈值',
    render: (rule) => <Text>{rule.count}</Text>,
  },
  {
    header: '统计窗口(秒)',
    render: (rule) => <Text>{rule.durationInSec}</Text>,
  },
  {
    header: '参数例外项',
    render: (rule) => (
      <Text
        maxW="200px"
        truncate
        title={formatParamFlowItems(rule)}
      >
        {formatParamFlowItems(rule)}
      </Text>
    ),
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
  const { data: rules, isLoading, error } = useParamFlowRules(app ?? '');
  const deleteRule = useDeleteParamFlowRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) navigate(paths.dashboard.paramFlow.create(app));
  };

  const handleEdit = (rule: ParamFlowRule) => {
    if (app && rule.id) navigate(paths.dashboard.paramFlow.edit(app, String(rule.id)));
  };

  const handleDelete = async (rule: ParamFlowRule) => {
    if (!rule.id) return;
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
      title="热点规则"
      app={app ?? ''}
      data={rules}
      filteredData={filteredData}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowKey={(rule) => rule.id ?? 0}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteRule.isPending}
      pagination={{ page, pageSize, total, onPageChange: setPage }}
      emptyText="暂无热点规则"
    />
  );
}
