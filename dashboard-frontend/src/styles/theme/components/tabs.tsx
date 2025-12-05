import { defineSlotRecipe } from '@chakra-ui/react';

export const Tabs = defineSlotRecipe({
  slots: ['root', 'list', 'tab', 'content', 'indicator'],
  base: {
    root: {},
    list: {},
    tab: {
      minWidth: 'auto',
      paddingInline: 0,
      textTransform: 'none',
      _hover: {
        color: 'fg.default',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'colorPalette.500',
        outlineOffset: '2px',
      },
    },
    content: {},
    indicator: {},
  },
});
