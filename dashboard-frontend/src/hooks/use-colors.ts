import { useColorMode } from '@/hooks/use-color-mode';
import { useSettings } from '@/hooks/use-settings';
import { colorSchemes } from '@/styles/theme/color-schemes';
import type { ColorMode, ColorSystemOptions } from '@/styles/theme/types';

// 返回当前设置(primaryColor + light/dark)所对应的完整 palette
export function useColors(): ColorSystemOptions {
  const { colorMode } = useColorMode();
  const { settings } = useSettings();

  const schemes = colorSchemes({ primaryColor: settings.primaryColor });
  const current = schemes[colorMode as ColorMode];

  if (current?.palette) {
    return current as ColorSystemOptions;
  }

  // 回退：如果出问题，返回一个极简默认 primary
  return {
    palette: {
      primary: {
        500: '#6366f1',
        main: '#6366f1',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      } as any,
    },
  } as ColorSystemOptions;
}
