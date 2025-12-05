/**
 * 新增降级规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { DegradeRuleForm } from '@/components/dashboard/rules';
import { useCreateDegradeRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { DegradeRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const createRule = useCreateDegradeRule();

  const handleSubmit = async (data: Omit<DegradeRule, 'id'>) => {
    await createRule.mutateAsync(data);
  };

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  return (
    <>
      <Helmet>
        <title>新增降级规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <DegradeRuleForm
            app={app}
            onSubmit={handleSubmit}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.degrade.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
