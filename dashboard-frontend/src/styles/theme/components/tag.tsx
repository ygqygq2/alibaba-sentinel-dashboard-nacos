import { defineSlotRecipe } from '@chakra-ui/react';

export const Tag = defineSlotRecipe({
  slots: ['root', 'label', 'closeButton'],
  base: {
    root: {
      borderRadius: '12px',
      fontWeight: 500,
    },
    label: {},
    closeButton: {},
  },
  variants: {
    variant: {
      softPrimary: {
        root: {
          backgroundColor: 'colorPalette.100',
          color: 'colorPalette.700',
          _hover: {
            backgroundColor: 'colorPalette.200',
          },
        },
        closeButton: {
          color: 'colorPalette.700',
          _hover: {
            color: 'colorPalette.800',
          },
        },
      },
      softSecondary: {
        root: {
          backgroundColor: 'gray.100',
          color: 'gray.700',
          _hover: {
            backgroundColor: 'gray.200',
          },
        },
        closeButton: {
          color: 'gray.700',
          _hover: {
            color: 'gray.800',
          },
        },
      },
      outlinedSecondary: {
        root: {
          borderColor: 'gray.200',
          color: 'gray.900',
          _dark: {
            borderColor: 'gray.700',
            color: 'gray.50',
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: 'softSecondary',
  },
});
