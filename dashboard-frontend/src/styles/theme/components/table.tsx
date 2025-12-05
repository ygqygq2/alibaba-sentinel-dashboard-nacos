import { defineSlotRecipe } from '@chakra-ui/react';

export const Table = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'row', 'columnHeader', 'cell', 'caption'],
  base: {
    root: {},
    header: {
      backgroundColor: 'bg.subtle',
      color: 'fg.muted',
      lineHeight: 1,
    },
    body: {},
    row: {
      _last: {
        '& td': {
          borderBottom: 'none',
        },
      },
    },
    columnHeader: {
      borderBottom: '1px solid',
      borderColor: 'border.default',
    },
    cell: {
      borderBottom: '1px solid',
      borderColor: 'border.default',
    },
    caption: {},
  },
});
