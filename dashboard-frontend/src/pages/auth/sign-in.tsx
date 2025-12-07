import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { GuestGuard } from '@/components/auth/guest-guard';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SplitLayout } from '@/components/auth/split-layout';
import { config } from '@/config';
import type { Metadata } from '@/types/metadata';

const metadata: Metadata = { title: `Sign in | Auth | ${config.site.name}` };

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
