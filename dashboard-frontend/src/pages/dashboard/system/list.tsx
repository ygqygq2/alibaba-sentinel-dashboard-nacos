/**
 * 系统规则列表页面
 * 使用通用列表组件构建
 */

import { Badge, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RuleListPage, type TableColumn } from '@/components/ui/rule-list-page';
import { useDeleteSystemRule, useSystemRules } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { SystemRule } from '@/types/rule';

/** 获取系统规则类型名称 */
const getSystemRuleType = (rule: SystemRule): { label: string; color: string } => {
  if (rule.highestSystemLoad !== undefined && rule.highestSystemLoad >= 0) {
    return { label: 'LOAD', color: 'blue' };
  }
  if (rule.avgRt !== undefined && rule.avgRt >= 0) {
    return { label: 'RT', color: 'orange' };
  }
  if (rule.maxThread !== undefined && rule.maxThread >= 0) {
    return { label: '线程数', color: 'purple' };
  }
  if (rule.qps !== undefined && rule.qps >= 0) {
    return { label: '入口 QPS', color: 'green' };
  }
  if (rule.highestCpuUsage !== undefined && rule.highestCpuUsage >= 0) {
    return { label: 'CPU', color: 'red' };
  }
  return { label: '未知', color: 'gray' };
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

/** 表格列配置 */
const columns: TableColumn<SystemRule>[] = [
  {
    header: '阈值类型',
    render: (rule) => {
      const config = getSystemRuleType(rule);
      return <Badge colorPalette={config.color}>{config.label}</Badge>;
    },
  },
  {
    header: '阈值',
    render: (rule) => <Text fontWeight="medium">{getSystemRuleThreshold(rule)}</Text>,
  },
];

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useSystemRules(app ?? '');
  const deleteRule = useDeleteSystemRule(app ?? '');

  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    defaultPageSize: 10,
  });

  const handleCreate = () => {
    if (app) navigate(paths.dashboard.system.create(app));
  };

  const handleEdit = (rule: SystemRule) => {
    if (app && rule.id) navigate(paths.dashboard.system.edit(app, String(rule.id)));
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

  return (
    <RuleListPage
      title="系统规则"
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
      emptyText="暂无系统规则"
    />
  );
}
