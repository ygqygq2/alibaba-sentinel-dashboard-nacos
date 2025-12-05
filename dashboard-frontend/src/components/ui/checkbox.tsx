'use client';

import { Checkbox as ChakraCheckbox } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface CheckboxProps {
  children?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox(props, ref) {
  const { children, onChange, checked, defaultChecked, disabled } = props;

  return (
    <ChakraCheckbox.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={(e) => {
        if (onChange && typeof e.checked === 'boolean') {
          onChange(e.checked);
        }
      }}
    >
      <ChakraCheckbox.Control>
        <ChakraCheckbox.Indicator />
      </ChakraCheckbox.Control>
      {children ? <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label> : null}
    </ChakraCheckbox.Root>
  );
});
