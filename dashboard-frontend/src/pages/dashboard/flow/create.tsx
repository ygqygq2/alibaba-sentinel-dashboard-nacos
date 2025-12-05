/**
 * 新增流控规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { FlowRuleForm } from '@/components/dashboard/rules';
import { useCreateFlowRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { FlowRuleBase } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const createRule = useCreateFlowRule();

  const handleSubmit = async (data: FlowRuleBase) => {
    await createRule.mutateAsync(data);
  };

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  return (
    <>
      <Helmet>
        <title>新增流控规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <FlowRuleForm
            app={app}
            onSubmit={handleSubmit}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.flow.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
