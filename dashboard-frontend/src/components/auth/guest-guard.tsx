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
  const hasCheckedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    // 初始检查
    if (!hasCheckedRef.current && !isLoading) {
      hasCheckedRef.current = true;
      setIsChecking(false);

      if (user) {
        logger.debug('[GuestGuard]: User is logged in, redirecting to dashboard');
        navigate(paths.dashboard.overview, { replace: true });
      }
    }

    // 登录成功后的跳转（user 从 null 变为有值）
    if (hasCheckedRef.current && user && !isLoading) {
      logger.debug('[GuestGuard]: User logged in, redirecting to dashboard');
      navigate(paths.dashboard.overview, { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || isChecking) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  if (error && !user) {
    logger.debug('[GuestGuard]: Auth error, but user can still access login page');
  }

  return <React.Fragment>{children}</React.Fragment>;
}
