import { defineSlotRecipe } from '@chakra-ui/react';

export const Card = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer'],
  base: {
    root: {
      borderRadius: '20px',
    },
    header: {
      padding: '32px 24px 16px',
    },
    body: {
      padding: '16px 24px 32px 24px',
      '&:last-child': {
        paddingBottom: '32px',
      },
    },
    footer: {
      padding: '8px 16px 16px',
    },
  },
});
