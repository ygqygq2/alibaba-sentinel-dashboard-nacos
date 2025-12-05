import { Popover } from '@chakra-ui/react';
import * as React from 'react';

import { useDropdownContext } from './dropdown-context';

export interface DropdownTriggerProps {
  children: React.ReactElement;
}

export function DropdownTrigger({ children }: DropdownTriggerProps): React.JSX.Element {
  const { onTriggerKeyUp, onTriggerMouseEnter, onTriggerMouseLeave } = useDropdownContext();

  // 使用类型断言来处理 children
  const child = React.Children.only(children) as React.ReactElement<any>;

  const enhancedChild = React.cloneElement(child, {
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      onTriggerKeyUp(e);
      child.props.onKeyUp?.(e);
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      onTriggerMouseEnter(e);
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      onTriggerMouseLeave(e);
      child.props.onMouseLeave?.(e);
    },
  });

  return <Popover.Trigger asChild>{enhancedChild}</Popover.Trigger>;
}
