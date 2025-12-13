/**
 * 热点参数规则表单组件
 * 使用通用表单组件构建
 */

import { Box, Flex, IconButton, Input, NativeSelect, Stack, Table, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { FormInput, FormSelect, FormSwitch } from '@/components/ui/form-field';
import { FormRow, FormSection, RuleFormLayout } from '@/components/ui/rule-form-layout';
import type { ParamFlowItem, ParamFlowRule } from '@/types/rule';

export interface ParamFlowRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: Partial<ParamFlowRule>;
  /** 提交处理 */
  onSubmit: (data: Omit<ParamFlowRule, 'id'>) => Promise<void>;
  /** 取消处理（可选） */
  onCancel?: () => void;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
}

/** 参数类型选项 */
const PARAM_TYPES = [
  { value: 'java.lang.String', label: 'String' },
  { value: 'java.lang.Integer', label: 'int' },
  { value: 'java.lang.Long', label: 'long' },
  { value: 'java.lang.Double', label: 'double' },
  { value: 'java.lang.Float', label: 'float' },
  { value: 'java.lang.Boolean', label: 'boolean' },
];

/** 阈值类型选项 */
const GRADE_OPTIONS = [
  { value: 1, label: 'QPS' },
  { value: 0, label: '线程数' },
];

/** 默认表单值 */
const defaultValues: Omit<ParamFlowRule, 'app' | 'id'> = {
  resource: '',
  paramIdx: undefined as unknown as number, // 强制用户填写
  grade: 1, // QPS模式（必须有值，因为是select下拉框）
  count: undefined as unknown as number, // 强制用户填写
  durationInSec: undefined as unknown as number, // 强制用户填写
  controlBehavior: 0, // 快速失败（必须有值，因为是select下拉框）
  paramFlowItemList: [],
  clusterMode: false,
};

export function ParamFlowRuleForm({
  app,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  backPath,
}: ParamFlowRuleFormProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<Omit<ParamFlowRule, 'id'>>(() => ({
    ...defaultValues,
    ...initialData,
    app,
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 参数例外项状态
  const [newItem, setNewItem] = React.useState<ParamFlowItem>({
    classType: 'java.lang.String',
    object: '',
    count: 0,
  });

  const handleChange = (field: keyof ParamFlowRule, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
    if (!newItem.object.trim()) return;
    setFormData((prev) => ({
      ...prev,
      paramFlowItemList: [...(prev.paramFlowItemList || []), { ...newItem }],
    }));
    setNewItem({ classType: 'java.lang.String', object: '', count: 0 });
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      paramFlowItemList: prev.paramFlowItemList?.filter((_, i) => i !== index) || [],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.resource.trim()) newErrors.resource = '资源名称不能为空';
    if (formData.paramIdx === undefined || formData.paramIdx === null || isNaN(formData.paramIdx))
      newErrors.paramIdx = '参数索引必须填写';
    if (formData.count === undefined || formData.count === null || isNaN(formData.count))
      newErrors.count = '阈值必须填写';
    if (formData.durationInSec === undefined || formData.durationInSec === null || formData.durationInSec <= 0)
      newErrors.durationInSec = '统计窗口必须大于 0';
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
        热点参数规则
      </Text>
      <Text mb={3}>针对特定参数值进行限流，适用于经常访问的热点数据（如热门商品ID、活跃用户ID）。</Text>

      <Text
        fontWeight="medium"
        mb={2}
      >
        参数例外项
      </Text>
      <Text>可为特定参数值设置不同的阈值。例如：VIP用户可设置更高的访问阈值。</Text>
    </>
  );

  return (
    <RuleFormLayout
      title="热点规则"
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      backPath={backPath}
      onSubmit={handleSubmit}
      onCancel={onCancel}
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
        <FormInput
          label="参数索引"
          name="paramIdx"
          required
          type="number"
          value={formData.paramIdx ?? ''}
          onChange={(v) => handleChange('paramIdx', Number(v))}
          min={0}
          placeholder="0"
          error={errors.paramIdx}
          helperText="从 0 开始，表示第几个参数"
        />
        <FormSelect
          label="阈值类型"
          name="grade"
          value={formData.grade}
          onChange={(v) => handleChange('grade', Number(v))}
          options={GRADE_OPTIONS}
        />
      </FormSection>

      <FormSection>
        <FormInput
          label="单机阈值"
          name="count"
          required
          type="number"
          value={formData.count ?? ''}
          onChange={(v) => handleChange('count', Number(v))}
          min={0}
          placeholder="10"
          error={errors.count}
          helperText="每秒最大请求数"
        />
        <FormInput
          label="统计窗口(秒)"
          name="durationInSec"
          required
          type="number"
          value={formData.durationInSec ?? ''}
          onChange={(v) => handleChange('durationInSec', Number(v))}
          min={1}
          placeholder="1"
          error={errors.durationInSec}
          helperText="流控统计的时间窗口"
        />
      </FormSection>

      {/* 集群模式 */}
      <FormRow>
        <FormSwitch
          label="集群模式"
          name="clusterMode"
          checked={formData.clusterMode ?? false}
          onChange={(v) => handleChange('clusterMode', v)}
        />
      </FormRow>

      {/* 参数例外项 */}
      <Box mt={4}>
        <Text
          fontWeight="medium"
          mb={3}
        >
          参数例外项
        </Text>
        <Box
          p={4}
          bg="bg.muted"
          borderRadius="md"
        >
          <Stack gap={3}>
            <Flex gap={2}>
              <NativeSelect.Root flex={1}>
                <NativeSelect.Field
                  value={newItem.classType}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, classType: e.target.value }))}
                >
                  {PARAM_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Input
                flex={2}
                value={newItem.object}
                onChange={(e) => setNewItem((prev) => ({ ...prev, object: e.target.value }))}
                placeholder="参数值"
              />
              <Input
                flex={1}
                type="number"
                value={newItem.count}
                onChange={(e) => setNewItem((prev) => ({ ...prev, count: Number(e.target.value) }))}
                placeholder="阈值"
                min={0}
              />
              <IconButton
                aria-label="添加"
                colorPalette="blue"
                onClick={handleAddItem}
                disabled={!newItem.object.trim()}
              >
                <Icon icon="mdi:plus" />
              </IconButton>
            </Flex>

            {formData.paramFlowItemList && formData.paramFlowItemList.length > 0 && (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>参数类型</Table.ColumnHeader>
                    <Table.ColumnHeader>参数值</Table.ColumnHeader>
                    <Table.ColumnHeader>阈值</Table.ColumnHeader>
                    <Table.ColumnHeader w="60px">操作</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {formData.paramFlowItemList.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        {PARAM_TYPES.find((t) => t.value === item.classType)?.label || item.classType}
                      </Table.Cell>
                      <Table.Cell>{item.object}</Table.Cell>
                      <Table.Cell>{item.count}</Table.Cell>
                      <Table.Cell>
                        <IconButton
                          aria-label="删除"
                          size="xs"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Icon icon="mdi:delete" />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Stack>
        </Box>
      </Box>
    </RuleFormLayout>
  );
}
