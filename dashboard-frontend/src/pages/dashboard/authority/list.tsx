/**
 * 授权规则列表页面
 * 使用通用列表组件构建
 */

import { Badge, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { RuleListPage, type TableColumn } from '@/components/ui/rule-list-page';
import { useGlobalSearch } from '@/contexts/search-context';
import { useAuthorityRules, useDeleteAuthorityRule } from '@/hooks/api';
import { useListFilter } from '@/hooks/use-list-filter';
import { paths } from '@/paths';
import type { AuthorityRule } from '@/types/rule';

/** 授权策略 */
const STRATEGY_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '白名单', color: 'green' },
  1: { label: '黑名单', color: 'red' },
};

/** 表格列配置 */
const columns: TableColumn<AuthorityRule>[] = [
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
    header: '授权类型',
    render: (rule) => {
      const config = STRATEGY_MAP[rule.strategy];
      return <Badge colorPalette={config?.color || 'gray'}>{config?.label || rule.strategy}</Badge>;
    },
  },
  {
    header: '流控应用',
    render: (rule) => (
      <Text
        maxW="300px"
        truncate
      >
        {rule.limitApp}
      </Text>
    ),
  },
];

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading, error } = useAuthorityRules(app ?? '');
  const deleteRule = useDeleteAuthorityRule(app ?? '');
  const { searchKey } = useGlobalSearch();

  const { filteredData, page, setPage, pageSize, total } = useListFilter({
    data: rules,
    searchFields: ['resource', 'limitApp'],
    defaultPageSize: 10,
    externalSearchKey: searchKey,
  });

  const handleCreate = () => {
    if (app) navigate(paths.dashboard.authority.create(app));
  };

  const handleEdit = (rule: AuthorityRule) => {
    if (app && rule.id) navigate(paths.dashboard.authority.edit(app, String(rule.id)));
  };

  const handleDelete = async (rule: AuthorityRule) => {
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
      title="授权规则"
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
      emptyText="暂无授权规则"
    />
  );
}
