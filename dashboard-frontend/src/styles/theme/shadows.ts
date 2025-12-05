import type { ColorMode, Shadows } from './types';

export const shadows = (colorScheme: ColorMode): Shadows => {
  const alpha = colorScheme === 'dark' ? '0.5' : '0.08';
  return {
    none: 'none',
    xs: `0px 1px 2px rgba(0, 0, 0, ${alpha})`,
    sm: `0px 1px 5px rgba(0, 0, 0, ${alpha})`,
    base: `0px 1px 8px rgba(0, 0, 0, ${alpha})`,
    md: `0px 1px 10px rgba(0, 0, 0, ${alpha})`,
    lg: `0px 1px 14px rgba(0, 0, 0, ${alpha})`,
    xl: `0px 2px 16px rgba(0, 0, 0, ${alpha})`,
    '2xl': `0px 3px 14px rgba(0, 0, 0, ${alpha})`,
    outline: `0px 3px 16px rgba(0, 0, 0, ${alpha})`,
    inner: `0px 4px 18px rgba(0, 0, 0, ${alpha})`,
    'dark-lg': `0px 5px 22px rgba(0, 0, 0, ${alpha})`,
  };
};
