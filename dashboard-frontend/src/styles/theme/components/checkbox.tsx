import { defineSlotRecipe } from '@chakra-ui/react';

export const Checkbox = defineSlotRecipe({
  slots: ['root', 'control', 'label', 'indicator'],
  base: {
    root: {
      padding: 0,
      _focusVisible: {
        // Use separate outline + outlineColor so users can override via _focusVisible on the component
        outline: '2px solid',
        outlineColor: 'colorPalette.500',
        outlineOffset: '2px',
      },
    },
    control: {
      padding: 3,
      borderRadius: '8px',
    },
    label: {},
    indicator: {},
  },
});
