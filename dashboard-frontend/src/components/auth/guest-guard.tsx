'use client';

import { Alert } from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/hooks/use-user';
import { logger } from '@/lib/default-logger';
import { paths } from '@/paths';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  // Temporary bypass for development or troubleshooting
  const DISABLE_AUTH =
    import.meta.env.VITE_DISABLE_AUTH === 'true' ||
    (typeof window !== 'undefined' && localStorage.getItem('disable-auth') === 'true');
  if (DISABLE_AUTH) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  const navigate = useNavigate();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = React.useCallback(async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (user) {
      logger.debug('[GuestGuard]: User is logged in, redirecting to dashboard');
      navigate(paths.dashboard.overview, { replace: true });
      return;
    }

    setIsChecking(false);
  }, [isLoading, error, user, navigate]);

  React.useEffect(() => {
    // 只在初始加载时检查，避免登录失败后重复触发
    if (isChecking) {
      checkPermissions().catch(() => {
        // noop
      });
    }
  }, [user, error, isLoading, checkPermissions, isChecking]);

  if (isChecking) {
    // 避免闪烁：直接渲染子组件而不是返回 null
    return <React.Fragment>{children}</React.Fragment>;
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>{error}</Alert.Title>
      </Alert.Root>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
