"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

export default function PermissionsPage() {
  const { hasPermission } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/permissions/');
      setPermissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/permissions/', { name: newName, description: newDesc });
      setNewName('');
      setNewDesc('');
      fetchPermissions();
    } catch (err) {
      console.error("Failed to create permission", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      await api.delete(`/permissions/${id}`);
      fetchPermissions();
    } catch (err) {
      console.error("Failed to delete permission", err);
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Master Data: Permissions</h1>
        </header>

        {hasPermission('permission.create') && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Node</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="name">Permission Identity Node (e.g. user.view)</Label>
                  <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                </div>
                <Button type="submit">Create</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Permissions List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Node</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell className="font-mono text-blue-600">{p.name}</TableCell>
                    <TableCell>{p.description || '-'}</TableCell>
                    <TableCell>
                      {hasPermission('permission.delete') && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
