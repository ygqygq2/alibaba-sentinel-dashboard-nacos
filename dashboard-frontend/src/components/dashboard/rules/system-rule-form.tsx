/**
 * 系统规则表单组件
 */

import { Button, Card, Field, Flex, Heading, Input, NativeSelect, Stack, Switch, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [ruleType, setRuleType] = React.useState<RuleType>(() => (initialData ? getRuleType(initialData) : 'qps'));
  const [threshold, setThreshold] = React.useState<number>(() =>
    initialData ? getThresholdValue(initialData, getRuleType(initialData)) : 0
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (threshold < 0) {
      newErrors.threshold = '阈值不能为负数';
    }

    if (ruleType === 'cpu' && threshold > 1) {
      newErrors.threshold = 'CPU 使用率必须在 0-1 之间';
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
      navigate(backPath);
    } catch (err) {
      console.error('提交失败:', err);
    }
  };

  const isEditMode = !!initialData?.id;
  const typeInfo = ruleTypeMap[ruleType];

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{isEditMode ? '编辑系统规则' : '新增系统规则'}</Heading>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            {/* 阈值类型 */}
            <Field.Root>
              <Field.Label>阈值类型</Field.Label>
              <NativeSelect.Root disabled={isEditMode}>
                <NativeSelect.Field
                  value={ruleType}
                  onChange={(e) => {
                    setRuleType(e.target.value as RuleType);
                    setThreshold(0);
                  }}
                >
                  {Object.entries(ruleTypeMap).map(([key, info]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {info.label}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
              <Field.HelperText>{typeInfo.description}</Field.HelperText>
            </Field.Root>

            {/* 阈值 */}
            <Field.Root invalid={!!errors.threshold}>
              <Field.Label>阈值 {typeInfo.unit && `(${typeInfo.unit})`} *</Field.Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => {
                  setThreshold(Number(e.target.value));
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
                step={ruleType === 'cpu' ? 0.01 : 1}
              />
              {errors.threshold && <Field.ErrorText>{errors.threshold}</Field.ErrorText>}
            </Field.Root>
          </Stack>

          {/* 操作按钮 */}
          <Flex
            mt={6}
            gap={3}
            justifyContent="flex-end"
          >
            <Button
              variant="outline"
              onClick={() => navigate(backPath)}
            >
              取消
            </Button>
            <Button
              type="submit"
              colorPalette="blue"
              loading={isSubmitting}
            >
              <Icon icon="mdi:check" />
              {isEditMode ? '保存' : '创建'}
            </Button>
          </Flex>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
