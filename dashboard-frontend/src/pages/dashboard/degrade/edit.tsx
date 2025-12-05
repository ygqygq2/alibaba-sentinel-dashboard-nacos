/**
 * 编辑降级规则页面
 */

import { Box, Skeleton, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { DegradeRuleForm } from '@/components/dashboard/rules';
import { useDegradeRules, useUpdateDegradeRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { DegradeRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  const { app, id } = useParams<{ app: string; id: string }>();
  const { data: rules, isLoading } = useDegradeRules(app ?? '');
  const updateRule = useUpdateDegradeRule();

  const rule = React.useMemo(() => {
    if (!rules || !id) return undefined;
    return rules.find((r) => String(r.id) === id);
  }, [rules, id]);

  const handleSubmit = async (data: Omit<DegradeRule, 'id'>) => {
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
        <title>编辑降级规则 - {app} | Sentinel Dashboard</title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <DegradeRuleForm
            app={app}
            initialData={rule}
            onSubmit={handleSubmit}
            isSubmitting={updateRule.isPending}
            backPath={paths.dashboard.degrade.list(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
