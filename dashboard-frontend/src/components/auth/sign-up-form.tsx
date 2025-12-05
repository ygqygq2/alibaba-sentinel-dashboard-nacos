'use client';

import { Alert, Box, Button, Checkbox, Field, Image, Input, Link, Separator, Stack, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { RouterLink } from '@/components/core/link';
import { DynamicLogo } from '@/components/core/logo';
import { toast } from '@/components/core/toaster';
import { useSettings } from '@/hooks/use-settings';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

interface OAuthProvider {
  id: 'google' | 'discord';
  name: string;
  logo: string;
}

const oAuthProviders = [
  { id: 'google', name: 'Google', logo: '/assets/logo-google.svg' },
  { id: 'discord', name: 'Discord', logo: '/assets/logo-discord.svg' },
] satisfies OAuthProvider[];

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(6, { message: 'Password should be at least 6 characters' }),
  terms: zod.boolean().refine((value) => value, 'You must accept the terms and conditions'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', password: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const { checkSession } = useUser();
  const { settings } = useSettings();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onAuth = React.useCallback(async (providerId: OAuthProvider['id']): Promise<void> => {
    setIsPending(true);

    const { error } = await authClient.signInWithOAuth({ provider: providerId });

    if (error) {
      setIsPending(false);
      toast.error(error);
      return;
    }

    setIsPending(false);

    // Redirect to OAuth provider
  }, []);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.();
    },
    [checkSession, setError]
  );

  return (
    <Stack gap={4}>
      <Box
        as={RouterLink}
        {...({ href: paths.home } as any)}
      >
        <DynamicLogo
          colorDark="light"
          colorLight="dark"
          height={32}
          width={140}
        />
      </Box>
      <Stack gap={1}>
        <Text fontSize="2xl">Sign up</Text>
        <Text color="gray.500">
          Already have an account?{' '}
          <Link
            as={RouterLink}
            {...({ href: paths.auth.custom.signIn } as any)}
            color="blue.500"
          >
            Sign in
          </Link>
        </Text>
      </Stack>
      <Stack gap={3}>
        <Stack gap={2}>
          {oAuthProviders.map((provider) => (
            <Button
              variant="outline"
              colorPalette={settings.primaryColor}
              loading={isPending}
              key={provider.id}
              onClick={() => {
                onAuth(provider.id).catch(() => {
                  // noop
                });
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Text>Continue with {provider.name}</Text>
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  boxSize="20px"
                />
              </Box>
            </Button>
          ))}
        </Stack>
        <Separator>or</Separator>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={2}>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Field.Root invalid={Boolean(errors.firstName)}>
                  <Field.Label>First name</Field.Label>
                  <Input {...field} />
                  <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                </Field.Root>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Field.Root invalid={Boolean(errors.lastName)}>
                  <Field.Label>Last name</Field.Label>
                  <Input {...field} />
                  <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                </Field.Root>
              )}
            />
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
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Field.Root invalid={Boolean(errors.password)}>
                  <Field.Label>Password</Field.Label>
                  <Input
                    {...field}
                    type="password"
                  />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>
              )}
            />
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <Checkbox.Root
                  checked={field.value}
                  onCheckedChange={(e) => field.onChange(e.checked)}
                >
                  <Checkbox.HiddenInput
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    I have read the <Link>terms and conditions</Link>
                  </Checkbox.Label>
                </Checkbox.Root>
              )}
            />
            {errors.root ? (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>{errors.root.message}</Alert.Title>
              </Alert.Root>
            ) : null}
            <Button
              colorScheme="teal"
              loading={isPending}
              type="submit"
            >
              Create account
            </Button>
          </Stack>
        </form>
      </Stack>
      <Alert.Root status="warning">
        <Alert.Indicator />
        <Alert.Title>Created users are not persisted</Alert.Title>
      </Alert.Root>
    </Stack>
  );
}
