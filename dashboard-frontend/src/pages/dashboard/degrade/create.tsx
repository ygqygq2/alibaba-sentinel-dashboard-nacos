/**
 * 新增降级规则页面
 */

import * as React from 'react';

import { DegradeRuleForm, RuleCreatePage } from '@/components/dashboard/rules';
import { useCreateDegradeRule } from '@/hooks/api';
import { paths } from '@/paths';
import type { DegradeRule } from '@/types/rule';

export function Page(): React.JSX.Element {
  return (
    <RuleCreatePage<DegradeRule>
      ruleTypeName="降级规则"
      FormComponent={DegradeRuleForm}
      useCreateMutation={useCreateDegradeRule}
      getBackPath={(app) => paths.dashboard.degrade.list(app)}
    />
  );
}
