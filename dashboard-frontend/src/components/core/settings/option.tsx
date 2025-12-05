import { Tag } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

export interface OptionProps {
  icon?: string | React.ReactNode;
  label: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Option({ icon, label, selected, onClick }: OptionProps): React.JSX.Element {
  return (
    <Tag.Root
      size="lg"
      borderRadius="full"
      variant="outline"
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected ? 'colorPalette.solid' : 'gray.200'}
      bg={selected ? 'colorPalette.subtle' : 'transparent'}
      color={selected ? 'colorPalette.fg' : 'inherit'}
      onClick={onClick}
      cursor="pointer"
      paddingX={3}
      paddingY={1.5}
      transition="all 0.2s"
      position="relative"
      _hover={{
        borderColor: selected ? 'colorPalette.solid' : 'gray.300',
        bg: selected ? 'colorPalette.muted' : 'gray.50',
      }}
      _dark={{
        borderColor: selected ? 'colorPalette.solid' : 'gray.700',
        _hover: {
          borderColor: selected ? 'colorPalette.solid' : 'gray.600',
          bg: selected ? 'colorPalette.muted' : 'gray.800',
        },
      }}
    >
      {icon && (
        <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
          {typeof icon === 'string' ? (
            <Icon
              icon={icon}
              width="16px"
              height="16px"
            />
          ) : (
            icon
          )}
        </span>
      )}
      <Tag.Label fontSize="sm">{label}</Tag.Label>
    </Tag.Root>
  );
}
