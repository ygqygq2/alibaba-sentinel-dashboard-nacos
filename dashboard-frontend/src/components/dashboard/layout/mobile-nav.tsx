import { Box, Drawer, LinkBox, LinkOverlay, Stack, Tag, Text } from '@chakra-ui/react';
import { Icon as IconifyIcon } from '@iconify/react';
import * as React from 'react';

import { RouterLink } from '@/components/core/link';
import { Logo } from '@/components/core/logo';
import { useDialog } from '@/hooks/use-dialog';
import { usePathname } from '@/hooks/use-pathname';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { paths } from '@/paths';
import type { NavItemConfig } from '@/types/nav';

import { icons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ items = [], open = false, onClose = () => {} }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="end"
      size="xs"
    >
      <Drawer.Backdrop />
      <Drawer.Content
        bg="gray.900"
        color="white"
        display="flex"
        flexDirection="column"
        maxWidth="100%"
        width="var(--MobileNav-width)"
        zIndex="var(--MobileNav-zIndex)"
        css={{
          '--MobileNav-background': 'var(--chakra-colors-gray-900)',
          '--MobileNav-color': 'var(--chakra-colors-white)',
          '--NavGroup-title-color': 'var(--chakra-colors-gray-400)',
          '--NavItem-color': 'var(--chakra-colors-gray-300)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
          '--NavItem-active-background': 'var(--chakra-colors-blue-500)',
          '--NavItem-active-color': 'var(--chakra-colors-white)',
          '--NavItem-disabled-color': 'var(--chakra-colors-gray-500)',
          '--NavItem-icon-color': 'var(--chakra-colors-gray-400)',
          '--NavItem-icon-active-color': 'var(--chakra-colors-white)',
          '--NavItem-icon-disabled-color': 'var(--chakra-colors-gray-600)',
          '--NavItem-expand-color': 'var(--chakra-colors-gray-400)',
          '--NavItem-children-border': 'var(--chakra-colors-gray-700)',
          '--NavItem-children-indicator': 'var(--chakra-colors-gray-400)',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Drawer.CloseTrigger />
        <Drawer.Body>
          <Stack gap={2}>
            <div>
              <RouterLink
                href={paths.home}
                style={{ display: 'inline-flex' }}
              >
                <Logo
                  color="light"
                  height={32}
                  width={140}
                />
              </RouterLink>
            </div>
          </Stack>
          <Box
            as="nav"
            flex="1 1 auto"
            pt={2}
          >
            {renderNavGroups({ items, onClose, pathname })}
          </Box>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}

function renderNavGroups({
  items,
  onClose,
  pathname,
}: {
  items: NavItemConfig[];
  onClose?: () => void;
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    acc.push(
      <Stack
        as="li"
        key={curr.key}
        gap={1.5}
      >
        {curr.title ? (
          <Box>
            <Text
              color="var(--NavGroup-title-color)"
              fontSize="0.875rem"
              fontWeight="500"
            >
              {curr.title}
            </Text>
          </Box>
        ) : null}
        <Box>{renderNavItems({ depth: 0, items: curr.items, onClose, pathname })}</Box>
      </Stack>
    );

    return acc;
  }, []);

  return (
    <Stack
      as="ul"
      gap={2}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {children}
    </Stack>
  );
}

function renderNavItems({
  depth = 0,
  items = [],
  onClose,
  pathname,
}: {
  depth: number;
  items?: NavItemConfig[];
  onClose?: () => void;
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { items: childItems, key, ...item } = curr;

    const forceOpen = childItems
      ? Boolean(childItems.find((childItem) => childItem.href && pathname.startsWith(childItem.href)))
      : false;

    acc.push(
      <NavItem
        depth={depth}
        forceOpen={forceOpen}
        key={key}
        onClose={onClose}
        pathname={pathname}
        {...item}
      >
        {childItems ? renderNavItems({ depth: depth + 1, items: childItems, onClose, pathname }) : null}
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
  onClose?: () => void;
  pathname: string;
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
  onClose,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(forceOpen);
  const onToggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const iconName = icon ? icons[icon] : null;
  const resolvedIcon = iconName ? (forceOpen || active ? `${iconName}-fill` : iconName) : null;
  const isBranch = children && !href;
  const showChildren = Boolean(children && isOpen);

  return (
    <Box
      as="li"
      data-depth={depth}
      userSelect="none"
    >
      <LinkBox
        {...(isBranch
          ? {
              onClick: (): void => {
                onToggle();
              },
              onKeyUp: (event: React.KeyboardEvent<HTMLElement>): void => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onToggle();
                }
              },
              role: 'button',
            }
          : {
              ...(href
                ? {
                    as: external ? 'a' : RouterLink,
                    href,
                    target: external ? '_blank' : undefined,
                    rel: external ? 'noreferrer' : undefined,
                    onClick: (event: React.MouseEvent): void => {
                      onClose?.();
                      event.stopPropagation();
                    },
                  }
                : { role: 'button' }),
            })}
        alignItems="center"
        borderRadius="md"
        display="flex"
        flex="0 0 auto"
        gap={2}
        p="6px 20px"
        position="relative"
        textDecoration="none"
        whiteSpace="nowrap"
        bgColor={
          disabled ? 'var(--NavItem-disabled-background)' : active ? 'var(--NavItem-active-background)' : undefined
        }
        color={
          disabled
            ? 'var(--NavItem-disabled-color)'
            : active
              ? 'var(--NavItem-active-color)'
              : isOpen
                ? 'var(--NavItem-open-color)'
                : 'var(--NavItem-color)'
        }
        cursor={disabled ? 'not-allowed' : 'pointer'}
        _hover={
          !disabled && !active
            ? { bgColor: 'var(--NavItem-hover-background)', color: 'var(--NavItem-hover-color)' }
            : undefined
        }
        tabIndex={0}
      >
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          flex="0 0 auto"
        >
          {resolvedIcon ? (
            <IconifyIcon
              icon={resolvedIcon}
              style={{
                color: active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)',
                fontSize: 'var(--icon-fontSize-md)',
              }}
            />
          ) : null}
        </Box>
        <Box flex="1 1 auto">
          <LinkOverlay
            color="inherit"
            fontSize="sm"
            fontWeight="500"
            lineHeight="28px"
          >
            {title}
          </LinkOverlay>
        </Box>
        {label ? (
          <Tag.Root
            colorPalette="primary"
            size="sm"
          >
            <Tag.Label>{label}</Tag.Label>
          </Tag.Root>
        ) : null}
        {external ? (
          <Box
            alignItems="center"
            display="flex"
            flex="0 0 auto"
          >
            <IconifyIcon
              icon="ph:arrow-square-out"
              style={{ color: 'var(--NavItem-icon-color)', fontSize: 'var(--icon-fontSize-sm)' }}
            />
          </Box>
        ) : null}
        {isBranch ? (
          <Box
            alignItems="center"
            display="flex"
            flex="0 0 auto"
          >
            <IconifyIcon
              icon={isOpen ? 'ph:caret-down' : 'ph:caret-right'}
              style={{ color: 'var(--NavItem-expand-color)', fontSize: 'var(--icon-fontSize-sm)' }}
            />
          </Box>
        ) : null}
      </LinkBox>
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
