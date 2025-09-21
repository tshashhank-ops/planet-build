'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { users as mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setUser(data.data);
          return data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [router]);

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<User | null> => {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, passwordHash: password, role: 'buyer' })
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setUser(data.data);
          return data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}
