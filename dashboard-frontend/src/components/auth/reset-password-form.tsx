import { Alert, Box, Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { RouterLink } from '@/components/core/link';
import { DynamicLogo } from '@/components/core/logo';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email is required' }).email() });

type Values = zod.infer<typeof schema>;

const defaultValues: Values = { email: '' };

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);

      // Redirect to confirm password reset
    },
    [setError]
  );

  return (
    <Stack gap={4}>
      <RouterLink href={paths.home}>
        <DynamicLogo
          colorDark="light"
          colorLight="dark"
          height={32}
          width={140}
        />
      </RouterLink>
      <Text fontSize="2xl">Reset password</Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field.Root invalid={Boolean(errors.email)}>
                <Field.Label>Email address</Field.Label>
                <Input
                  {...field}
                  type="email"
                />
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>
            )}
          />
          {errors.root ? (
            <Alert.Root status="error">
              <Alert.Description>{errors.root.message}</Alert.Description>
            </Alert.Root>
          ) : null}
          <Button
            loading={isPending}
            colorScheme="teal"
            type="submit"
          >
            Send recovery link
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
