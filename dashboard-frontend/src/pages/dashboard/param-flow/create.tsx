/**
 * 新增热点参数规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { ParamFlowRuleForm } from '@/components/dashboard/rules';
import { useCreateParamFlowRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { ParamFlowRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const createRule = useCreateParamFlowRule(app ?? '');

  const handleSubmit = async (data: Omit<ParamFlowRule, 'id'>) => {
    await createRule.mutateAsync(data);
    // 创建成功后跳转回列表页
    navigate(paths.dashboard.paramFlow.list(app!));
  };

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  return (
    <>
      <Helmet>
        <title>新增热点规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <ParamFlowRuleForm
            app={app}
            onSubmit={handleSubmit}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.paramFlow.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
