import { defineSlotRecipe } from '@chakra-ui/react';

export const Input = defineSlotRecipe({
  slots: ['field', 'addon'],
  base: {
    field: {
      borderRadius: '8px',
      paddingBlock: 0,
      paddingInline: '12px',
      minHeight: '40px',
      fontSize: '1rem',
      alignItems: 'center',
      alignSelf: 'stretch',
      display: 'inline-flex',
      '&::placeholder': {
        color: 'fg.muted',
        opacity: 1,
      },
      '&:-webkit-autofill': {
        borderRadius: 'inherit',
      },
    },
    addon: {
      maxWidth: '100%',
      position: 'static',
      transform: 'none',
    },
  },
  variants: {
    size: {
      sm: {
        field: {
          fontSize: '0.875rem',
          paddingInline: '8px',
          minHeight: '32px',
        },
      },
      md: {
        field: {
          fontSize: '1rem',
          paddingInline: '12px',
          minHeight: '40px',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
