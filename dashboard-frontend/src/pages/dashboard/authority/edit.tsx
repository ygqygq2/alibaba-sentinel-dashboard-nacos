/**
 * 编辑授权规则页面
 */

import { Box, Skeleton, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { AuthorityRuleForm } from '@/components/dashboard/rules';
import { useAuthorityRules, useUpdateAuthorityRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { AuthorityRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app, id } = useParams<{ app: string; id: string }>();
  const { data: rules, isLoading } = useAuthorityRules(app ?? '');
  const updateRule = useUpdateAuthorityRule(app ?? '');

  const rule = React.useMemo(() => {
    if (!rules || !id) return undefined;
    return rules.find((r) => String(r.id) === id);
  }, [rules, id]);

  const handleSubmit = async (data: Omit<AuthorityRule, 'id'>) => {
    if (!rule?.id) return;
    await updateRule.mutateAsync({ ...data, id: rule.id });
  };

  if (!app || !id) {
    return <Box p={6}>参数错误</Box>;
  }

  if (isLoading) {
    return (
      <Box p={6}>
        <Stack gap={4}>
          <Skeleton height="40px" />
          <Skeleton height="200px" />
        </Stack>
      </Box>
    );
  }

  if (!rule) {
    return (
      <Box p={6}>
        <Text color="red.500">规则不存在</Text>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>编辑授权规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <AuthorityRuleForm
            app={app}
            initialData={rule}
            onSubmit={handleSubmit}
            isSubmitting={updateRule.isPending}
            backPath={paths.dashboard.authority.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
