"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  roles: Array<{
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [pathname]);

  const login = (token: string) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.roles.some((role) =>
      role.permissions.some((p) => p.name === permission)
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
