import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { GuestGuard } from '@/components/auth/guest-guard';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { SplitLayout } from '@/components/auth/split-layout';
import { config } from '@/config';
import type { Metadata } from '@/types/metadata';

const metadata: Metadata = { title: `Reset password | Custom | Auth | ${config.site.name}` };

export function Page(): React.JSX.Element {
  return (
    <React.Fragment>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <GuestGuard>
        <SplitLayout>
          <ResetPasswordForm />
        </SplitLayout>
      </GuestGuard>
    </React.Fragment>
  );
}
