'use client';

import { Box, Field, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { Tooltip } from '@/components/ui/tooltip';
import { useSettings } from '@/hooks/use-settings';
import type { Layout } from '@/types/settings';

export interface OptionsLayoutProps {
  onChange?: (value: Layout) => void;
  value?: Layout;
}

export function OptionsLayout({ onChange, value }: OptionsLayoutProps): React.JSX.Element {
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
            Layout
          </Field.Label>
          <Tooltip content="Dashboard only">
            <Icon
              icon="ph:info"
              color="var(--chakra-colors-gray-500)"
              fontSize="var(--icon-fontSize-md)"
            />
          </Tooltip>
        </Stack>
        <Box
          colorPalette={settings.primaryColor}
          style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(0, 140px))' }}
        >
          {(
            [
              { label: 'Vertical', value: 'vertical', icon: <VerticalIcon /> },
              { label: 'Horizontal', value: 'horizontal', icon: <HorizontalIcon /> },
            ] satisfies { label: string; value: Layout; icon: React.ReactElement }[]
          ).map((option) => (
            <Stack
              key={option.value}
              gap={2}
            >
              <Box
                onClick={() => {
                  onChange?.(option.value);
                }}
                role="button"
                style={{
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  height: '88px',
                  position: 'relative',
                  outline: option.value === value ? '2.5px solid var(--chakra-colors-color-palette-solid)' : 'none',
                  transition: 'all 0.2s',
                }}
                tabIndex={0}
                _hover={{
                  outline:
                    option.value === value
                      ? '2.5px solid var(--chakra-colors-color-palette-solid)'
                      : '2px solid var(--chakra-colors-gray-300)',
                }}
              >
                {option.icon}
              </Box>
              <Text
                fontSize="sm"
                style={{ textAlign: 'center' }}
              >
                {option.label}
              </Text>
            </Stack>
          ))}
        </Box>
      </Stack>
    </Field.Root>
  );
}

function VerticalIcon(): React.JSX.Element {
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="inherit"
      display="flex"
      flex="1 1 auto"
    >
      <Box
        borderRight="1px dashed"
        borderColor="gray.200"
        px={1}
        py={0.5}
      >
        <Stack gap={1}>
          <Box
            bgColor="colorPalette.solid"
            borderRadius="2px"
            height="4px"
            width="26px"
          />
          <Box
            bgColor="var(--chakra-colors-gray-700)"
            borderRadius="2px"
            height="4px"
            width="26px"
          />
          <Box
            bgColor="var(--chakra-colors-gray-700)"
            borderRadius="2px"
            height="4px"
            width="26px"
          />
        </Stack>
      </Box>
      <Box
        display="flex"
        flex="1 1 auto"
        p={1}
      >
        <Box
          bgColor="var(--chakra-colors-gray-800)"
          border="1px dashed"
          borderColor="var(--chakra-colors-gray-200)"
          borderRadius={1}
          flex="1 1 auto"
        />
      </Box>
    </Box>
  );
}

function HorizontalIcon(): React.JSX.Element {
  return (
    <Box
      border="1px"
      borderColor="var(--chakra-colors-gray-200)"
      borderRadius="inherit"
      display="flex"
      flex="1 1 auto"
      flexDirection="column"
    >
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        borderBottom="1px dashed var(--chakra-colors-gray-200)"
        px={1}
        py="4px"
      >
        <Box
          bgColor="colorPalette.solid"
          borderRadius="2px"
          height="4px"
          width="16px"
        />
        <Box
          bgColor="var(--chakra-colors-gray-700)"
          borderRadius="2px"
          height="4px"
          width="16px"
        />
        <Box
          bgColor="var(--chakra-colors-gray-700)"
          borderRadius="2px"
          height="4px"
          width="16px"
        />
      </Stack>
      <Box
        display="flex"
        flex="1 1 auto"
        p={1}
      >
        <Box
          bgColor="var(--chakra-colors-gray-800)"
          border="1px dashed var(--chakra-colors-gray-200)"
          borderRadius={1}
          flex="1 1 auto"
        />
      </Box>
    </Box>
  );
}
