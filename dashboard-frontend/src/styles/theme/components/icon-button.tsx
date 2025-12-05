import { defineRecipe } from '@chakra-ui/react';

// Ensure header icon buttons are transparent by default
export const IconButton = defineRecipe({
  base: {
    borderRadius: '8px',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'colorPalette.500',
      outlineOffset: '2px',
    },
  },
  variants: {
    // Align with Button recipe variants
    variant: {
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
        _hover: { bg: { base: 'colorPalette.600', _dark: 'colorPalette.500' } },
        _active: { bg: { base: 'colorPalette.700', _dark: 'colorPalette.600' } },
      },
      outline: {
        borderWidth: '1px',
        borderColor: 'colorPalette.500',
        color: 'colorPalette.700',
        bg: 'transparent',
        _hover: { bg: 'colorPalette.50' },
        _active: { bg: 'colorPalette.100' },
      },
      ghost: {
        color: 'colorPalette.700',
        bg: 'transparent',
        _hover: { bg: 'transparent' },
        _active: { bg: 'transparent' },
      },
      // Plain: fully transparent, used for top-right header icons
      plain: {
        color: 'colorPalette.700',
        bg: 'transparent',
        _hover: { bg: 'transparent' },
        _active: { bg: 'transparent' },
      },
      subtle: {
        bg: 'colorPalette.100',
        color: 'colorPalette.700',
        _hover: { bg: 'colorPalette.200' },
        _active: { bg: 'colorPalette.300' },
      },
      surface: {
        bg: 'bg.panel',
        color: 'colorPalette.700',
        boxShadow: 'xs',
        _hover: { bg: 'colorPalette.50' },
        _active: { bg: 'colorPalette.100' },
      },
    },
    size: {
      sm: { h: 9, minW: 9 },
      md: { h: 10, minW: 10 },
      lg: { h: 11, minW: 11 },
    },
  },
  defaultVariants: {
    variant: 'plain',
    size: 'md',
    colorPalette: 'gray',
  },
});
