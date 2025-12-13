/**
 * 编辑流控规则页面
 */

import * as React from 'react';

import { FlowRuleForm, RuleEditPage } from '@/components/dashboard/rules';
import { useFlowRules, useUpdateFlowRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { FlowRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  return (
    <RuleEditPage<FlowRule>
      ruleTypeName="流控规则"
      FormComponent={FlowRuleForm}
      useRulesQuery={useFlowRules}
      useUpdateMutation={useUpdateFlowRule}
      getBackPath={(app) => paths.dashboard.flow.list(app)}
    />
  );
}
