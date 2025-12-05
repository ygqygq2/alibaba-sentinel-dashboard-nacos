import { Popover } from '@chakra-ui/react';
import * as React from 'react';

import { DropdownContext } from './dropdown-context';

export interface DropdownProps {
  children: React.ReactNode;
  /** Delay in milliseconds before closing the dropdown after mouse leaves */
  delay?: number;
  /** Controlled open state */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
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
}

export function Dropdown({
  children,
  delay = 150,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  gutter = 0,
}: DropdownProps): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const cleanupRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // 判断是否受控
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
    };
  }, []);

  const handleTriggerMouseEnter = React.useCallback(
    (_event: React.MouseEvent<HTMLElement>) => {
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
      setIsOpen(true);
    },
    [setIsOpen]
  );

  const handleTriggerMouseLeave = React.useCallback(
    (_: React.MouseEvent<HTMLElement>) => {
      cleanupRef.current = setTimeout(() => {
        setIsOpen(false);
      }, delay);
    },
    [delay, setIsOpen]
  );

  const handleTriggerKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [setIsOpen]
  );

  const handlePopoverMouseEnter = React.useCallback((_: React.MouseEvent<HTMLElement>) => {
    if (cleanupRef.current) {
      clearTimeout(cleanupRef.current);
    }
  }, []);

  const handlePopoverMouseLeave = React.useCallback(
    (_: React.MouseEvent<HTMLElement>) => {
      cleanupRef.current = setTimeout(() => {
        setIsOpen(false);
      }, delay);
    },
    [delay, setIsOpen]
  );

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <DropdownContext.Provider
      value={{
        onPopoverMouseEnter: handlePopoverMouseEnter,
        onPopoverMouseLeave: handlePopoverMouseLeave,
        onClose: handleClose,
        onTriggerMouseEnter: handleTriggerMouseEnter,
        onTriggerMouseLeave: handleTriggerMouseLeave,
        onTriggerKeyUp: handleTriggerKeyUp,
        isOpen,
      }}
    >
      <Popover.Root
        open={isOpen}
        positioning={{
          placement,
          gutter,
          strategy: 'fixed',
        }}
      >
        {children}
      </Popover.Root>
    </DropdownContext.Provider>
  );
}
