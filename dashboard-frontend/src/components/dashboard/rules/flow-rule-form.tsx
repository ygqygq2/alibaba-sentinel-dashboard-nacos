/**
 * 流控规则表单组件
 * 使用通用表单组件构建
 */

import { Box, Grid, Text } from '@chakra-ui/react';
import * as React from 'react';

import { FormInput, FormSelect, FormSwitch } from '@/components/ui/form-field';
import { FormRow, FormSection, RuleFormLayout } from '@/components/ui/rule-form-layout';
import type { FlowRule, FlowRuleBase } from '@/types/rule';

export interface FlowRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: FlowRule;
  /** 提交处理 */
  onSubmit: (data: FlowRuleBase) => Promise<void>;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
}

/** 阈值类型选项 */
const GRADE_OPTIONS = [
  { value: 1, label: 'QPS' },
  { value: 0, label: '线程数' },
];

/** 流控模式选项 */
const STRATEGY_OPTIONS = [
  { value: 0, label: '直接' },
  { value: 1, label: '关联' },
  { value: 2, label: '链路' },
];

/** 流控效果选项 */
const CONTROL_BEHAVIOR_OPTIONS = [
  { value: 0, label: '快速失败' },
  { value: 1, label: 'Warm Up' },
  { value: 2, label: '排队等待' },
];

/** 集群阈值模式选项 */
const THRESHOLD_TYPE_OPTIONS = [
  { value: 0, label: '单机均摊' },
  { value: 1, label: '总体阈值' },
];

/** 默认表单值 */
const defaultValues: Omit<FlowRuleBase, 'app'> = {
  resource: '',
  grade: 1,
  count: 0,
  strategy: 0,
  controlBehavior: 0,
  limitApp: 'default',
  clusterMode: false,
};

export function FlowRuleForm({
  app,
  initialData,
  onSubmit,
  isSubmitting,
  backPath,
}: FlowRuleFormProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<FlowRuleBase>(() => ({
    ...defaultValues,
    ...initialData,
    app,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof FlowRuleBase, value: string | number | boolean) => {
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
    if (formData.strategy === 1 && !formData.refResource?.trim()) newErrors.refResource = '关联模式下必须填写关联资源';
    if (formData.controlBehavior === 1 && (!formData.warmUpPeriodSec || formData.warmUpPeriodSec <= 0))
      newErrors.warmUpPeriodSec = 'Warm Up 模式下必须设置预热时长';
    if (formData.controlBehavior === 2 && (!formData.maxQueueingTimeMs || formData.maxQueueingTimeMs <= 0))
      newErrors.maxQueueingTimeMs = '排队等待模式下必须设置超时时间';
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
        阈值类型
      </Text>
      <Text mb={3}>
        • QPS：每秒请求数限制
        <br />• 线程数：并发线程数限制
      </Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        流控模式
      </Text>
      <Text mb={3}>
        • 直接：对当前资源限流
        <br />• 关联：关联资源达到阈值时限流
        <br />• 链路：只记录指定入口的流量
      </Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        流控效果
      </Text>
      <Text>
        • 快速失败：直接拒绝请求
        <br />• Warm Up：预热启动，逐渐放量
        <br />• 排队等待：匀速排队通过
      </Text>
    </>
  );

  return (
    <RuleFormLayout
      title="流控规则"
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
          label="阈值类型"
          value={formData.grade}
          onChange={(v) => handleChange('grade', Number(v))}
          options={GRADE_OPTIONS}
        />
        <FormInput
          label="阈值"
          required
          type="number"
          value={formData.count}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          error={errors.count}
        />
      </FormSection>

      {/* 高级配置 */}
      <FormSection>
        <FormInput
          label="针对来源"
          value={formData.limitApp}
          onChange={(v) => handleChange('limitApp', v)}
          placeholder="default"
        />
        <FormSelect
          label="流控模式"
          value={formData.strategy}
          onChange={(v) => handleChange('strategy', Number(v))}
          options={STRATEGY_OPTIONS}
        />
        <FormSelect
          label="流控效果"
          value={formData.controlBehavior}
          onChange={(v) => handleChange('controlBehavior', Number(v))}
          options={CONTROL_BEHAVIOR_OPTIONS}
        />
      </FormSection>

      {/* 条件字段 */}
      <FormSection show={formData.strategy === 1 || formData.controlBehavior === 1 || formData.controlBehavior === 2}>
        {formData.strategy === 1 && (
          <FormInput
            label="关联资源"
            required
            value={formData.refResource || ''}
            onChange={(v) => handleChange('refResource', v)}
            placeholder="请输入关联资源"
            error={errors.refResource}
          />
        )}
        {formData.controlBehavior === 1 && (
          <FormInput
            label="预热时长(秒)"
            required
            type="number"
            value={formData.warmUpPeriodSec || ''}
            onChange={(v) => handleChange('warmUpPeriodSec', Number(v))}
            min={1}
            placeholder="10"
            error={errors.warmUpPeriodSec}
          />
        )}
        {formData.controlBehavior === 2 && (
          <FormInput
            label="超时时间(ms)"
            required
            type="number"
            value={formData.maxQueueingTimeMs || ''}
            onChange={(v) => handleChange('maxQueueingTimeMs', Number(v))}
            min={1}
            placeholder="500"
            error={errors.maxQueueingTimeMs}
          />
        )}
      </FormSection>

      {/* 集群模式 */}
      <FormRow>
        <FormSwitch
          label="集群模式"
          checked={formData.clusterMode ?? false}
          onChange={(v) => handleChange('clusterMode', v)}
        />
      </FormRow>

      {formData.clusterMode && (
        <Box
          mt={3}
          p={4}
          bg="bg.muted"
          borderRadius="md"
        >
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
            gap={4}
          >
            <FormSelect
              label="阈值模式"
              value={formData.clusterConfig?.thresholdType ?? 0}
              onChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  clusterConfig: { ...prev.clusterConfig, thresholdType: Number(v) },
                }))
              }
              options={THRESHOLD_TYPE_OPTIONS}
            />
            <FormSwitch
              label="失败退化到本地"
              checked={formData.clusterConfig?.fallbackToLocalWhenFail ?? true}
              onChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  clusterConfig: {
                    ...prev.clusterConfig,
                    thresholdType: prev.clusterConfig?.thresholdType ?? 0,
                    fallbackToLocalWhenFail: v,
                  },
                }))
              }
            />
          </Grid>
        </Box>
      )}
    </RuleFormLayout>
  );
}
