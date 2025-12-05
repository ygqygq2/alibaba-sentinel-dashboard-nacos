/**
 * 降级规则列表页面
 * 使用通用列表组件构建
 */

import { Badge, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RuleListPage, type TableColumn } from '@/components/ui/rule-list-page';
import { useGlobalSearch } from '@/contexts/search-context';
import { useDegradeRules, useDeleteDegradeRule } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { DegradeRule } from '@/types/rule';

/** 降级策略 */
const GRADE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '慢调用比例', color: 'orange' },
  1: { label: '异常比例', color: 'red' },
  2: { label: '异常数', color: 'purple' },
};

/** 格式化阈值显示 */
const formatThreshold = (rule: DegradeRule): string => {
  switch (rule.grade) {
    case 0:
      return `RT>${rule.statIntervalMs ?? 0}ms, 比例>${rule.count}`;
    case 1:
      return `${(rule.count * 100).toFixed(0)}%`;
    case 2:
      return `${rule.count}`;
    default:
      return String(rule.count);
  }
};

/** 表格列配置 */
const columns: TableColumn<DegradeRule>[] = [
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
    header: '降级策略',
    render: (rule) => {
      const config = GRADE_MAP[rule.grade];
      return <Badge colorPalette={config?.color || 'gray'}>{config?.label || rule.grade}</Badge>;
    },
  },
  {
    header: '阈值',
    render: (rule) => <Text>{formatThreshold(rule)}</Text>,
  },
  {
    header: '熔断时长(秒)',
    render: (rule) => <Text>{rule.timeWindow}</Text>,
  },
  {
    header: '最小请求数',
    render: (rule) => <Text>{rule.minRequestAmount}</Text>,
  },
];

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useDegradeRules(app ?? '');
  const deleteRule = useDeleteDegradeRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) navigate(paths.dashboard.degrade.create(app));
  };

  const handleEdit = (rule: DegradeRule) => {
    if (app && rule.id) navigate(paths.dashboard.degrade.edit(app, String(rule.id)));
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

  return (
    <RuleListPage
      title="熔断规则"
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
    />
  );
}
