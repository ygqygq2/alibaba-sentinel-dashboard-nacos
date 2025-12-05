'use client';

import { Box, ChakraProvider } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { useSettings } from '@/hooks/use-settings';

import { system } from '../../styles/theme/system';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  const { settings } = useSettings();

  // 直接使用 settings.primaryColor 作为 colorPalette
  const colorPalette = settings.primaryColor;

  return (
    <ChakraProvider value={system}>
      <Helmet>
        <meta
          content={settings.colorScheme}
          name="color-scheme"
        />
      </Helmet>
      <ColorModeProvider {...props}>
        {/* 使用 Box 设置全局 colorPalette */}
        <Box
          colorPalette={colorPalette}
          minH="100vh"
        >
          {props.children}
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
