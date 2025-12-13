/**
 * 新增流控规则页面
 */

import * as React from 'react';

import { FlowRuleForm, RuleCreatePage } from '@/components/dashboard/rules';
import { useCreateFlowRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { FlowRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  return (
    <RuleCreatePage<FlowRule>
      ruleTypeName="流控规则"
      FormComponent={FlowRuleForm}
      useCreateMutation={useCreateFlowRule}
      getBackPath={(app) => paths.dashboard.flow.list(app)}
    />
  );
}
