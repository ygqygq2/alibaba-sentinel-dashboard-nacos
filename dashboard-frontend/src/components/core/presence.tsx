import { Box } from '@chakra-ui/react';
import * as React from 'react';

type Size = 'small' | 'medium' | 'large';

type Status = 'online' | 'offline' | 'away' | 'busy';

const sizes = { small: 8, medium: 16, large: 24 };

export interface PresenceProps {
  size?: Size;
  status?: Status;
}

export function Presence({ size = 'medium', status = 'offline' }: PresenceProps): React.JSX.Element {
  const colors = {
    offline: 'gray.300',
    away: 'yellow.400',
    busy: 'red.500',
    online: 'green.500',
  } as Record<Status, string>;

  const color = colors[status];

  return (
    <Box
      bg={color}
      borderRadius="50%"
      display="inline-block"
      flex="0 0 auto"
      height={sizes[size]}
      width={sizes[size]}
    />
  );
}
