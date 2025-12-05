/**
 * 降级规则表单组件
 */

import { Box, Button, Card, Field, Flex, Heading, Input, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

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

/** 默认表单值 */
const defaultValues: Omit<DegradeRule, 'app' | 'id'> = {
  resource: '',
  grade: 0, // 慢调用比例
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
  const navigate = useNavigate();
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

    if (!formData.resource.trim()) {
      newErrors.resource = '资源名称不能为空';
    }

    if (formData.count < 0) {
      newErrors.count = '阈值不能为负数';
    }

    if (formData.timeWindow <= 0) {
      newErrors.timeWindow = '时间窗口必须大于 0';
    }

    if (formData.minRequestAmount <= 0) {
      newErrors.minRequestAmount = '最小请求数必须大于 0';
    }

    // 慢调用比例模式校验
    if (formData.grade === 0) {
      if (!formData.slowRatioThreshold || formData.slowRatioThreshold < 0 || formData.slowRatioThreshold > 1) {
        newErrors.slowRatioThreshold = '慢调用比例阈值必须在 0-1 之间';
      }
      if (!formData.statIntervalMs || formData.statIntervalMs <= 0) {
        newErrors.statIntervalMs = '最大 RT 必须大于 0';
      }
    }

    // 异常比例模式校验
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
      navigate(backPath);
    } catch (err) {
      console.error('提交失败:', err);
    }
  };

  const isEditMode = !!initialData?.id;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{isEditMode ? '编辑降级规则' : '新增降级规则'}</Heading>
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

            {/* 降级策略 */}
            <Field.Root>
              <Field.Label>降级策略</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', Number(e.target.value))}
                >
                  <option value={0}>慢调用比例</option>
                  <option value={1}>异常比例</option>
                  <option value={2}>异常数</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

            {/* 慢调用比例特有字段 */}
            {formData.grade === 0 && (
              <>
                <Field.Root invalid={!!errors.statIntervalMs}>
                  <Field.Label>最大 RT（毫秒） *</Field.Label>
                  <Input
                    type="number"
                    value={formData.statIntervalMs || ''}
                    onChange={(e) => handleChange('statIntervalMs', Number(e.target.value))}
                    min={1}
                    placeholder="1000"
                  />
                  <Field.HelperText>超过此响应时间视为慢调用</Field.HelperText>
                  {errors.statIntervalMs && <Field.ErrorText>{errors.statIntervalMs}</Field.ErrorText>}
                </Field.Root>

                <Field.Root invalid={!!errors.slowRatioThreshold}>
                  <Field.Label>比例阈值 *</Field.Label>
                  <Input
                    type="number"
                    value={formData.slowRatioThreshold ?? ''}
                    onChange={(e) => handleChange('slowRatioThreshold', Number(e.target.value))}
                    min={0}
                    max={1}
                    step={0.1}
                    placeholder="0.5"
                  />
                  <Field.HelperText>慢调用比例达到此阈值触发降级（0-1）</Field.HelperText>
                  {errors.slowRatioThreshold && <Field.ErrorText>{errors.slowRatioThreshold}</Field.ErrorText>}
                </Field.Root>
              </>
            )}

            {/* 异常比例/异常数阈值 */}
            <Field.Root invalid={!!errors.count}>
              <Field.Label>
                {formData.grade === 0 ? '（此字段不生效）' : formData.grade === 1 ? '异常比例阈值 *' : '异常数阈值 *'}
              </Field.Label>
              <Input
                type="number"
                value={formData.count}
                onChange={(e) => handleChange('count', Number(e.target.value))}
                min={0}
                max={formData.grade === 1 ? 1 : undefined}
                step={formData.grade === 1 ? 0.1 : 1}
                disabled={formData.grade === 0}
              />
              {formData.grade === 1 && <Field.HelperText>异常比例 0-1 之间</Field.HelperText>}
              {errors.count && <Field.ErrorText>{errors.count}</Field.ErrorText>}
            </Field.Root>

            {/* 时间窗口 */}
            <Field.Root invalid={!!errors.timeWindow}>
              <Field.Label>熔断时长（秒） *</Field.Label>
              <Input
                type="number"
                value={formData.timeWindow}
                onChange={(e) => handleChange('timeWindow', Number(e.target.value))}
                min={1}
              />
              <Field.HelperText>降级持续时间，到期后进入半开状态</Field.HelperText>
              {errors.timeWindow && <Field.ErrorText>{errors.timeWindow}</Field.ErrorText>}
            </Field.Root>

            {/* 最小请求数 */}
            <Field.Root invalid={!!errors.minRequestAmount}>
              <Field.Label>最小请求数 *</Field.Label>
              <Input
                type="number"
                value={formData.minRequestAmount}
                onChange={(e) => handleChange('minRequestAmount', Number(e.target.value))}
                min={1}
              />
              <Field.HelperText>触发降级的最小请求数量</Field.HelperText>
              {errors.minRequestAmount && <Field.ErrorText>{errors.minRequestAmount}</Field.ErrorText>}
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
