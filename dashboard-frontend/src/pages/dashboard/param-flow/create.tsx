/**
 * 新增热点参数规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ParamFlowRuleForm } from '@/components/dashboard/rules';
import { useCreateParamFlowRule } from '@/hooks/api';
import { useOpenedInNewTab } from '@/hooks/use-opened-in-new-tab';
import { paths } from '@/paths';
import type { ParamFlowRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const createRule = useCreateParamFlowRule(app ?? '');
  const { isOpenedInNewTab, data, closeTab } = useOpenedInNewTab();

  const initialResource = React.useMemo(() => {
    return (data?.resource as string) || location.state?.resource || '';
  }, [data, location.state]);

  const handleSubmit = async (ruleData: Omit<ParamFlowRule, 'id'>) => {
    await createRule.mutateAsync(ruleData);

    if (isOpenedInNewTab) {
      closeTab();
    } else {
      navigate(paths.dashboard.paramFlow.list(app!));
    }
  };

  const handleCancel = () => {
    closeTab();
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
            initialData={initialResource ? ({ resource: initialResource } as Omit<ParamFlowRule, 'id'>) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.paramFlow.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
