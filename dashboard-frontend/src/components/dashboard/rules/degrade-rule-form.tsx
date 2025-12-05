/**
 * 降级规则表单组件
 * 使用通用表单组件构建
 */

import { Text } from '@chakra-ui/react';
import * as React from 'react';

import { FormInput, FormSelect } from '@/components/ui/form-field';
import { FormSection, RuleFormLayout } from '@/components/ui/rule-form-layout';
import type { DegradeRule } from '@/types/rule';

export interface DegradeRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: DegradeRule;
  /** 提交处理 */
  onSubmit: (data: Omit<DegradeRule, 'id'>) => Promise<void>;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
}

/** 降级策略选项 */
const GRADE_OPTIONS = [
  { value: 0, label: '慢调用比例' },
  { value: 1, label: '异常比例' },
  { value: 2, label: '异常数' },
];

/** 默认表单值 */
const defaultValues: Omit<DegradeRule, 'app' | 'id'> = {
  resource: '',
  grade: 0,
  count: 0,
  timeWindow: 5,
  minRequestAmount: 5,
  slowRatioThreshold: 1.0,
  statIntervalMs: 1000,
};

export function DegradeRuleForm({
  app,
  initialData,
  onSubmit,
  isSubmitting,
  backPath,
}: DegradeRuleFormProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<Omit<DegradeRule, 'id'>>(() => ({
    ...defaultValues,
    ...initialData,
    app,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof DegradeRule, value: string | number) => {
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
    if (formData.count < 0) newErrors.count = '阈值不能为负数';
    if (formData.timeWindow <= 0) newErrors.timeWindow = '时间窗口必须大于 0';
    if (formData.minRequestAmount <= 0) newErrors.minRequestAmount = '最小请求数必须大于 0';

    if (formData.grade === 0) {
      if (!formData.slowRatioThreshold || formData.slowRatioThreshold < 0 || formData.slowRatioThreshold > 1) {
        newErrors.slowRatioThreshold = '慢调用比例阈值必须在 0-1 之间';
      }
      if (!formData.statIntervalMs || formData.statIntervalMs <= 0) {
        newErrors.statIntervalMs = '最大 RT 必须大于 0';
      }
    }

    if (formData.grade === 1 && (formData.count < 0 || formData.count > 1)) {
      newErrors.count = '异常比例必须在 0-1 之间';
    }

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
        降级策略
      </Text>
      <Text mb={3}>
        • 慢调用比例：RT 超过阈值且比例超限
        <br />• 异常比例：异常请求比例超限
        <br />• 异常数：异常请求数量超限
      </Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        熔断机制
      </Text>
      <Text>
        触发降级后进入熔断状态，熔断时长结束后进入半开状态。半开状态下如果下一个请求成功，则结束熔断；否则继续熔断。
      </Text>
    </>
  );

  return (
    <RuleFormLayout
      title="熔断规则"
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      backPath={backPath}
      onSubmit={handleSubmit}
      helpContent={helpContent}
    >
      {/* 基础配置 */}
      <FormSection>
        <FormInput
          label="资源名称"
          required
          value={formData.resource}
          onChange={(v) => handleChange('resource', v)}
          placeholder="请输入资源名称"
          disabled={isEditMode}
          error={errors.resource}
        />
        <FormSelect
          label="降级策略"
          value={formData.grade}
          onChange={(v) => handleChange('grade', Number(v))}
          options={GRADE_OPTIONS}
        />
        <FormInput
          label="熔断时长(秒)"
          required
          type="number"
          value={formData.timeWindow}
          onChange={(v) => handleChange('timeWindow', Number(v))}
          min={1}
          error={errors.timeWindow}
          helperText="降级持续时间，到期后进入半开状态"
        />
      </FormSection>

      {/* 慢调用比例特有字段 */}
      <FormSection show={formData.grade === 0}>
        <FormInput
          label="最大 RT(ms)"
          required
          type="number"
          value={formData.statIntervalMs || ''}
          onChange={(v) => handleChange('statIntervalMs', Number(v))}
          min={1}
          placeholder="1000"
          error={errors.statIntervalMs}
          helperText="超过此响应时间视为慢调用"
        />
        <FormInput
          label="比例阈值"
          required
          type="number"
          value={formData.slowRatioThreshold ?? ''}
          onChange={(v) => handleChange('slowRatioThreshold', Number(v))}
          min={0}
          max={1}
          error={errors.slowRatioThreshold}
          helperText="慢调用比例阈值（0-1）"
        />
        <FormInput
          label="最小请求数"
          required
          type="number"
          value={formData.minRequestAmount}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          error={errors.minRequestAmount}
          helperText="触发降级的最小请求数量"
        />
      </FormSection>

      {/* 异常比例字段 */}
      <FormSection show={formData.grade === 1}>
        <FormInput
          label="异常比例阈值"
          required
          type="number"
          value={formData.count}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          max={1}
          error={errors.count}
          helperText="异常比例 0-1 之间"
        />
        <FormInput
          label="最小请求数"
          required
          type="number"
          value={formData.minRequestAmount}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          error={errors.minRequestAmount}
        />
      </FormSection>

      {/* 异常数字段 */}
      <FormSection show={formData.grade === 2}>
        <FormInput
          label="异常数阈值"
          required
          type="number"
          value={formData.count}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          error={errors.count}
        />
        <FormInput
          label="最小请求数"
          required
          type="number"
          value={formData.minRequestAmount}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          error={errors.minRequestAmount}
        />
      </FormSection>
    </RuleFormLayout>
  );
}
