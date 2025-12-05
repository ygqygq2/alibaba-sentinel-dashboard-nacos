import { Box, Flex } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import * as React from 'react';

import { useSettings } from '@/hooks/use-settings';

import { getMainNavConfig } from '../config';
import { MainNav } from './main-nav';
import { SideNav } from './side-nav';

export interface VerticalLayoutProps {
  children?: React.ReactNode;
}

export function VerticalLayout({ children }: VerticalLayoutProps): React.JSX.Element {
  const { settings } = useSettings();

  // 生成主导航配置（首页和集群管理）
  const navConfig = React.useMemo(() => getMainNavConfig(), []);

  return (
    <React.Fragment>
      <Global
        styles={css`
          body {
            --MainNav-height: 56px;
            --MainNav-zIndex: 1000;
            --SideNav-width: 280px;
            --SideNav-zIndex: 1100;
            --MobileNav-width: 320px;
            --MobileNav-zIndex: 1100;
            --Content-margin: 0 auto;
            --Content-maxWidth: var(--maxWidth-lg);
            --Content-paddingX: 24px;
            --Content-paddingY: 24px;
            --Content-padding: var(--Content-paddingY) var(--Content-paddingX);
            --Content-width: 100%;
          }
          @media (min-width: 1200px) {
            body {
              --Content-paddingY: 0px;
              --Content-padding: var(--Content-paddingY) var(--Content-paddingX);
            }
          }
        `}
      />
      <Box
        display="flex"
        flexDirection="column"
        position="relative"
        minHeight="100%"
      >
        <SideNav
          color={settings.navColor}
          items={navConfig.navItems}
        />
        <Flex
          direction="column"
          flex="1 1 auto"
          pl={{ lg: 'var(--SideNav-width)' }}
        >
          <MainNav items={navConfig.navItems} />
          <Box
            as="main"
            display="flex"
            flex="1 1 auto"
            flexDirection="column"
            mx="auto"
            maxWidth="var(--Content-maxWidth)"
            px={{ base: '16px', lg: '24px' }}
            py="var(--Content-paddingY)"
            width="var(--Content-width)"
          >
            {children}
          </Box>
        </Flex>
      </Box>
    </React.Fragment>
  );
}
