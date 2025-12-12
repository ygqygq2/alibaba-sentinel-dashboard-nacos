/**
 * 授权规则表单组件
 * 使用通用表单组件构建
 */

import { Text } from '@chakra-ui/react';
import * as React from 'react';

import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-field';
import { FormSection, RuleFormLayout } from '@/components/ui/rule-form-layout';
import type { AuthorityRule } from '@/types/rule';

export interface AuthorityRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: AuthorityRule;
  /** 提交处理 */
  onSubmit: (data: Omit<AuthorityRule, 'id'>) => Promise<void>;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
}

/** 授权类型选项 */
const STRATEGY_OPTIONS = [
  { value: 0, label: '白名单' },
  { value: 1, label: '黑名单' },
];

/** 默认表单值 */
const defaultValues: Omit<AuthorityRule, 'app' | 'id'> = {
  resource: '',
  limitApp: 'default',
  strategy: 0, // 白名单（必须有值，因为是select下拉框）
};

export function AuthorityRuleForm({
  app,
  initialData,
  onSubmit,
  isSubmitting,
  backPath,
}: AuthorityRuleFormProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<Omit<AuthorityRule, 'id'>>(() => ({
    ...defaultValues,
    ...initialData,
    app,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof AuthorityRule, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.resource.trim()) newErrors.resource = '资源名称不能为空';
    if (!formData.limitApp.trim()) newErrors.limitApp = '流控应用不能为空';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('提交失败:', err);
    }
  };

  const isEditMode = !!initialData?.id;

  const helpContent = (
    <>
      <Text
        fontWeight="medium"
        mb={2}
      >
        授权类型
      </Text>
      <Text mb={3}>
        • 白名单：只允许指定应用访问
        <br />• 黑名单：禁止指定应用访问
      </Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        流控应用
      </Text>
      <Text>填写调用方的应用名称，多个应用用英文逗号分隔。用于区分调用来源，实现访问控制。</Text>
    </>
  );

  return (
    <RuleFormLayout
      title="授权规则"
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      backPath={backPath}
      onSubmit={handleSubmit}
      helpContent={helpContent}
    >
      <FormSection columns={{ base: 1, md: 2 }}>
        <FormInput
          label="资源名称"
          name="resource"
          required
          value={formData.resource}
          onChange={(v) => handleChange('resource', v)}
          placeholder="请输入资源名称"
          disabled={isEditMode}
          error={errors.resource}
        />
        <FormSelect
          label="授权类型"
          name="strategy"
          value={formData.strategy}
          onChange={(v) => handleChange('strategy', Number(v))}
          options={STRATEGY_OPTIONS}
          helperText={formData.strategy === 0 ? '只允许指定应用访问' : '禁止指定应用访问'}
        />
      </FormSection>

      <FormSection columns={{ base: 1, md: 1 }}>
        <FormTextarea
          label="流控应用"
          name="limitApp"
          required
          value={formData.limitApp}
          onChange={(v) => handleChange('limitApp', v)}
          placeholder="多个应用用逗号分隔，如：app1,app2,app3"
          rows={3}
          error={errors.limitApp}
          helperText="填写调用方的应用名称，多个应用用英文逗号分隔"
        />
      </FormSection>
    </RuleFormLayout>
  );
}
