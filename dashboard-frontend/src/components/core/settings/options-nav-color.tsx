'use client';

import { Box, Field, Stack } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { Tooltip } from '@/components/ui/tooltip';
import { useSettings } from '@/hooks/use-settings';
import type { NavColor } from '@/types/settings';

import { Option } from './option';

export interface OptionsNavColorProps {
  onChange?: (value: NavColor) => void;
  value?: NavColor;
}

export function OptionsNavColor({ onChange, value }: OptionsNavColorProps): React.JSX.Element {
  const { settings } = useSettings();

  return (
    <Field.Root>
      <Stack gap={3}>
        <Stack
          direction="row"
          gap={1}
          style={{ alignItems: 'center' }}
        >
          <Field.Label
            fontSize="sm"
            fontWeight="medium"
          >
            Nav color
          </Field.Label>
          <Tooltip content="Dashboard only">
            <Icon
              icon="ph:info"
              color="var(--chakra-colors-gray-500)"
              fontSize="var(--icon-fontSize-md)"
            />
          </Tooltip>
        </Stack>
        <Box colorPalette={settings.primaryColor}>
          <Stack
            direction="row"
            gap={2}
            style={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            {(
              [
                { label: 'Blend-in', value: 'blend_in' },
                { label: 'Discrete', value: 'discrete' },
                { label: 'Evident', value: 'evident' },
              ] as { label: string; value: NavColor }[]
            ).map((option) => (
              <Option
                key={option.label}
                label={option.label}
                onClick={() => {
                  onChange?.(option.value);
                }}
                selected={option.value === value}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Field.Root>
  );
}
