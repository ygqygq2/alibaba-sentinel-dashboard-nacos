import { Box, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

import { RouterLink } from '@/components/core/link';
import { Logo } from '@/components/core/logo';
import { useApps } from '@/hooks/api';
import { useColorMode } from '@/hooks/use-color-mode';
import { useCurrentApp } from '@/hooks/use-current-app';
import { usePathname } from '@/hooks/use-pathname';
import { useSettings } from '@/hooks/use-settings';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { paths } from '@/paths';
import type { ColorMode } from '@/styles/theme/types';
import type { NavItemConfig } from '@/types/nav';
import type { NavColor } from '@/types/settings';

import { AppSelector } from '../app-selector';
import { getAppFunctionMenuItems } from '../config';
import { icons } from '../nav-icons';
import { RecentApps } from '../recent-apps';
import { navColorStyles } from './styles';

const logoColors = {
  dark: { blend_in: 'dark', discrete: 'dark', evident: 'dark' },
  light: { blend_in: 'light', discrete: 'light', evident: 'light' },
} as Record<ColorMode, Record<NavColor, 'dark' | 'light'>>;

// 自定义的 useDisclosure hook
function useDisclosure({ defaultIsOpen = false } = {}) {
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

export interface SideNavProps {
  color?: NavColor;
  items?: NavItemConfig[];
}

export function SideNav({ color = 'evident', items = [] }: SideNavProps): React.JSX.Element {
  const pathname = usePathname();
  const currentApp = useCurrentApp();
  const { data: _apps = [] } = useApps();
  const { settings } = useSettings();
  const { colorMode } = useColorMode(); // 使用 resolvedTheme,会将 'system' 解析为 'light' 或 'dark'

  const _styles = navColorStyles[colorMode][color];
  const logoColor = logoColors[colorMode][color];

  // 获取当前 primary color 的实际颜色值 (dark 模式使用 400, light 模式使用 500)
  const activeBackgroundColor = React.useMemo(() => {
    const level = colorMode === 'dark' ? '400' : '500';
    return `${settings.primaryColor}.${level}`;
  }, [settings.primaryColor, colorMode]);

  // 获取当前应用的功能菜单
  const appFunctionItems = React.useMemo(() => {
    return currentApp ? getAppFunctionMenuItems(currentApp) : [];
  }, [currentApp]);

  return (
    <Box
      bg="bg.canvas"
      borderRightWidth="1px"
      borderRightColor="border.default"
      color="fg.default"
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      h="100%"
      left={0}
      position="fixed"
      top={0}
      w="280px"
      zIndex="sidebar"
      style={
        {
          '--SideNav-background': 'var(--chakra-colors-bg-canvas)',
          '--SideNav-color': 'var(--chakra-colors-fg-default)',
          '--NavGroup-title-color': 'var(--chakra-colors-fg-muted)',
          '--NavItem-color': 'var(--chakra-colors-fg-default)',
          '--NavItem-hover-background': 'var(--chakra-colors-bg-muted)',
          '--NavItem-active-color': 'white',
          '--NavItem-icon-color': 'var(--chakra-colors-fg-default)',
          '--NavItem-icon-active-color': 'white',
        } as React.CSSProperties
      }
    >
      <Stack
        gap={2}
        px={4}
        py={2}
      >
        <div>
          <ChakraLink
            as={RouterLink}
            href={paths.home}
            display="inline-flex"
          >
            <Logo
              color={logoColor}
              height={32}
              width={140}
            />
          </ChakraLink>
        </div>
      </Stack>
      <Box
        as="nav"
        flex="1 1 auto"
        overflowY="auto"
        px={4}
        py={2}
        css={{
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bg: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bg: 'var(--chakra-colors-border-default)', borderRadius: '3px' },
        }}
      >
        <Stack
          as="ul"
          gap={3}
          style={{ margin: 0, padding: 0, listStyle: 'none' }}
        >
          {/* 首页 - 最上面 */}
          <NavItem
            key="home"
            depth={0}
            pathname={pathname}
            activeBackgroundColor={activeBackgroundColor}
            title="首页"
            href={paths.dashboard.overview}
            icon="house"
          />

          {/* 服务选择器 - 固定高度显示 6 个应用 */}
          <AppSelector />

          {/* 应用功能菜单 */}
          {appFunctionItems.length > 0 && (
            <Box>
              <Text
                color="var(--NavGroup-title-color)"
                fontSize="0.75rem"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb={1.5}
                px="20px"
              >
                服务功能
              </Text>
              <Box
                as="ul"
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {renderNavItems({ depth: 0, items: appFunctionItems, pathname, activeBackgroundColor })}
              </Box>
            </Box>
          )}

          {/* 集群管理菜单 - 不渲染首页，只渲染集群管理 */}
          {renderNavGroups({ items: items.filter((item) => item.key !== 'home'), pathname, activeBackgroundColor })}

          {/* 最近访问 */}
          <RecentApps />
        </Stack>
      </Box>
    </Box>
  );
}

function renderNavGroups({
  items,
  pathname,
  activeBackgroundColor,
}: {
  items: NavItemConfig[];
  pathname: string;
  activeBackgroundColor: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    acc.push(
      <Stack
        as="li"
        key={curr.key}
        gap={1.5}
        style={{ listStyle: 'none' }}
      >
        {curr.title ? (
          <Box px="20px">
            <Text
              color="var(--NavGroup-title-color)"
              fontSize="0.75rem"
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              {curr.title}
            </Text>
          </Box>
        ) : null}
        <Box>{renderNavItems({ depth: 0, items: curr.items, pathname, activeBackgroundColor })}</Box>
      </Stack>
    );

    return acc;
  }, []);

  return (
    <Stack
      as="ul"
      gap={3}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {children}
    </Stack>
  );
}

/**
 * 递归检查是否有子项处于激活状态
 */
function hasActiveChild(items: NavItemConfig[] | undefined, pathname: string): boolean {
  if (!items) return false;
  return items.some((item) => {
    if (item.href && pathname.startsWith(item.href)) return true;
    return hasActiveChild(item.items, pathname);
  });
}

function renderNavItems({
  depth = 0,
  items = [],
  pathname,
  activeBackgroundColor,
}: {
  depth: number;
  items?: NavItemConfig[];
  pathname: string;
  activeBackgroundColor: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { items: childItems, key, ...item } = curr;

    // 递归检查是否有子项处于激活状态，如果有则强制展开
    const forceOpen = hasActiveChild(childItems, pathname);

    acc.push(
      <NavItem
        depth={depth}
        forceOpen={forceOpen}
        key={key}
        pathname={pathname}
        activeBackgroundColor={activeBackgroundColor}
        {...item}
      >
        {childItems ? renderNavItems({ depth: depth + 1, pathname, items: childItems, activeBackgroundColor }) : null}
      </NavItem>
    );

    return acc;
  }, []);

  return (
    <Stack
      as="ul"
      data-depth={depth}
      gap={1}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  children?: React.ReactNode;
  depth: number;
  forceOpen?: boolean;
  pathname: string;
  activeBackgroundColor: string;
}

function NavItem({
  children,
  depth,
  disabled,
  external,
  forceOpen = false,
  href,
  icon,
  label,
  matcher,
  pathname,
  title,
  activeBackgroundColor,
}: NavItemProps): React.JSX.Element {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: forceOpen });
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  // Map config icon key to Iconify name string
  const iconName = icon ? icons[icon] : null;
  // For Phosphor via Iconify, the filled variant uses "-fill" suffix
  const resolvedIcon = iconName ? (forceOpen || active ? `${iconName}-fill` : iconName) : null;
  const expandIconName = isOpen ? 'ph:caret-down' : 'ph:caret-right';
  const isBranch = children && !href;
  const showChildren = Boolean(children && isOpen);

  return (
    <Box
      as="li"
      data-depth={depth}
      userSelect="none"
    >
      <Box
        {...(isBranch
          ? {
              onClick: onToggle,
              onKeyUp: (event: React.KeyboardEvent<HTMLDivElement>): void => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onToggle();
                }
              },
              role: 'button',
            }
          : {
              ...(href
                ? {
                    as: external ? ChakraLink : RouterLink,
                    href,
                    target: external ? '_blank' : undefined,
                    rel: external ? 'noreferrer' : undefined,
                  }
                : { role: 'button' }),
            })}
        alignItems="center"
        borderRadius="md"
        color="var(--NavItem-color)"
        cursor="pointer"
        display="flex"
        flex="0 0 auto"
        gap={2}
        p="6px 20px"
        position="relative"
        textDecoration="none"
        whiteSpace="nowrap"
        {...(disabled && {
          bg: 'var(--NavItem-disabled-background)',
          color: 'var(--NavItem-disabled-color)',
          cursor: 'not-allowed',
        })}
        {...(active && {
          bg: activeBackgroundColor,
          color: 'var(--NavItem-active-color)',
          ...(depth > 0 && {
            '&::before': {
              bg: 'var(--NavItem-children-indicator)',
              borderRadius: '2px',
              content: '" "',
              height: '20px',
              left: '-14px',
              position: 'absolute',
              width: '3px',
            },
          }),
        })}
        {...(isOpen && { color: 'var(--NavItem-open-color)' })}
        _hover={{
          ...(disabled || active ? {} : { bg: 'var(--NavItem-hover-background)', color: 'var(--NavItem-hover-color)' }),
        }}
        tabIndex={0}
      >
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          flex="0 0 auto"
        >
          {resolvedIcon ? (
            <Icon
              icon={resolvedIcon}
              color={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              // Iconify respects fontSize via style
              style={{ fontSize: 'var(--icon-fontSize-md)' }}
            />
          ) : null}
        </Box>
        <Box flex="1 1 auto">
          <Text
            color="inherit"
            fontSize="0.875rem"
            fontWeight={500}
            lineHeight="28px"
          >
            {title}
          </Text>
        </Box>
        {label ? (
          <Box
            colorPalette="primary"
            bg="colorPalette.solid"
            color="colorPalette.contrast"
            px={2}
            py={1}
            borderRadius="sm"
            fontSize="xs"
          >
            {label}
          </Box>
        ) : null}
        {external ? (
          <Box
            alignItems="center"
            display="flex"
            flex="0 0 auto"
          >
            <Icon
              icon="ph:arrow-square-out"
              color="var(--NavItem-icon-color)"
              fontSize="var(--icon-fontSize-sm)"
            />
          </Box>
        ) : null}
        {isBranch ? (
          <Box
            alignItems="center"
            display="flex"
            flex="0 0 auto"
          >
            <Icon
              icon={expandIconName}
              color="var(--NavItem-expand-color)"
              fontSize="var(--icon-fontSize-sm)"
            />
          </Box>
        ) : null}
      </Box>
      {showChildren ? (
        <Box pl="24px">
          <Box
            borderLeft="1px solid var(--NavItem-children-border)"
            pl="12px"
          >
            {children}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
