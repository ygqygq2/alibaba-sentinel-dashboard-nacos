/**
 * 通用规则表单布局组件
 * 统一所有规则表单的布局结构
 */

import { Box, Button, Card, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export interface RuleFormLayoutProps {
  /** 表单标题 */
  title: string;
  /** 是否编辑模式 */
  isEditMode?: boolean;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 返回路径 */
  backPath: string;
  /** 表单提交处理 */
  onSubmit: (e: React.FormEvent) => void;
  /** 取消按钮处理（可选，默认使用 navigate(backPath)） */
  onCancel?: () => void;
  /** 表单内容（分组） */
  children: React.ReactNode;
  /** 帮助面板内容（可选） */
  helpContent?: React.ReactNode;
}

/**
 * 规则表单布局组件
 * 提供统一的卡片布局、标题、提交按钮等
 */
export function RuleFormLayout({
  title,
  isEditMode,
  isSubmitting,
  backPath,
  onSubmit,
  onCancel,
  children,
  helpContent,
}: RuleFormLayoutProps): React.JSX.Element {
  const navigate = useNavigate();

  const formTitle = isEditMode ? `编辑${title}` : `新增${title}`;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(backPath);
    }
  };

  const formContent = (
    <Card.Root>
      <Card.Header pb={2}>
        <Heading size="md">{formTitle}</Heading>
      </Card.Header>
      <Card.Body pt={2}>
        <form onSubmit={onSubmit}>
          {children}

          {/* 操作按钮 */}
          <Flex
            justify="flex-end"
            gap={3}
            mt={6}
          >
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
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

  // 如果有帮助内容，使用左右分栏布局
  if (helpContent) {
    return (
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 320px' }}
        gap={6}
      >
        {formContent}
        <Box display={{ base: 'none', lg: 'block' }}>
          <Card.Root
            position="sticky"
            top="80px"
          >
            <Card.Header pb={2}>
              <Heading size="sm">帮助说明</Heading>
            </Card.Header>
            <Card.Body pt={2}>
              <Text
                fontSize="sm"
                color="fg.muted"
              >
                {helpContent}
              </Text>
            </Card.Body>
          </Card.Root>
        </Box>
      </Grid>
    );
  }

  return formContent;
}

export interface FormSectionProps {
  /** 分组标题（可选） */
  title?: string;
  /** 列数配置 */
  columns?: { base?: number; md?: number; lg?: number };
  /** 内容 */
  children: React.ReactNode;
  /** 是否显示（条件渲染） */
  show?: boolean;
}

/**
 * 表单分组组件
 * 用于将表单字段分组，支持 Grid 布局
 */
export function FormSection({
  title,
  columns = { base: 1, md: 3 },
  children,
  show = true,
}: FormSectionProps): React.JSX.Element | null {
  if (!show) return null;

  const templateColumns = {
    base: `repeat(${columns.base ?? 1}, 1fr)`,
    md: `repeat(${columns.md ?? 3}, 1fr)`,
    lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
  };

  return (
    <Box mt={title ? 4 : 0}>
      {title && (
        <Text
          fontWeight="medium"
          mb={3}
          color="gray.600"
        >
          {title}
        </Text>
      )}
      <Grid
        templateColumns={templateColumns}
        gap={4}
        alignItems="start"
      >
        {children}
      </Grid>
    </Box>
  );
}

export interface FormRowProps {
  /** 内容 */
  children: React.ReactNode;
  /** 是否显示（条件渲染） */
  show?: boolean;
  /** 对齐方式 */
  align?: 'start' | 'center' | 'end';
  /** 间距 */
  gap?: number;
}

/**
 * 表单行组件
 * 用于水平排列表单元素
 */
export function FormRow({ children, show = true, align = 'center', gap = 3 }: FormRowProps): React.JSX.Element | null {
  if (!show) return null;

  return (
    <Flex
      mt={4}
      alignItems={align}
      gap={gap}
    >
      {children}
    </Flex>
  );
}
