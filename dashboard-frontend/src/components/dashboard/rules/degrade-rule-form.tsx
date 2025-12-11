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
  count: 0, // 后端必填字段，异常比例/异常数模式需要用户填写
  timeWindow: undefined as unknown as number, // 强制用户填写
  minRequestAmount: undefined as unknown as number, // 强制用户填写
  slowRatioThreshold: undefined as unknown as number, // 慢调用模式必填
  statIntervalMs: undefined as unknown as number, // 慢调用模式必填
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
    if (formData.timeWindow === undefined || formData.timeWindow === null || formData.timeWindow <= 0)
      newErrors.timeWindow = '时间窗口必须大于 0';
    if (formData.minRequestAmount === undefined || formData.minRequestAmount === null || formData.minRequestAmount <= 0)
      newErrors.minRequestAmount = '最小请求数必须大于 0';

    // 慢调用比例模式（grade=0）
    if (formData.grade === 0) {
      if (
        formData.slowRatioThreshold === undefined ||
        formData.slowRatioThreshold === null ||
        isNaN(formData.slowRatioThreshold)
      ) {
        newErrors.slowRatioThreshold = '慢调用比例阈值必须填写';
      }
      if (formData.statIntervalMs === undefined || formData.statIntervalMs === null || isNaN(formData.statIntervalMs)) {
        newErrors.statIntervalMs = '最大 RT 必须填写';
      }
    }

    // 异常比例模式（grade=1）或异常数模式（grade=2）需要 count
    if (formData.grade === 1 || formData.grade === 2) {
      if (formData.count === undefined || formData.count === null || isNaN(formData.count)) {
        newErrors.count = formData.grade === 1 ? '异常比例必须填写' : '异常数必须填写';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // 修复：慢调用比例模式（grade=0）不使用 count，但后端验证要求 count 不为 null
      // 给 count 设置一个默认值 0（后端会忽略这个值）
      const submitData = { ...formData };
      if (submitData.grade === 0 && (submitData.count === undefined || submitData.count === null)) {
        submitData.count = 0;
      }
      await onSubmit(submitData);
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
        降级策略 (grade)
      </Text>
      <Text
        mb={3}
        fontSize="sm"
      >
        <strong>0 = 慢调用比例</strong>：响应时间超过「最大RT」的请求视为慢调用，当慢调用占比超过「比例阈值」(0-1)
        时触发熔断。 例如：0.2 表示 20%
        <br />
        <strong>1 = 异常比例</strong>：当异常请求占总请求的比例超过「异常比例阈值」(0-1) 时触发熔断。例如：0.3 表示 30%
        <br />
        <strong>2 = 异常数</strong>：当异常请求数量超过「异常数阈值」(整数) 时触发熔断。例如：5 表示 5 个异常
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
          name="resource"
          required
          value={formData.resource}
          onChange={(v) => handleChange('resource', v)}
          placeholder="请输入资源名称"
          disabled={isEditMode}
          error={errors.resource}
        />
        <FormSelect
          label="降级策略"
          name="grade"
          value={formData.grade}
          onChange={(v) => handleChange('grade', Number(v))}
          options={GRADE_OPTIONS}
        />
        <FormInput
          label="熔断时长(秒)"
          name="timeWindow"
          required
          type="number"
          value={formData.timeWindow ?? ''}
          onChange={(v) => handleChange('timeWindow', Number(v))}
          min={1}
          placeholder="10"
          error={errors.timeWindow}
          helperText="降级持续时间，到期后进入半开状态"
        />
      </FormSection>

      {/* 慢调用比例特有字段 */}
      <FormSection show={formData.grade === 0}>
        <FormInput
          label="最大 RT(ms)"
          name="statIntervalMs"
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
          name="slowRatioThreshold"
          required
          type="number"
          value={formData.slowRatioThreshold ?? ''}
          onChange={(v) => handleChange('slowRatioThreshold', Number(v))}
          min={0}
          max={1}
          step={0.1}
          placeholder="0.5"
          error={errors.slowRatioThreshold}
          helperText="慢调用占总请求的比例（0-1），如0.2表示20%"
        />
        <FormInput
          label="最小请求数"
          name="minRequestAmount"
          required
          type="number"
          value={formData.minRequestAmount ?? ''}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          placeholder="5"
          error={errors.minRequestAmount}
          helperText="触发降级的最小请求数量"
        />
      </FormSection>

      {/* 异常比例字段 */}
      <FormSection show={formData.grade === 1}>
        <FormInput
          label="异常比例阈值"
          name="count"
          required
          type="number"
          value={formData.count}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          max={1}
          step={0.1}
          placeholder="0.3"
          error={errors.count}
          helperText="异常请求占总请求的比例（0-1），如0.3表示30%"
        />
        <FormInput
          label="最小请求数"
          name="minRequestAmount"
          required
          type="number"
          value={formData.minRequestAmount ?? ''}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          placeholder="5"
          error={errors.minRequestAmount}
          helperText="触发降级的最小请求数量"
        />
      </FormSection>

      {/* 异常数字段 */}
      <FormSection show={formData.grade === 2}>
        <FormInput
          label="异常数阈值"
          name="count"
          required
          type="number"
          value={formData.count ?? ''}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          step={1}
          placeholder="5"
          error={errors.count}
          helperText="异常请求的绝对数量（整数），如5表示5个异常"
        />
        <FormInput
          label="最小请求数"
          name="minRequestAmount"
          required
          type="number"
          value={formData.minRequestAmount ?? ''}
          onChange={(v) => handleChange('minRequestAmount', Number(v))}
          min={1}
          placeholder="5"
          error={errors.minRequestAmount}
          helperText="触发降级的最小请求数量"
        />
      </FormSection>
    </RuleFormLayout>
  );
}
