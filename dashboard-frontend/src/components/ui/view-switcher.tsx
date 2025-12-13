/**
 * 视图切换按钮组
 * 统一的视图模式切换组件
 */

import { Button, ButtonGroup } from '@chakra-ui/react';
import * as React from 'react';

export interface ViewSwitcherOption {
  /** 视图值 */
  value: string;
  /** 显示标签 */
  label: string;
}

export interface ViewSwitcherProps {
  /** 当前视图值 */
  value: string;
  /** 视图选项 */
  options: ViewSwitcherOption[];
  /** 切换处理函数 */
  onChange: (value: string) => void;
  /** 按钮尺寸 */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * 视图切换按钮组
 * 使用默认主题色（实时监控的颜色），attached 效果（簇点链路的效果）
 */
export function ViewSwitcher({ value, options, onChange, size = 'sm' }: ViewSwitcherProps): React.JSX.Element {
  return (
    <ButtonGroup
      size={size}
      attached
    >
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'solid' : 'outline'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
