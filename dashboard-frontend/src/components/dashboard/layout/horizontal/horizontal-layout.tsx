import { Box } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import * as React from 'react';

import { useSettings } from '@/hooks/use-settings';

import { getMainNavConfig } from '../config';
import { MainNav } from './main-nav';

export interface HorizontalLayoutProps {
  children?: React.ReactNode;
}

export function HorizontalLayout({ children }: HorizontalLayoutProps): React.JSX.Element {
  const { settings } = useSettings();

  // 生成主导航配置（首页和集群管理）
  const navConfig = React.useMemo(() => getMainNavConfig(), []);

  return (
    <React.Fragment>
      <Global
        styles={css`
          body {
            --MainNav-zIndex: 1000;
            --MobileNav-width: 320px;
            --MobileNav-zIndex: 1100;
          }
        `}
      />
      <Box
        colorPalette={settings.primaryColor}
        bg="bg.canvas"
        display="flex"
        flexDirection="column"
        position="relative"
        minHeight="100vh"
      >
        <MainNav
          color={settings.navColor}
          items={navConfig.navItems}
        />
        <Box
          as="main"
          mx="auto"
          maxWidth="var(--maxWidth-xl)"
          px="24px"
          py="24px"
          width="100%"
          display="flex"
          flex="1 1 auto"
          flexDirection="column"
        >
          {children}
        </Box>
      </Box>
    </React.Fragment>
  );
}
