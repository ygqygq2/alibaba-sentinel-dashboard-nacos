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
        borderColor="blue.600"
        color="blue.700"
        _hover={{
          bg: 'blue.50',
          borderColor: 'blue.700',
        }}
        _dark={{
          borderColor: 'blue.500',
          color: 'blue.300',
          _hover: {
            bg: 'blue.900',
            borderColor: 'blue.400',
          },
        }}
      >
        <Icon icon="mdi:plus" />
        流控
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="yellow"
        onClick={handleAddDegrade}
        borderColor="yellow.600"
        color="yellow.700"
        _hover={{
          bg: 'yellow.50',
          borderColor: 'yellow.700',
        }}
        _dark={{
          borderColor: 'yellow.500',
          color: 'yellow.300',
          _hover: {
            bg: 'yellow.900',
            borderColor: 'yellow.400',
          },
        }}
      >
        <Icon icon="mdi:plus" />
        熔断
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="pink"
        onClick={handleAddParamFlow}
        borderColor="pink.600"
        color="pink.700"
        _hover={{
          bg: 'pink.50',
          borderColor: 'pink.700',
        }}
        _dark={{
          borderColor: 'pink.500',
          color: 'pink.300',
          _hover: {
            bg: 'pink.900',
            borderColor: 'pink.400',
          },
        }}
      >
        <Icon icon="mdi:plus" />
        热点
      </Button>
      <Button
        size={size}
        variant="outline"
        colorPalette="purple"
        onClick={handleAddAuthority}
        borderColor="purple.600"
        color="purple.700"
        _hover={{
          bg: 'purple.50',
          borderColor: 'purple.700',
        }}
        _dark={{
          borderColor: 'purple.500',
          color: 'purple.300',
          _hover: {
            bg: 'purple.900',
            borderColor: 'purple.400',
          },
        }}
      >
        <Icon icon="mdi:plus" />
        授权
      </Button>
    </HStack>
  );
}
