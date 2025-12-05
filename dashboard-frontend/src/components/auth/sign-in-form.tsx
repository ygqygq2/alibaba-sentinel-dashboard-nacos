import { Alert, Box, Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { RouterLink } from '@/components/core/link';
import { DynamicLogo } from '@/components/core/logo';
import { useSettings } from '@/hooks/use-settings';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

const schema = zod.object({
  username: zod.string().min(1, { message: '请输入用户名' }),
  password: zod.string().min(1, { message: '请输入密码' }),
});

type Values = zod.infer<typeof schema>;

// Prefill demo credentials in development to speed up testing
const defaultValues = (
  import.meta.env.DEV ? { username: 'sentinel', password: 'sentinel' } : { username: '', password: '' }
) satisfies Values;

export function SignInForm(): React.JSX.Element {
  const { checkSession } = useUser();
  const { settings } = useSettings();

  const [showPassword, setShowPassword] = React.useState<boolean>();

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

      const { error } = await authClient.signInWithPassword(values);

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
      <div>
        <Box
          as={RouterLink}
          {...({ href: paths.home } as any)}
          display="inline-block"
          fontSize={0}
        >
          <DynamicLogo
            colorDark="dark"
            colorLight="light"
            height={32}
            width={140}
          />
        </Box>
      </div>
      <Stack gap={1}>
        <Text fontSize="2xl">登录 Sentinel Dashboard</Text>
        <Text
          color="gray.500"
          fontSize="sm"
        >
          请输入您的账号信息
        </Text>
      </Stack>
      <Stack gap={3}>
        <Stack gap={2}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={2}>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Field.Root invalid={Boolean(errors.username)}>
                    <Field.Label>用户名</Field.Label>
                    <Input
                      {...field}
                      type="text"
                      placeholder="请输入用户名"
                    />
                    {errors.username && <Field.ErrorText>{errors.username.message}</Field.ErrorText>}
                  </Field.Root>
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Field.Root invalid={Boolean(errors.password)}>
                    <Field.Label>密码</Field.Label>
                    <Box position="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入密码"
                        pr="3rem"
                      />
                      <Box
                        position="absolute"
                        right="0.75rem"
                        top="50%"
                        transform="translateY(-50%)"
                      >
                        {showPassword ? (
                          <Icon
                            icon="ph:eye"
                            style={{ cursor: 'pointer', fontSize: 'var(--icon-fontSize-md)' }}
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <Icon
                            icon="ph:eye-slash"
                            style={{ cursor: 'pointer', fontSize: 'var(--icon-fontSize-md)' }}
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </Box>
                    </Box>
                    {errors.password && <Field.ErrorText>{errors.password.message}</Field.ErrorText>}
                  </Field.Root>
                )}
              />

              {errors.root && (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Title>{errors.root.message}</Alert.Title>
                </Alert.Root>
              )}
              <Button
                loading={isPending}
                type="submit"
                variant="solid"
                colorPalette={settings.primaryColor}
              >
                登录
              </Button>
            </Stack>
          </form>
        </Stack>
      </Stack>
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Description>
          默认账号：{' '}
          <Text
            as="span"
            fontWeight="bold"
          >
            sentinel
          </Text>
          ，密码：{' '}
          <Text
            as="span"
            fontWeight="bold"
          >
            sentinel
          </Text>
        </Alert.Description>
      </Alert.Root>
    </Stack>
  );
}
