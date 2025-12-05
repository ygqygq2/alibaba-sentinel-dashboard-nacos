/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Theme as BaseTheme } from '@chakra-ui/react';

export type PaletteRange = Record<number | string, string>;

export type Theme = Partial<BaseTheme>;

export type PrimaryColor = 'chateauGreen' | 'neonBlue' | 'royalBlue' | 'tomatoOrange';

export type Direction = 'ltr' | 'rtl';

export type ColorMode = 'dark' | 'light';

export type ColorModeWithSystem = ColorMode | 'system';

type ComponentStyle = {
  baseStyle?: Record<string, any>;
  sizes?: Record<string, any>;
  variants?: Record<string, any>;
  defaultProps?: Record<string, any>;
};

export type Components = {
  [K in keyof JSX.IntrinsicElements]?: ComponentStyle;
};

export interface TypeAction {
  active: string;
  hover: string;
  hoverOpacity: number;
  selected: string;
  selectedOpacity: number;
  disabled: string;
  disabledOpacity: number;
  disabledBackground: string;
  focus: string;
  focusOpacity: number;
  activatedOpacity: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorSchemeOverrides {}
export type ExtendedColorScheme = OverridableStringUnion<never, ColorSchemeOverrides>;

/**
 * All color-schemes that the application has
 */
export type SupportedColorScheme = DefaultColorScheme | ExtendedColorScheme;

export interface Opacity {
  inputPlaceholder: number;
  inputUnderline: number;
  switchTrackDisabled: number;
  switchTrack: number;
}

export type Overlays = [
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
];

export interface PaletteBackgroundChannel {
  defaultChannel: string;
  paperChannel: string;
}

export interface PaletteCommonChannel {
  background: string;
  backgroundChannel: string;
  onBackground: string;
  onBackgroundChannel: string;
}

export interface PaletteColorChannel {
  mainChannel: string;
  lightChannel: string;
  darkChannel: string;
  contrastTextChannel: string;
}

export interface PaletteActionChannel {
  activeChannel: string;
  selectedChannel: string;
}

export interface PaletteTextChannel {
  primaryChannel: string;
  secondaryChannel: string;
}

export interface PaletteAlert {
  errorColor: string;
  infoColor: string;
  successColor: string;
  warningColor: string;
  errorFilledBg: string;
  infoFilledBg: string;
  successFilledBg: string;
  warningFilledBg: string;
  errorFilledColor: string;
  infoFilledColor: string;
  successFilledColor: string;
  warningFilledColor: string;
  errorStandardBg: string;
  infoStandardBg: string;
  successStandardBg: string;
  warningStandardBg: string;
  errorIconColor: string;
  infoIconColor: string;
  successIconColor: string;
  warningIconColor: string;
}

export interface PaletteAppBar {
  defaultBg: string;
  darkBg: string;
  darkColor: string;
}

export interface PaletteAvatar {
  defaultBg: string;
}

export interface PaletteButton {
  inheritContainedBg: string;
  inheritContainedHoverBg: string;
}

export interface PaletteChip {
  defaultBorder: string;
  defaultAvatarColor: string;
  defaultIconColor: string;
}

export interface PaletteFilledInput {
  bg: string;
  hoverBg: string;
  disabledBg: string;
}

export interface PaletteLinearProgress {
  primaryBg: string;
  secondaryBg: string;
  errorBg: string;
  infoBg: string;
  successBg: string;
  warningBg: string;
}

export interface PaletteSkeleton {
  bg: string;
}

export interface PaletteSlider {
  primaryTrack: string;
  secondaryTrack: string;
  errorTrack: string;
  infoTrack: string;
  successTrack: string;
  warningTrack: string;
}

export interface PaletteSnackbarContent {
  bg: string;
  color: string;
}

export interface PaletteSpeedDialAction {
  fabHoverBg: string;
}

export interface PaletteStepConnector {
  border: string;
}

export interface PaletteStepContent {
  border: string;
}

export interface PaletteSwitch {
  defaultColor: string;
  defaultDisabledColor: string;
  primaryDisabledColor: string;
  secondaryDisabledColor: string;
  errorDisabledColor: string;
  infoDisabledColor: string;
  successDisabledColor: string;
  warningDisabledColor: string;
}

export interface PaletteTableCell {
  border: string;
}

export interface PaletteTooltip {
  bg: string;
}

export interface ColorSystemOptions {
  palette?: PaletteOptions & {
    background?: Partial<PaletteBackgroundChannel>;
    common?: Partial<PaletteCommonChannel>;
    primary?: Partial<PaletteColorChannel>;
    secondary?: Partial<PaletteColorChannel>;
    error?: Partial<PaletteColorChannel>;
    info?: Partial<PaletteColorChannel>;
    success?: Partial<PaletteColorChannel>;
    text?: Partial<PaletteTextChannel>;
    dividerChannel?: Partial<string>;
    action?: Partial<PaletteActionChannel>;
    Alert?: Partial<PaletteAlert>;
    AppBar?: Partial<PaletteAppBar>;
    Avatar?: Partial<PaletteAvatar>;
    Button?: Partial<PaletteButton>;
    Chip?: Partial<PaletteChip>;
    FilledInput?: Partial<PaletteFilledInput>;
    LinearProgress?: Partial<PaletteLinearProgress>;
    Skeleton?: Partial<PaletteSkeleton>;
    Slider?: Partial<PaletteSlider>;
    SnackbarContent?: Partial<PaletteSnackbarContent>;
    SpeedDialAction?: Partial<PaletteSpeedDialAction>;
    StepConnector?: Partial<PaletteStepConnector>;
    StepContent?: Partial<PaletteStepContent>;
    Switch?: Partial<PaletteSwitch>;
    TableCell?: Partial<PaletteTableCell>;
    Tooltip?: Partial<PaletteTooltip>;
  };
  opacity?: Partial<Opacity>;
  overlays?: Overlays;
}

export type Shadows = {
  none: string;
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  outline: string;
  inner: string;
  'dark-lg': string;
};
