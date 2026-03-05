"use client";

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertOctagon } from 'lucide-react';

export default function WorkerPage() {
  const { hasPermission, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const canAccess = hasPermission('worker.access');

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        {!canAccess ? (
          <div className="text-center space-y-4">
            <AlertOctagon className="w-24 h-24 text-red-500 mx-auto" />
            <h1 className="text-4xl font-bold text-red-600">Restricted Area</h1>
            <p className="text-slate-500 max-w-md mx-auto">
              You do not have the <span className="font-mono bg-slate-200 px-1 rounded">worker.access</span> permission required to view this page. System automatically denied access.
            </p>
          </div>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-emerald-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Worker Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Welcome to the authorized zone.</h2>
              <p className="text-slate-600">
                You can see this page because your role has been granted the specific permission.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
