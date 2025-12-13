/**
 * 新增授权规则页面
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AuthorityRuleForm } from '@/components/dashboard/rules';
import { useCreateAuthorityRule } from '@/hooks/api';
import { useOpenedInNewTab } from '@/hooks/use-opened-in-new-tab';
import { paths } from '@/paths';
import type { AuthorityRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpenedInNewTab, data, closeTab } = useOpenedInNewTab();

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  const createRule = useCreateAuthorityRule(app);

  const initialResource = React.useMemo(() => {
    return (data?.resource as string) || location.state?.resource || '';
  }, [data, location.state]);

  const handleSubmit = async (ruleData: Omit<AuthorityRule, 'id'>) => {
    await createRule.mutateAsync(ruleData);

    if (isOpenedInNewTab) {
      closeTab();
    } else {
      navigate(paths.dashboard.authority.list(app));
    }
  };

  const handleCancel = () => {
    closeTab();
  };

  return (
    <>
      <Helmet>
        <title>新增授权规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <AuthorityRuleForm
            app={app}
            initialData={initialResource ? ({ resource: initialResource } as Omit<AuthorityRule, 'id'>) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createRule.isPending}
            backPath={paths.dashboard.authority.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
