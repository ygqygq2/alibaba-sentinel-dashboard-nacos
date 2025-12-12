import { config } from '../../config';
import type { Settings } from '../../types/settings';

export function applyDefaultSettings(settings: Partial<Settings>): Settings {
  return {
    colorScheme: config.site.colorScheme,
    primaryColor: config.site.primaryColor,
    direction: 'ltr',
    navColor: 'evident',
    ...settings,
  };
}
