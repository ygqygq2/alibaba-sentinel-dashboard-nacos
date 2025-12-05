'use client';

import { Box, IconButton, Stack } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { RouterLink } from '@/components/core/link';
import { Logo } from '@/components/core/logo';
import { SearchInput } from '@/components/ui/search-input';
import { Tooltip } from '@/components/ui/tooltip';
import { useGlobalSearch } from '@/contexts/search-context';
import { useSettings } from '@/hooks/use-settings';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

import { MobileNav } from '../mobile-nav';

// Types
export interface MainNavProps {
  color?: 'blend_in' | 'discrete' | 'evident';
  items?: any[];
}

// Components
function GlobalSearchInput(): React.JSX.Element {
  const { searchKey, setSearchKey, placeholder } = useGlobalSearch();

  return (
    <Box display={{ base: 'none', md: 'block' }}>
      <SearchInput
        value={searchKey}
        onChange={setSearchKey}
        placeholder={placeholder}
        width="280px"
        debounceMs={200}
      />
    </Box>
  );
}

function LogoutButton(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      // 使用 window.location.href 强制刷新页面，确保用户状态正确清除
      window.location.href = paths.auth.custom.signIn;
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  }, []);

  return (
    <Tooltip content="退出登录">
      <IconButton
        aria-label="退出登录"
        onClick={handleLogout}
        variant="ghost"
        colorPalette="gray"
        disabled={isLoading}
      >
        <Icon
          icon="ph:sign-out"
          color="var(--NavItem-icon-color)"
        />
      </IconButton>
    </Tooltip>
  );
}

export function MainNav({ color = 'evident', items = [] }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const {
    settings: { colorScheme = 'light' },
  } = useSettings();

  return (
    <React.Fragment>
      <Box
        as="header"
        bg="var(--MainNav-background)"
        borderBottom="var(--MainNav-border)"
        color="var(--MainNav-color)"
        left={0}
        position="sticky"
        top={0}
        zIndex="var(--MainNav-zIndex)"
        style={
          {
            '--MainNav-background': 'var(--chakra-colors-bg-surface)',
            '--MainNav-border': '1px solid var(--chakra-colors-border-subtle)',
            '--MainNav-color': 'var(--chakra-colors-fg-default)',
            '--MainNav-divider': 'var(--chakra-colors-border-subtle)',
            '--MainNav-height': '72px',
            '--MainNav-zIndex': '1000',
            '--SideNav-color': 'var(--chakra-colors-fg-default)',
            '--SideNav-background': 'var(--chakra-colors-bg-canvas)',
            '--NavItem-color': 'var(--chakra-colors-fg-default)',
            '--NavItem-hover-background': 'var(--chakra-colors-bg-muted)',
            '--NavItem-active-background': 'var(--chakra-colors-colorPalette-solid)',
            '--NavItem-active-color': 'var(--chakra-colors-colorPalette-contrast)',
            '--NavItem-disabled-color': 'var(--chakra-colors-fg-disabled)',
            '--NavItem-icon-color': 'var(--chakra-colors-fg-default)',
            '--NavItem-icon-active-color': 'var(--chakra-colors-colorPalette-contrast)',
            '--NavItem-chevron-color': 'var(--chakra-colors-fg-muted)',
          } as React.CSSProperties
        }
        width="100%"
      >
        <Box
          display="flex"
          alignItems="center"
          minHeight="72px"
          px={{ base: 2, sm: 3 }}
          py={1}
          width="100%"
          position="relative"
          zIndex={1}
        >
          {/* 左侧：Mobile Menu Button + Logo */}
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            flex="1 1 auto"
          >
            <IconButton
              aria-label="Open menu"
              onClick={() => setOpenNav(true)}
              display={{ base: 'inline-flex', md: 'none' }}
              variant="ghost"
              colorPalette="gray"
            >
              <Icon
                icon="ph:list"
                color="var(--NavItem-icon-color)"
              />
            </IconButton>
            <RouterLink href={paths.home}>
              <Box display={{ base: 'none', md: 'inline-block' }}>
                <Logo
                  height={32}
                  width={122}
                />
              </Box>
            </RouterLink>
          </Stack>

          {/* 右侧：搜索 + 退出 */}
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            flex="1 1 auto"
            justifyContent="flex-end"
          >
            <GlobalSearchInput />
            <LogoutButton />
          </Stack>
        </Box>

        <Box
          as="nav"
          borderTopWidth="1px"
          borderTopColor="border.default"
          display={{ base: 'none', md: 'block' }}
          minHeight="60px"
          overflowX="auto"
        >
          {/* Navigation items will go here */}
        </Box>
      </Box>

      <MobileNav
        open={openNav}
        onClose={() => setOpenNav(false)}
        items={items}
      />
    </React.Fragment>
  );
}
