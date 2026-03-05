"use client";

import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Users, KeyRound } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 mt-2">Welcome to the RBAC Administration Panel.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage Roles</div>
              <p className="text-xs text-slate-500 mt-1">Assign users to specific roles.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Permissions Matrix</div>
              <p className="text-xs text-slate-500 mt-1">Check the Roles menu to edit matrices.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Security</CardTitle>
              <KeyRound className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Secured by JWT</div>
              <p className="text-xs text-slate-500 mt-1">All APIs are rate-limited and logged.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
