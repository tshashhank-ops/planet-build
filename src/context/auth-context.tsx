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
  // In a real app, this would be managed on a server.
  const [users, setUsers] = useState<User[]>(mockUsers);
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        setUser(foundUser);
        return foundUser;
      }
      return null;
    },
    [users]
  );

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [router]);

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<User | null> => {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return null; // User already exists
      }

      const newUser: User = {
        id: users.length + 1,
        name,
        email,
        password,
        avatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        rating: 0,
        memberSince: new Date().toISOString(),
        reviews: [],
        badges: [],
        carbonCredits: 0,
        dataAiHint: 'profile avatar',
      };
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      setUser(newUser);
      return newUser;
    },
    [users]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}
