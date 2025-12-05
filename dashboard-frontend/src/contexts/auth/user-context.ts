import type * as React from 'react';

import { config } from '@/config';
import { AuthStrategy } from '@/lib/auth/strategy';

import { UserContext as CustomUserContext, UserProvider as CustomUserProvider } from './custom-user-context';
import { UserContext as SupabaseUserContext, UserProvider as SupabaseUserProvider } from './supabase/user-context';
import type { UserContextValue } from './types';

let UserProvider: React.FC<{ children: React.ReactNode }>;

let UserContext: React.Context<UserContextValue | undefined>;

switch (config.auth.strategy) {
  case AuthStrategy.CUSTOM:
    UserContext = CustomUserContext;
    UserProvider = CustomUserProvider;
    break;
  case AuthStrategy.SUPABASE:
    UserContext = SupabaseUserContext;
    UserProvider = SupabaseUserProvider;
    break;
  default:
    throw new Error('Invalid auth strategy');
}

export { UserContext, UserProvider };
