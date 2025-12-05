import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import * as colors from './colors';
import { components } from './components/components';
import type { PaletteRange } from './types';

// 生成颜色 tokens (直接使用颜色值，不含条件)
function generateColorTokens(colorPalette: PaletteRange) {
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  const tokens: Record<number, { value: string }> = {};
  levels.forEach((level) => {
    const color = colorPalette[level as keyof typeof colorPalette] || colorPalette[500];
    tokens[level] = {
      value: color ?? '',
    };
  });
  return tokens;
}

// 生成语义化 tokens (支持 light/dark 模式，引用 tokens)
function generateSemanticTokens(colorName: string) {
  return {
    solid: { value: { base: `{colors.${colorName}.500}`, _dark: `{colors.${colorName}.400}` } },
    contrast: { value: { base: 'white', _dark: 'black' } },
    fg: { value: { base: `{colors.${colorName}.700}`, _dark: `{colors.${colorName}.300}` } },
    muted: { value: { base: `{colors.${colorName}.200}`, _dark: `{colors.${colorName}.800}` } },
    subtle: { value: { base: `{colors.${colorName}.100}`, _dark: `{colors.${colorName}.900}` } },
    emphasized: { value: { base: `{colors.${colorName}.300}`, _dark: `{colors.${colorName}.700}` } },
    focusRing: { value: { base: `{colors.${colorName}.500}`, _dark: `{colors.${colorName}.500}` } },
  };
}

const config = defineConfig({
  theme: {
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1440px',
      '2xl': '1600px',
    },
    tokens: {
      colors: {
        chateauGreen: generateColorTokens(colors.chateauGreen),
        neonBlue: generateColorTokens(colors.neonBlue),
        royalBlue: generateColorTokens(colors.royalBlue),
        tomatoOrange: generateColorTokens(colors.tomatoOrange),
      },
      fonts: {
        body: { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
        heading: { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
      },
      sizes: {
        // Container 容器尺寸配置（与 breakpoints 对应）
        container: {
          sm: { value: '600px' },
          md: { value: '900px' },
          lg: { value: '1200px' },
          xl: { value: '1440px' },
          '2xl': { value: '1600px' },
        },
      },
      spacing: {
        px: { value: '1px' },
        '0.5': { value: '0.125rem' },
        '1': { value: '0.25rem' },
        '1.5': { value: '0.375rem' },
        '2': { value: '0.5rem' },
        '2.5': { value: '0.625rem' },
        '3': { value: '0.75rem' },
        '3.5': { value: '0.875rem' },
        '4': { value: '1rem' },
        '5': { value: '1.25rem' },
        '6': { value: '1.5rem' },
        '7': { value: '1.75rem' },
        '8': { value: '2rem' },
        '9': { value: '2.25rem' },
        '10': { value: '2.5rem' },
        '12': { value: '3rem' },
        '14': { value: '3.5rem' },
        '16': { value: '4rem' },
        '20': { value: '5rem' },
        '24': { value: '6rem' },
        '28': { value: '7rem' },
        '32': { value: '8rem' },
        '36': { value: '9rem' },
        '40': { value: '10rem' },
        '44': { value: '11rem' },
        '48': { value: '12rem' },
        '52': { value: '13rem' },
        '56': { value: '14rem' },
        '60': { value: '15rem' },
        '64': { value: '16rem' },
        '72': { value: '18rem' },
        '80': { value: '20rem' },
        '96': { value: '24rem' },
      },
    },
    semanticTokens: {
      colors: {
        chateauGreen: generateSemanticTokens('chateauGreen'),
        neonBlue: generateSemanticTokens('neonBlue'),
        royalBlue: generateSemanticTokens('royalBlue'),
        tomatoOrange: generateSemanticTokens('tomatoOrange'),
      },
    },
    recipes: components,
  },
});

export const system = createSystem(defaultConfig, config);
