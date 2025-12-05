import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { SignInForm } from '@/components/auth/sign-in-form';
import { GuestGuard } from '@/components/auth/guest-guard';
import { SplitLayout } from '@/components/auth/split-layout';
import { config } from '@/config';
import type { Metadata } from '@/types/metadata';

const metadata: Metadata = { title: `Sign in | Custom | Auth | ${config.site.name}` };

export function Page(): React.JSX.Element {
  return (
    <React.Fragment>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <GuestGuard>
        <SplitLayout>
          <SignInForm />
        </SplitLayout>
      </GuestGuard>
    </React.Fragment>
  );
}
