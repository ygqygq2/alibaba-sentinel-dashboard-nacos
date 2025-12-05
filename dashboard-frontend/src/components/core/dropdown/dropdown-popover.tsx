import type { SystemStyleObject } from '@chakra-ui/react';
import { Popover } from '@chakra-ui/react';
import * as React from 'react';

import { DropdownContext } from './dropdown-context';

export interface DropdownPopoverProps {
  children?: React.ReactNode;
  /** Width of the popover content */
  width?: string | number;
  /** Height of the popover content */
  height?: string | number;
  /** Animation duration: 'fastest' | 'faster' | 'fast' | 'moderate' | 'slow' | 'slower' | 'slowest' */
  animationDuration?: 'fastest' | 'faster' | 'fast' | 'moderate' | 'slow' | 'slower' | 'slowest';
  /** Placement of the popover */
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';
  /** Gap between trigger and popover in pixels */
  gutter?: number;
  /** Additional styles for the content */
  contentStyles?: SystemStyleObject;
}

export function DropdownPopover({
  children,
  width = 'auto',
  height = 'auto',
  animationDuration = 'slow',
  placement: _placement = 'bottom-start',
  gutter: _gutter = 0,
  contentStyles,
}: DropdownPopoverProps): React.JSX.Element {
  const { onPopoverMouseEnter, onPopoverMouseLeave, isOpen: _isOpen } = React.useContext(DropdownContext);

  return (
    <Popover.Positioner>
      <Popover.Content
        onMouseEnter={onPopoverMouseEnter}
        onMouseLeave={onPopoverMouseLeave}
        width={width}
        height={height}
        animationDuration={animationDuration}
        _focus={{
          outline: 'none',
          boxShadow: 'none',
        }}
        {...contentStyles}
      >
        {children}
      </Popover.Content>
    </Popover.Positioner>
  );
}
