"use client";

import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-none outline-none ring-0 w-full h-full space-x-2"><div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" /><div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce delay-75" /><div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce delay-150" /></div>;
  }

  // If not loading and no user (and we are not on login), we return null to prevent flash of content before redirect
  if (!user && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
