import { useTheme } from 'next-themes';

import type { ColorMode } from '@/styles/theme/types';
import type { ColorModeWithSystem } from '@/styles/theme/types';

export type { ColorMode, ColorModeWithSystem };

export interface UseColorModeReturn {
  /** 用户选择的颜色模式 ('light', 'dark', 或 'system') */
  colorMode: ColorModeWithSystem;
  /** 实际解析后的颜色模式 ('light' 或 'dark') */
  resolvedColorMode: ColorMode;
  setColorMode: (colorMode: ColorModeWithSystem) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // 使用 theme 而不是 resolvedTheme,这样我们可以知道用户实际选择的模式
  const currentTheme = (theme || 'system') as ColorModeWithSystem;
  const resolved = (resolvedTheme || 'light') as ColorMode;

  const toggleColorMode = () => {
    // 切换时使用 resolvedTheme 来决定下一个状态
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  };

  return {
    colorMode: currentTheme,
    resolvedColorMode: resolved,
    setColorMode: setTheme as (colorMode: ColorModeWithSystem) => void,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { resolvedColorMode } = useColorMode();
  return resolvedColorMode === 'dark' ? dark : light;
}
