import { Stack, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

export interface TipProps {
  message: string;
}

export function Tip({ message }: TipProps): React.JSX.Element {
  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      bg="gray.100"
      borderRadius="md"
      p={1}
    >
      <Icon icon="ph:lightbulb" />
      <Text
        color="gray.600"
        fontSize="sm"
      >
        <Text
          as="span"
          fontWeight="700"
        >
          Tip.
        </Text>{' '}
        {message}
      </Text>
    </Stack>
  );
}
