'use client';

import { Box } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { Tooltip } from '@/components/ui/tooltip';
import { useColorMode } from '@/hooks/use-color-mode';
import { useSettings } from '@/hooks/use-settings';
import { applyDefaultSettings } from '@/lib/settings/apply-default-settings';
import { setSettings as setPersistedSettings } from '@/lib/settings/set-settings';
import type { Settings } from '@/types/settings';

import { SettingsDrawer } from './settings-drawer';

export function SettingsButton(): React.JSX.Element {
  const { settings, setSettings } = useSettings();
  const { setColorMode } = useColorMode();

  const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);

  const handleUpdate = async (values: Partial<Settings>): Promise<void> => {
    // 如果颜色模式改变,直接设置为新的颜色模式
    if (values.colorScheme && values.colorScheme !== settings.colorScheme) {
      setColorMode(values.colorScheme);
    }

    const updatedSettings = { ...settings, ...values } satisfies Settings;

    setPersistedSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleReset = async (): Promise<void> => {
    const defaultSettings = applyDefaultSettings({});

    // 重置时设置为默认的颜色模式
    setColorMode(defaultSettings.colorScheme);

    setPersistedSettings({});
    setSettings(defaultSettings);
  };

  return (
    <React.Fragment>
      <Tooltip content="Settings">
        <Box
          as="button"
          onClick={() => {
            setOpenDrawer(true);
          }}
          position="fixed"
          bottom="16px"
          right="16px"
          width="40px"
          height="40px"
          borderRadius="50%"
          border="none"
          cursor="pointer"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.900"
          color="white"
          zIndex="tooltip"
          padding="10px"
          _hover={{
            bg: 'gray.700',
          }}
          style={{
            animation: 'spin 4s linear infinite',
          }}
        >
          <Icon
            icon="solar:settings-outline"
            width="20px"
            height="20px"
          />
        </Box>
      </Tooltip>
      <SettingsDrawer
        onClose={() => {
          setOpenDrawer(false);
        }}
        onReset={handleReset}
        onUpdate={handleUpdate}
        open={openDrawer}
        values={settings}
      />
    </React.Fragment>
  );
}
