import { Box, IconButton, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { Drawer } from '@/components/ui/drawer';
import type { Settings } from '@/types/settings';

import { OptionsColorScheme } from './options-color-scheme';
import { OptionsLayout } from './options-layout';
import { OptionsNavColor } from './options-nav-color';
import { OptionsPrimaryColor } from './options-primary-color';

export interface SettingsDrawerProps {
  canReset?: boolean;
  onClose?: () => void;
  onReset?: () => void;
  onUpdate?: (settings: Partial<Settings>) => void;
  open?: boolean;
  values?: Partial<Settings>;
}

export function SettingsDrawer({
  canReset = true,
  onClose = () => {},
  onUpdate = () => {},
  onReset = () => {},
  open = false,
  values = {},
}: SettingsDrawerProps): React.JSX.Element {
  const handleChange = React.useCallback(
    (field: keyof Settings, value: unknown) => {
      onUpdate?.({ [field]: value });
    },
    [onUpdate]
  );

  return (
    <Drawer.Root
      open={open}
      placement="end"
      onOpenChange={(details) => {
        if (!details.open) {
          onClose?.();
        }
      }}
    >
      <Drawer.Backdrop />
      <Drawer.Content maxW="440px">
        <Drawer.Header
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Stack
            direction="row"
            gap={3}
            align="center"
            justify="space-between"
            px={4}
            py={2.5}
          >
            <Text
              fontSize="lg"
              fontWeight="semibold"
            >
              App settings
            </Text>
            <Stack
              direction="row"
              gap={0.5}
              align="center"
            >
              <Box position="relative">
                {canReset && (
                  <Box
                    position="absolute"
                    top="6px"
                    right="6px"
                    width="8px"
                    height="8px"
                    borderRadius="50%"
                    bg="red.500"
                    zIndex={1}
                  />
                )}
                <IconButton
                  aria-label="Reset"
                  onClick={onReset}
                  size="sm"
                  variant="ghost"
                >
                  <Icon
                    icon="solar:refresh-linear"
                    width="20px"
                    height="20px"
                  />
                </IconButton>
              </Box>
              <Drawer.CloseTrigger asChild>
                <IconButton
                  aria-label="Close"
                  size="sm"
                  variant="ghost"
                >
                  <Icon
                    icon="solar:close-circle-linear"
                    width="20px"
                    height="20px"
                  />
                </IconButton>
              </Drawer.CloseTrigger>
            </Stack>
          </Stack>
        </Drawer.Header>

        <Drawer.Body p={0}>
          <Stack
            gap={5}
            overflowY="auto"
            px={3}
            py={3}
          >
            <OptionsPrimaryColor
              onChange={(value) => {
                handleChange('primaryColor', value);
              }}
              value={values.primaryColor}
            />
            <OptionsColorScheme
              onChange={(value) => {
                handleChange('colorScheme', value);
              }}
              value={values.colorScheme}
            />
            <OptionsNavColor
              onChange={(value) => {
                handleChange('navColor', value);
              }}
              value={values.navColor}
            />
            <OptionsLayout
              onChange={(value) => {
                handleChange('layout', value);
              }}
              value={values.layout}
            />
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
