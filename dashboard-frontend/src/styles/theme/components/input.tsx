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
      '--focus-color': 'colors.colorPalette.focusRing',
      '--error-color': 'colors.border.error',
      '&::placeholder': {
        color: 'fg.muted',
        opacity: 1,
      },
      _invalid: {
        focusRingColor: 'var(--error-color)',
        borderColor: 'var(--error-color)',
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
    variant: {
      outline: {
        field: {
          bg: 'transparent',
          borderWidth: '1px',
          borderColor: 'border',
          _focusVisible: {
            borderColor: 'var(--focus-color)',
            boxShadow: '0 0 0 1px var(--focus-color)',
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
});
