'use client';

import { Box, Image } from '@chakra-ui/react';
import * as React from 'react';

import { NoSsr } from '@/components/core/no-ssr';
import { useColorMode } from '@/hooks/use-color-mode';

const HEIGHT = 60;
const WIDTH = 60;

type Color = 'dark' | 'light';

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: string | number;
  width?: string | number;
}

export function Logo({ color = 'dark', emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
  let url: string;

  if (emblem) {
    url = color === 'light' ? '/assets/logo-emblem.svg' : '/assets/logo-emblem--dark.svg';
  } else {
    url = color === 'light' ? '/assets/logo.svg' : '/assets/logo--dark.svg';
  }

  return (
    <Image
      alt="logo"
      src={url}
      height={typeof height === 'number' ? `${height}px` : height}
      width={typeof width === 'number' ? `${width}px` : width}
    />
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function DynamicLogo({
  colorDark = 'light',
  colorLight = 'dark',
  height = HEIGHT,
  width = WIDTH,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { resolvedColorMode } = useColorMode();
  const color = resolvedColorMode === 'dark' ? colorDark : colorLight;

  return (
    <NoSsr
      fallback={
        <Box
          h={`${height}px`}
          w={`${width}px`}
        />
      }
    >
      <Logo
        color={color}
        height={height}
        width={width}
        {...props}
      />
    </NoSsr>
  );
}
