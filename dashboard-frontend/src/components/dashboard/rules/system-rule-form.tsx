/**
 * 系统规则表单组件
 * 使用通用表单组件构建
 */

import { Text } from '@chakra-ui/react';
import * as React from 'react';

import { FormInput, FormSelect } from '@/components/ui/form-field';
import { FormSection, RuleFormLayout } from '@/components/ui/rule-form-layout';
import type { SystemRule } from '@/types/rule';

export interface SystemRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: SystemRule;
  /** 提交处理 */
  onSubmit: (data: Omit<SystemRule, 'id'>) => Promise<void>;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
}

/** 系统规则类型 */
type RuleType = 'load' | 'rt' | 'thread' | 'qps' | 'cpu';

const ruleTypeMap: Record<RuleType, { label: string; unit: string; description: string }> = {
  load: { label: 'LOAD', unit: '', description: '系统负载（1分钟平均）' },
  rt: { label: '平均 RT', unit: 'ms', description: '所有入口流量的平均响应时间' },
  thread: { label: '并发线程数', unit: '', description: '所有入口流量的并发线程数' },
  qps: { label: '入口 QPS', unit: '', description: '所有入口流量的 QPS' },
  cpu: { label: 'CPU 使用率', unit: '%', description: 'CPU 使用率（0-1）' },
};

/** 规则类型选项 */
const RULE_TYPE_OPTIONS = Object.entries(ruleTypeMap).map(([key, info]) => ({
  value: key,
  label: info.label,
}));

function getRuleType(rule: Partial<SystemRule>): RuleType {
  if (rule.highestSystemLoad !== undefined && rule.highestSystemLoad >= 0) return 'load';
  if (rule.avgRt !== undefined && rule.avgRt >= 0) return 'rt';
  if (rule.maxThread !== undefined && rule.maxThread >= 0) return 'thread';
  if (rule.qps !== undefined && rule.qps >= 0) return 'qps';
  if (rule.highestCpuUsage !== undefined && rule.highestCpuUsage >= 0) return 'cpu';
  return 'qps';
}

function getThresholdValue(rule: Partial<SystemRule>, type: RuleType): number {
  switch (type) {
    case 'load':
      return rule.highestSystemLoad ?? 0;
    case 'rt':
      return rule.avgRt ?? 0;
    case 'thread':
      return rule.maxThread ?? 0;
    case 'qps':
      return rule.qps ?? 0;
    case 'cpu':
      return rule.highestCpuUsage ?? 0;
    default:
      return 0;
  }
}

export function SystemRuleForm({
  app,
  initialData,
  onSubmit,
  isSubmitting,
  backPath,
}: SystemRuleFormProps): React.JSX.Element {
  const [ruleType, setRuleType] = React.useState<RuleType>(() => (initialData ? getRuleType(initialData) : 'qps'));
  const [threshold, setThreshold] = React.useState<number | undefined>(
    () => (initialData ? getThresholdValue(initialData, getRuleType(initialData)) : undefined) // 强制用户填写
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (threshold === undefined || threshold === null || isNaN(threshold)) {
      newErrors.threshold = '阈值必须填写';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const rule: Omit<SystemRule, 'id'> = {
      app,
      highestSystemLoad: ruleType === 'load' ? threshold : -1,
      avgRt: ruleType === 'rt' ? threshold : -1,
      maxThread: ruleType === 'thread' ? threshold : -1,
      qps: ruleType === 'qps' ? threshold : -1,
      highestCpuUsage: ruleType === 'cpu' ? threshold : -1,
    };

    try {
      await onSubmit(rule);
    } catch (err) {
      console.error('提交失败:', err);
    }
  };

  const isEditMode = !!initialData?.id;
  const typeInfo = ruleTypeMap[ruleType];

  const helpContent = (
    <>
      <Text
        fontWeight="medium"
        mb={2}
      >
        阈值类型说明
      </Text>
      <Text mb={3}>
        • LOAD：系统负载（1分钟平均）
        <br />• 平均 RT：所有入口流量的平均响应时间
        <br />• 并发线程数：所有入口流量的并发线程数
        <br />• 入口 QPS：所有入口流量的 QPS
        <br />• CPU 使用率：CPU 使用率（0-1）
      </Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        触发机制
      </Text>
      <Text>当系统指标超过阈值时，将触发系统保护，拒绝新的请求，直到系统恢复。</Text>
    </>
  );

  return (
    <RuleFormLayout
      title="系统规则"
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      backPath={backPath}
      onSubmit={handleSubmit}
      helpContent={helpContent}
    >
      <FormSection columns={{ base: 1, md: 2 }}>
        <FormSelect
          label="阈值类型"
          name="ruleType"
          value={ruleType}
          onChange={(v) => {
            setRuleType(v as RuleType);
            setThreshold(0);
          }}
          options={RULE_TYPE_OPTIONS}
          disabled={isEditMode}
          helperText={typeInfo.description}
        />
        <FormInput
          label={`阈值${typeInfo.unit ? ` (${typeInfo.unit})` : ''}`}
          name="threshold"
          required
          type="number"
          value={threshold ?? ''}
          onChange={(v) => {
            setThreshold(Number(v));
            if (errors.threshold) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.threshold;
                return newErrors;
              });
            }
          }}
          min={0}
          max={ruleType === 'cpu' ? 1 : undefined}
          error={errors.threshold}
        />
      </FormSection>
    </RuleFormLayout>
  );
}
