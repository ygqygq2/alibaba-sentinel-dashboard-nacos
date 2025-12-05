import { defineRecipe } from '@chakra-ui/react';

export const Badge = defineRecipe({
  base: {
    fontSize: 'xs',
    fontWeight: 'medium',
    textTransform: 'uppercase',
    borderRadius: 'md',
    px: 2,
    py: 1,
  },
  variants: {
    variant: {
      // Chakra UI v3 标准 variant: solid (亮暗模式都有良好对比度)
      solid: {
        bg: { base: 'colorPalette.100', _dark: 'colorPalette.900' },
        color: { base: 'colorPalette.700', _dark: 'colorPalette.200' },
      },
      // Chakra UI v3 标准 variant: outline
      outline: {
        borderWidth: '1px',
        borderColor: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: { base: 'colorPalette.700', _dark: 'colorPalette.300' },
      },
      // Chakra UI v3 标准 variant: subtle (柔和背景)
      subtle: {
        bg: { base: 'colorPalette.50', _dark: 'colorPalette.900' },
        color: { base: 'colorPalette.700', _dark: 'colorPalette.300' },
      },
      // 保留原有的 primary variant
      primary: {
        backgroundColor: 'colorPalette.400',
        color: 'colorPalette.contrast',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});
