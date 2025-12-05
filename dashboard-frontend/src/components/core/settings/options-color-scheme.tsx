'use client';

import { Box, Field, Stack } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import type { ColorMode } from '@/styles/theme/types';

import { Option } from './option';

export interface OptionsColorSchemeProps {
  onChange?: (value: ColorMode) => void;
  value?: ColorMode;
}

export function OptionsColorScheme({ onChange, value }: OptionsColorSchemeProps): React.JSX.Element {
  return (
    <Field.Root>
      <Stack gap={3}>
        <Field.Label
          fontSize="sm"
          fontWeight="medium"
        >
          Color scheme
        </Field.Label>
        <Stack
          direction="row"
          gap={2}
          style={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {(
            [
              { label: 'Light', value: 'light', icon: <Icon icon="material-symbols:light-mode" /> },
              { label: 'Dark', value: 'dark', icon: <Icon icon="material-symbols:dark-mode" /> },
              { label: 'System', value: 'system', icon: <Icon icon="material-symbols:computer" /> },
            ] satisfies { label: string; value: string; icon: React.ReactNode }[]
          ).map((option) => (
            <Option
              icon={option.icon}
              key={option.value}
              label={option.label}
              onClick={() => {
                onChange?.(option.value as ColorMode);
              }}
              selected={option.value === value}
            />
          ))}
        </Stack>
      </Stack>
    </Field.Root>
  );
}
