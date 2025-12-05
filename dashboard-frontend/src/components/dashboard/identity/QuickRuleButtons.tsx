/**
 * 快速添加规则按钮组
 */

import { Button, HStack } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { paths } from '@/paths';

export interface QuickRuleButtonsProps {
  /** 应用名称 */
  app: string;
  /** 资源名称 */
  resource: string;
  /** 按钮尺寸 */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * 快速添加规则按钮组
 * 支持快速跳转到流控、降级、热点、授权规则创建页面
 */
export function QuickRuleButtons({ app, resource, size = 'xs' }: QuickRuleButtonsProps): React.JSX.Element {
  const navigate = useNavigate();

  const handleAddFlow = () => {
    navigate(paths.dashboard.flow.create(app), {
      state: { resource },
    });
  };

  const handleAddDegrade = () => {
    navigate(paths.dashboard.degrade.create(app), {
      state: { resource },
    });
  };

  const handleAddParamFlow = () => {
    navigate(paths.dashboard.paramFlow.create(app), {
      state: { resource },
    });
  };

  const handleAddAuthority = () => {
    navigate(paths.dashboard.authority.create(app), {
      state: { resource },
    });
  };

  return (
    <HStack gap={1}>
      <Button
        size={size}
        variant="outline"
        colorPalette="blue"
        onClick={handleAddFlow}
      >
        <Icon icon="mdi:plus" />
        流控
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="orange"
        onClick={handleAddDegrade}
      >
        <Icon icon="mdi:plus" />
        降级
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="red"
        onClick={handleAddParamFlow}
      >
        <Icon icon="mdi:plus" />
        热点
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="purple"
        onClick={handleAddAuthority}
      >
        <Icon icon="mdi:plus" />
        授权
      </Button>
    </HStack>
  );
}
