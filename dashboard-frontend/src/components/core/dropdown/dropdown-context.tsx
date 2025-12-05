import * as React from 'react';

function noop(..._: unknown[]): void {
  // Do nothing
}

export interface ContextValue {
  onPopoverMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  onPopoverMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
  onTriggerMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  onTriggerMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  onTriggerKeyUp: (event: React.KeyboardEvent<HTMLElement>) => void;
  isOpen: boolean;
}

export const DropdownContext = React.createContext<ContextValue>({
  onPopoverMouseEnter: noop,
  onPopoverMouseLeave: noop,
  onClose: noop,
  onTriggerMouseEnter: noop,
  onTriggerMouseLeave: noop,
  onTriggerKeyUp: noop,
  isOpen: false,
});

export function useDropdownContext(): ContextValue {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext must be used within a Dropdown');
  }
  return context;
}
