import { defineSlotRecipe } from '@chakra-ui/react';

export const Popover = defineSlotRecipe({
  slots: ['positioner', 'content', 'header', 'body', 'footer', 'closeTrigger'],
  base: {
    content: {
      boxShadow: 'lg',
      borderColor: 'gray.200',
      _dark: {
        borderColor: 'gray.700',
      },
    },
    header: {},
    body: {},
    footer: {},
    closeTrigger: {},
  },
});
