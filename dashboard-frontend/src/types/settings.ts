import type { ColorModeWithSystem, Direction, PrimaryColor } from '../styles/theme/types';

export type NavColor = 'blend_in' | 'discrete' | 'evident';

export interface Settings {
  primaryColor: PrimaryColor;
  colorScheme: ColorModeWithSystem;
  direction?: Direction;
  navColor?: NavColor;
}
