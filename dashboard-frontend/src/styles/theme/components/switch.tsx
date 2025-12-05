import { defineSlotRecipe } from '@chakra-ui/react';

export const Switch = defineSlotRecipe({
  slots: ['root', 'control', 'thumb', 'label'],
  base: {
    root: {
      color: 'colorPalette.500',
    },
    thumb: {
      backgroundColor: 'gray.600',
    },
    control: {
      backgroundColor: 'gray.500',
      opacity: 1,
    },
    label: {},
  },
});
