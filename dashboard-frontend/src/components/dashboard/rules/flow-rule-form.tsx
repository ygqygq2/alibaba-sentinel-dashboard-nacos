/**
 * 流控规则表单组件
 */

import { Box, Button, Card, Field, Flex, Heading, Input, NativeSelect, Stack, Switch, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

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

/** 默认表单值 */
const defaultValues: Omit<FlowRuleBase, 'app'> = {
  resource: '',
  grade: 1, // QPS
  count: 0,
  strategy: 0, // 直接
  controlBehavior: 0, // 快速失败
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
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<FlowRuleBase>(() => ({
    ...defaultValues,
    ...initialData,
    app,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof FlowRuleBase, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
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

    if (!formData.resource.trim()) {
      newErrors.resource = '资源名称不能为空';
    }

    if (formData.count < 0) {
      newErrors.count = '阈值不能为负数';
    }

    if (formData.strategy === 1 && !formData.refResource?.trim()) {
      newErrors.refResource = '关联模式下必须填写关联资源';
    }

    if (formData.controlBehavior === 1 && (!formData.warmUpPeriodSec || formData.warmUpPeriodSec <= 0)) {
      newErrors.warmUpPeriodSec = 'Warm Up 模式下必须设置预热时长';
    }

    if (formData.controlBehavior === 2 && (!formData.maxQueueingTimeMs || formData.maxQueueingTimeMs <= 0)) {
      newErrors.maxQueueingTimeMs = '排队等待模式下必须设置超时时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      navigate(backPath);
    } catch (err) {
      console.error('提交失败:', err);
    }
  };

  const isEditMode = !!initialData?.id;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{isEditMode ? '编辑流控规则' : '新增流控规则'}</Heading>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            {/* 资源名称 */}
            <Field.Root invalid={!!errors.resource}>
              <Field.Label>资源名称 *</Field.Label>
              <Input
                value={formData.resource}
                onChange={(e) => handleChange('resource', e.target.value)}
                placeholder="请输入资源名称"
                disabled={isEditMode}
              />
              {errors.resource && <Field.ErrorText>{errors.resource}</Field.ErrorText>}
            </Field.Root>

            {/* 针对来源 */}
            <Field.Root>
              <Field.Label>针对来源</Field.Label>
              <Input
                value={formData.limitApp}
                onChange={(e) => handleChange('limitApp', e.target.value)}
                placeholder="default 表示不区分来源"
              />
              <Field.HelperText>可填写应用名称，default 表示不区分来源</Field.HelperText>
            </Field.Root>

            {/* 阈值类型 */}
            <Field.Root>
              <Field.Label>阈值类型</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', Number(e.target.value))}
                >
                  <option value={1}>QPS</option>
                  <option value={0}>线程数</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

            {/* 阈值 */}
            <Field.Root invalid={!!errors.count}>
              <Field.Label>阈值 *</Field.Label>
              <Input
                type="number"
                value={formData.count}
                onChange={(e) => handleChange('count', Number(e.target.value))}
                min={0}
              />
              {errors.count && <Field.ErrorText>{errors.count}</Field.ErrorText>}
            </Field.Root>

            {/* 流控模式 */}
            <Field.Root>
              <Field.Label>流控模式</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.strategy}
                  onChange={(e) => handleChange('strategy', Number(e.target.value))}
                >
                  <option value={0}>直接</option>
                  <option value={1}>关联</option>
                  <option value={2}>链路</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

            {/* 关联资源（仅关联模式显示） */}
            {formData.strategy === 1 && (
              <Field.Root invalid={!!errors.refResource}>
                <Field.Label>关联资源 *</Field.Label>
                <Input
                  value={formData.refResource || ''}
                  onChange={(e) => handleChange('refResource', e.target.value)}
                  placeholder="请输入关联资源名称"
                />
                {errors.refResource && <Field.ErrorText>{errors.refResource}</Field.ErrorText>}
              </Field.Root>
            )}

            {/* 流控效果 */}
            <Field.Root>
              <Field.Label>流控效果</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.controlBehavior}
                  onChange={(e) => handleChange('controlBehavior', Number(e.target.value))}
                >
                  <option value={0}>快速失败</option>
                  <option value={1}>Warm Up</option>
                  <option value={2}>排队等待</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

            {/* Warm Up 预热时长 */}
            {formData.controlBehavior === 1 && (
              <Field.Root invalid={!!errors.warmUpPeriodSec}>
                <Field.Label>预热时长（秒） *</Field.Label>
                <Input
                  type="number"
                  value={formData.warmUpPeriodSec || ''}
                  onChange={(e) => handleChange('warmUpPeriodSec', Number(e.target.value))}
                  min={1}
                  placeholder="10"
                />
                {errors.warmUpPeriodSec && <Field.ErrorText>{errors.warmUpPeriodSec}</Field.ErrorText>}
              </Field.Root>
            )}

            {/* 排队等待超时时间 */}
            {formData.controlBehavior === 2 && (
              <Field.Root invalid={!!errors.maxQueueingTimeMs}>
                <Field.Label>超时时间（毫秒） *</Field.Label>
                <Input
                  type="number"
                  value={formData.maxQueueingTimeMs || ''}
                  onChange={(e) => handleChange('maxQueueingTimeMs', Number(e.target.value))}
                  min={1}
                  placeholder="500"
                />
                {errors.maxQueueingTimeMs && <Field.ErrorText>{errors.maxQueueingTimeMs}</Field.ErrorText>}
              </Field.Root>
            )}

            {/* 集群模式 */}
            <Field.Root>
              <Flex
                alignItems="center"
                gap={2}
              >
                <Field.Label mb={0}>集群模式</Field.Label>
                <Switch.Root
                  checked={formData.clusterMode}
                  onCheckedChange={(e) => handleChange('clusterMode', e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </Flex>
            </Field.Root>

            {/* 集群配置 */}
            {formData.clusterMode && (
              <Box
                p={4}
                bg="bg.muted"
                borderRadius="md"
              >
                <Text
                  fontWeight="medium"
                  mb={3}
                >
                  集群配置
                </Text>
                <Stack gap={3}>
                  <Field.Root>
                    <Field.Label>阈值模式</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={formData.clusterConfig?.thresholdType ?? 0}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            clusterConfig: {
                              ...prev.clusterConfig,
                              thresholdType: Number(e.target.value),
                            },
                          }))
                        }
                      >
                        <option value={0}>单机均摊</option>
                        <option value={1}>总体阈值</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Flex
                      alignItems="center"
                      gap={2}
                    >
                      <Field.Label mb={0}>失败退化到本地</Field.Label>
                      <Switch.Root
                        checked={formData.clusterConfig?.fallbackToLocalWhenFail ?? true}
                        onCheckedChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            clusterConfig: {
                              ...prev.clusterConfig,
                              thresholdType: prev.clusterConfig?.thresholdType ?? 0,
                              fallbackToLocalWhenFail: e.checked,
                            },
                          }))
                        }
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </Flex>
                  </Field.Root>
                </Stack>
              </Box>
            )}
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
