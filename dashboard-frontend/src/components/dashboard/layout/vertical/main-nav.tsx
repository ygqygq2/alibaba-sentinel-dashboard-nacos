'use client';

import { Box, IconButton, Stack } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { SearchInput } from '@/components/ui/search-input';
import { Tooltip } from '@/components/ui/tooltip';
import { useGlobalSearch } from '@/contexts/search-context';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';
import type { NavItemConfig } from '@/types/nav';

import { MobileNav } from '../mobile-nav';

// 自定义的 useDisclosure hook
function useDisclosure(defaultIsOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);

  const onOpen = React.useCallback(() => setIsOpen(true), []);
  const onClose = React.useCallback(() => setIsOpen(false), []);
  const onToggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export interface MainNavProps {
  items: NavItemConfig[];
}

export function MainNav({ items }: MainNavProps): React.JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <React.Fragment>
      <Box
        as="header"
        bg="bg.panel"
        left={0}
        position="sticky"
        top={0}
        w="100%"
        zIndex="var(--MainNav-zIndex)"
        backdropFilter="blur(10px)"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        _dark={{ backgroundColor: 'rgba(26, 32, 44, 0.95)' }}
      >
        <Box
          borderBottom="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: 'whiteAlpha.200' }}
          display="flex"
          flex="1 1 auto"
          minHeight="var(--MainNav-height)"
          px={{ base: 2, lg: 3 }}
          py={1}
          bg="bg.panel"
        >
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            flex="1 1 auto"
          >
            <IconButton
              aria-label="Open navigation"
              onClick={onOpen}
              display={{ base: 'block', lg: 'none' }}
            >
              <Icon icon="ph:list" />
            </IconButton>
            <GlobalSearchInput />
          </Stack>
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
          >
            <LogoutButton />
          </Stack>
        </Box>
      </Box>
      <MobileNav
        items={items}
        onClose={onClose}
        open={isOpen}
      />
    </React.Fragment>
  );
}

function GlobalSearchInput(): React.JSX.Element {
  const { searchKey, setSearchKey, placeholder } = useGlobalSearch();

  return (
    <Box display={{ base: 'none', lg: 'block' }}>
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
        color={{ base: 'gray.700', _dark: 'gray.300' }}
        _hover={{ bg: { base: 'gray.100', _dark: 'whiteAlpha.200' } }}
        disabled={isLoading}
      >
        <Icon
          icon="ph:sign-out"
          width={20}
          height={20}
        />
      </IconButton>
    </Tooltip>
  );
}
