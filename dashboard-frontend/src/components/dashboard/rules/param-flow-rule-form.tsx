/**
 * 热点参数规则表单组件
 */

import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Switch,
  Table,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import type { ParamFlowItem, ParamFlowRule } from '@/types/rule';

export interface ParamFlowRuleFormProps {
  /** 应用名称 */
  app: string;
  /** 初始值（编辑模式） */
  initialData?: ParamFlowRule;
  /** 提交处理 */
  onSubmit: (data: Omit<ParamFlowRule, 'id'>) => Promise<void>;
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

/** 默认表单值 */
const defaultValues: Omit<ParamFlowRule, 'app' | 'id'> = {
  resource: '',
  paramIdx: 0,
  grade: 1, // QPS
  count: 0,
  durationInSec: 1,
  controlBehavior: 0, // 快速失败
  paramFlowItemList: [],
  clusterMode: false,
};

export function ParamFlowRuleForm({
  app,
  initialData,
  onSubmit,
  isSubmitting,
  backPath,
}: ParamFlowRuleFormProps): React.JSX.Element {
  const navigate = useNavigate();
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

    if (!formData.resource.trim()) {
      newErrors.resource = '资源名称不能为空';
    }

    if (formData.paramIdx < 0) {
      newErrors.paramIdx = '参数索引不能为负数';
    }

    if (formData.count < 0) {
      newErrors.count = '阈值不能为负数';
    }

    if (formData.durationInSec <= 0) {
      newErrors.durationInSec = '统计窗口必须大于 0';
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
        <Heading size="md">{isEditMode ? '编辑热点规则' : '新增热点规则'}</Heading>
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

            {/* 参数索引 */}
            <Field.Root invalid={!!errors.paramIdx}>
              <Field.Label>参数索引 *</Field.Label>
              <Input
                type="number"
                value={formData.paramIdx}
                onChange={(e) => handleChange('paramIdx', Number(e.target.value))}
                min={0}
              />
              <Field.HelperText>从 0 开始，表示第几个参数</Field.HelperText>
              {errors.paramIdx && <Field.ErrorText>{errors.paramIdx}</Field.ErrorText>}
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

            {/* 单机阈值 */}
            <Field.Root invalid={!!errors.count}>
              <Field.Label>单机阈值 *</Field.Label>
              <Input
                type="number"
                value={formData.count}
                onChange={(e) => handleChange('count', Number(e.target.value))}
                min={0}
              />
              {errors.count && <Field.ErrorText>{errors.count}</Field.ErrorText>}
            </Field.Root>

            {/* 统计窗口时长 */}
            <Field.Root invalid={!!errors.durationInSec}>
              <Field.Label>统计窗口（秒） *</Field.Label>
              <Input
                type="number"
                value={formData.durationInSec}
                onChange={(e) => handleChange('durationInSec', Number(e.target.value))}
                min={1}
              />
              {errors.durationInSec && <Field.ErrorText>{errors.durationInSec}</Field.ErrorText>}
            </Field.Root>

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

            {/* 参数例外项 */}
            <Box>
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
