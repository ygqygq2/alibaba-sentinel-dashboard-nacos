/**
 * 新增系统规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import { SystemRuleForm } from '@/components/dashboard/rules';
import { useCreateSystemRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { SystemRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  const createRule = useCreateSystemRule(app);

  const handleSubmit = async (data: Omit<SystemRule, 'id'>) => {
    await createRule.mutateAsync(data);
    // 创建成功后跳转回列表页
    navigate(paths.dashboard.system.list(app));
  };

  return (
    <>
      <Helmet>
        <title>新增系统规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <SystemRuleForm
            app={app}
            onSubmit={handleSubmit}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.system.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
