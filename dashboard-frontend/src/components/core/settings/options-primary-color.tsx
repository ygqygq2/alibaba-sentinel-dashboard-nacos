'use client';

import { Box, Field, Stack } from '@chakra-ui/react';
import * as React from 'react';

import type { PrimaryColor } from '@/styles/theme/types';

import { Option } from './option';

export interface OptionsPrimaryColorProps {
  onChange?: (value: PrimaryColor) => void;
  value?: PrimaryColor;
}

export function OptionsPrimaryColor({ onChange, value }: OptionsPrimaryColorProps): React.JSX.Element {
  return (
    <Field.Root>
      <Stack gap={3}>
        <Field.Label
          fontSize="sm"
          fontWeight="medium"
        >
          Primary color
        </Field.Label>
        <Stack
          direction="row"
          gap={2}
          style={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {(
            [
              { label: 'Chateau Green', value: 'chateauGreen', color: '#16b364', palette: 'green' },
              { label: 'Neon Blue', value: 'neonBlue', color: '#635bff', palette: 'cyan' },
              { label: 'Royal Blue', value: 'royalBlue', color: '#5265ff', palette: 'blue' },
              { label: 'Tomato Orange', value: 'tomatoOrange', color: '#ff6c47', palette: 'orange' },
            ] satisfies { label: string; value: PrimaryColor; color: string; palette: string }[]
          ).map((option) => (
            <Box
              key={option.value}
              colorPalette={option.palette}
            >
              <Option
                icon={
                  <Box
                    style={{
                      backgroundColor: option.color,
                      borderRadius: '50%',
                      flex: '0 0 auto',
                      height: '20px',
                      width: '20px',
                    }}
                  />
                }
                label={option.label}
                onClick={() => {
                  onChange?.(option.value);
                }}
                selected={option.value === value}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Field.Root>
  );
}
