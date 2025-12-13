import { defineRecipe } from '@chakra-ui/react';

export const Button = defineRecipe({
  base: {
    borderRadius: '8px',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'colorPalette.500',
      outlineOffset: '2px',
    },
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      // Chakra UI v3 标准 variant: solid (支持 dark mode)
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
        _hover: {
          bg: { base: 'colorPalette.600', _dark: 'colorPalette.500' },
          _disabled: {
            bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
          },
        },
        _active: {
          bg: { base: 'colorPalette.700', _dark: 'colorPalette.600' },
        },
      },
      // Chakra UI v3 标准 variant: outline
      outline: {
        borderWidth: '1px',
        borderColor: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: { base: 'colorPalette.700', _dark: 'colorPalette.300' },
        _hover: {
          bg: { base: 'colorPalette.50', _dark: 'colorPalette.900/20' },
          borderColor: { base: 'colorPalette.600', _dark: 'colorPalette.300' },
          color: { base: 'colorPalette.800', _dark: 'colorPalette.200' },
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: { base: 'colorPalette.100', _dark: 'colorPalette.900/30' },
        },
      },
      // Chakra UI v3 标准 variant: ghost
      ghost: {
        color: 'colorPalette.700',
        _hover: {
          bg: 'colorPalette.50',
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: 'colorPalette.100',
        },
      },
      // Chakra UI v3 标准 variant: subtle
      subtle: {
        bg: 'colorPalette.100',
        color: 'colorPalette.700',
        _hover: {
          bg: 'colorPalette.200',
          _disabled: {
            bg: 'colorPalette.100',
          },
        },
        _active: {
          bg: 'colorPalette.300',
        },
      },
      // Chakra UI v3 标准 variant: surface
      surface: {
        bg: 'bg.panel',
        color: 'colorPalette.700',
        boxShadow: 'xs',
        _hover: {
          bg: 'colorPalette.50',
          _disabled: {
            bg: 'bg.panel',
          },
        },
        _active: {
          bg: 'colorPalette.100',
        },
      },
      // Chakra UI v3 标准 variant: plain (无背景)
      plain: {
        color: 'colorPalette.700',
        _hover: {
          bg: 'colorPalette.50',
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: 'colorPalette.100',
        },
      },
    },
    size: {
      xs: {
        fontSize: 'xs',
        px: 2,
        h: 8,
        minW: 8,
      },
      sm: {
        fontSize: 'sm',
        px: 3,
        h: 9,
        minW: 9,
      },
      md: {
        fontSize: 'md',
        px: 4,
        h: 10,
        minW: 10,
      },
      lg: {
        fontSize: 'lg',
        px: 5,
        h: 11,
        minW: 11,
      },
      xl: {
        fontSize: 'xl',
        px: 6,
        h: 12,
        minW: 12,
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
