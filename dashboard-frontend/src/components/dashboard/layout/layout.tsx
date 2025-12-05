import * as React from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { DynamicLayout } from '@/components/dashboard/layout/dynamic-layout';
import { SearchProvider } from '@/contexts/search-context';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <AuthGuard>
      <SearchProvider>
        <DynamicLayout>{children}</DynamicLayout>
      </SearchProvider>
    </AuthGuard>
  );
}
