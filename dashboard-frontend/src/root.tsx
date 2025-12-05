'use client';

import '@/styles/global.css';

import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { I18nProvider } from '@/components/core/i18n-provider';
import { QueryProvider } from '@/components/core/query-provider';
import { SettingsButton } from '@/components/core/settings/settings-button';
import { Toaster } from '@/components/core/toaster';
import { Provider } from '@/components/ui/provider';
import { UserProvider } from '@/contexts/auth/user-context';
import { getSettings as getPersistedSettings } from '@/lib/settings/get-settings';

import { config } from './config';
import { SettingsProvider } from './contexts/settings';
import { applyDefaultSettings } from './lib/settings/apply-default-settings';
import type { Metadata } from './types/metadata';

const metadata: Metadata = { title: config.site.name };

interface RootProps {
  children: React.ReactNode;
}

export function Root({ children }: RootProps): React.JSX.Element {
  const settings = React.useRef(applyDefaultSettings(getPersistedSettings()));

  return (
    <HelmetProvider>
      <Helmet>
        <meta
          content={config.site.themeColor}
          name="theme-color"
        />
        <title>{metadata.title}</title>
      </Helmet>
      <Provider>
        <QueryProvider>
          <UserProvider>
            <SettingsProvider settings={settings.current}>
              <I18nProvider language="zh">
                {children}
                <SettingsButton />
                <Toaster />
              </I18nProvider>
            </SettingsProvider>
          </UserProvider>
        </QueryProvider>
      </Provider>
    </HelmetProvider>
  );
}
