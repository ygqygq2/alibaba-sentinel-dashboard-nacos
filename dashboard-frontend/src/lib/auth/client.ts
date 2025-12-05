'use client';

import type { User } from '@/types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  username: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    return { error: 'Sign up not supported' };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { username, password } = params;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        return { error: '用户名或密码错误' };
      }

      // Store login state in localStorage for client-side check
      localStorage.setItem('sentinel-auth', 'true');
      localStorage.setItem('sentinel-user', username);

      return {};
    } catch (err) {
      console.error('Login error:', err);
      return { error: '登录失败，请检查网络连接' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Dev helper: allow auto-login via env or localStorage flag
    const AUTO_LOGIN = import.meta.env.VITE_AUTO_LOGIN === 'true';
    if (AUTO_LOGIN) {
      localStorage.setItem('sentinel-auth', 'true');
      localStorage.setItem('sentinel-user', 'sentinel');
      return {
        data: {
          id: 'sentinel',
          firstName: 'Sentinel',
          lastName: 'Admin',
          email: 'sentinel@example.com',
          avatar: '/assets/avatar.png',
        },
      };
    }

    // Check if user is logged in by trying to access a protected endpoint
    const isLoggedIn = localStorage.getItem('sentinel-auth') === 'true';
    const username = localStorage.getItem('sentinel-user');

    if (!isLoggedIn || !username) {
      return { data: null };
    }

    // Verify session is still valid by making a request to the backend
    try {
      const response = await fetch(`${API_BASE_URL}/app/briefinfos.json`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        // Session expired
        localStorage.removeItem('sentinel-auth');
        localStorage.removeItem('sentinel-user');
        return { data: null };
      }

      return {
        data: {
          id: username,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: '',
          email: `${username}@example.com`,
          avatar: '/assets/avatar.png',
        },
      };
    } catch {
      return { data: null };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('sentinel-auth');
    localStorage.removeItem('sentinel-user');

    // Call backend logout if endpoint exists
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors
    }

    return {};
  }
}

export const authClient = new AuthClient();
