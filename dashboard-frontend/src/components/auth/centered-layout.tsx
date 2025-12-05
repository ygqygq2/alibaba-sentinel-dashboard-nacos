import { Box } from '@chakra-ui/react';
import * as React from 'react';

export interface CenteredLayoutProps {
  children: React.ReactNode;
}

export function CenteredLayout({ children }: CenteredLayoutProps): React.JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={{ base: 2, md: 3 }}
    >
      <Box
        maxWidth="560px"
        width="100%"
      >
        {children}
      </Box>
    </Box>
  );
}
