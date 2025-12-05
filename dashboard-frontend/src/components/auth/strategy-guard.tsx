import { Alert, Box } from '@chakra-ui/react';
import * as React from 'react';

import { config } from '@/config';
import type { AuthStrategy } from '@/lib/auth/strategy';

interface StrategyGuardProps {
  children: React.ReactNode;
  expected: keyof typeof AuthStrategy;
}

export function StrategyGuard({ children, expected }: StrategyGuardProps): React.JSX.Element {
  if (config.auth.strategy !== expected) {
    return (
      <Box p={3}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              To render this page, you need to configure the auth strategy to "{expected}"
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Box>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
