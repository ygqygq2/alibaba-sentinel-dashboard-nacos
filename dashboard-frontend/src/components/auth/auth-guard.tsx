'use client';

import { Alert } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { config } from '@/config';
import { useUser } from '@/hooks/use-user';
import { AuthStrategy } from '@/lib/auth/strategy';
import { logger } from '@/lib/default-logger';
import { paths } from '@/paths';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  // Temporary bypass for development or troubleshooting
  const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === 'true';
  const DISABLE_AUTH_LOCAL = typeof window !== 'undefined' && localStorage.getItem('disable-auth') === 'true';
  if (DISABLE_AUTH || DISABLE_AUTH_LOCAL) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const navigate = useNavigate();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (!user) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');

      switch (config.auth.strategy) {
        case AuthStrategy.CUSTOM: {
          navigate(paths.auth.custom.signIn, { replace: true });
          return;
        }
        default: {
          logger.error('[AuthGuard]: Unknown auth strategy');
          return;
        }
      }
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
  }, [user, error, isLoading]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>{String(error)}</Alert.Title>
      </Alert.Root>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
