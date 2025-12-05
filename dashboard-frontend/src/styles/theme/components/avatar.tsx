import { defineSlotRecipe } from '@chakra-ui/react';

export const Avatar = defineSlotRecipe({
  slots: ['root', 'excessLabel', 'image', 'fallback'],
  base: {
    root: {
      fontWeight: 500,
      letterSpacing: 0,
      height: '40px',
      width: '40px',
    },
    excessLabel: {
      fontSize: '0.875rem',
    },
  },
});
