/**
 * 新增授权规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { AuthorityRuleForm } from '@/components/dashboard/rules';
import { useCreateAuthorityRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { AuthorityRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const createRule = useCreateAuthorityRule(app ?? '');

  const handleSubmit = async (data: Omit<AuthorityRule, 'id'>) => {
    await createRule.mutateAsync(data);
  };

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  return (
    <>
      <Helmet>
        <title>新增授权规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <AuthorityRuleForm
            app={app}
            onSubmit={handleSubmit}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.authority.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
