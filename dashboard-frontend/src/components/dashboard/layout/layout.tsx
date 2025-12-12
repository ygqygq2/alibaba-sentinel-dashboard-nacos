import * as React from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { VerticalLayout } from '@/components/dashboard/layout/vertical/vertical-layout';
import { SearchProvider } from '@/contexts/search-context';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <AuthGuard>
      <SearchProvider>
        <VerticalLayout>{children}</VerticalLayout>
      </SearchProvider>
    </AuthGuard>
  );
}
