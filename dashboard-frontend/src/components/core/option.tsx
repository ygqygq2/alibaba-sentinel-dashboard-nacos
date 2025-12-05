import { MenuItem } from '@chakra-ui/react';
import * as React from 'react';

export interface OptionProps {
  children: React.ReactNode;
  disabled?: boolean;
  value: string | number;
}

export function Option({ children, value, disabled, ...props }: OptionProps): React.JSX.Element {
  return (
    <MenuItem
      value={String(value)}
      disabled={disabled}
      {...props}
    >
      {children}
    </MenuItem>
  );
}
