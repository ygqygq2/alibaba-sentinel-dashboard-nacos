import { defineSlotRecipe } from '@chakra-ui/react';

export const Menu = defineSlotRecipe({
  slots: ['positioner', 'content', 'item', 'trigger', 'indicator', 'command'],
  base: {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '8px',
    },
    item: {},
    trigger: {},
    indicator: {},
    command: {},
  },
});
