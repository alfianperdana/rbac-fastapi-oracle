"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Role {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles/'),
        api.get('/permissions/')
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (err) {
      console.error("Failed to fetch roles/permissions", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasPermission = (role: Role, permId: number) => {
    return role.permissions.some(p => p.id === permId);
  };

  const togglePermission = async (permId: number, checked: boolean) => {
    if (!selectedRole) return;
    
    // Optimistic UI update
    const currentPermIds = selectedRole.permissions.map(p => p.id);
    let newPermIds;
    
    if (checked) {
      newPermIds = [...currentPermIds, permId];
    } else {
      newPermIds = currentPermIds.filter(id => id !== permId);
    }

    // Update state to reflect immediately
    setSelectedRole({
      ...selectedRole,
      permissions: permissions.filter(p => newPermIds.includes(p.id))
    });

    // API Call
    try {
      await api.post(`/roles/${selectedRole.id}/permissions`, {
        permission_ids: newPermIds
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update matrix", err);
      // Revert on fail
      fetchData();
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Role & Permission Matrix</h1>
          <p className="text-slate-500 mt-2">Manage dynamic RBAC access control</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Master Roles</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-500 mb-4">Roles are pre-defined by the system (Admin, Supervisor, Worker).</p>
              <ul className="space-y-2">
                {roles.map(role => (
                  <li 
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-md cursor-pointer transition ${selectedRole?.id === role.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 border' : 'bg-white dark:bg-slate-800 border-transparent border shadow-sm hover:border-slate-300'}`}
                  >
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{role.name.toUpperCase()}</div>
                    <div className="text-xs text-slate-400">{role.permissions.length} permissions</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>
                Permissions Builder {selectedRole && <span> - <span className="text-blue-500">{selectedRole.name.toUpperCase()}</span></span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedRole ? (
                <div className="flex items-center justify-center p-12 text-slate-400">
                  Select a role from the left to edit its permissions matrix.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead className="w-[100px]">Assign</TableHead>
                        <TableHead>Permission Node</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map(perm => (
                        <TableRow key={perm.id}>
                          <TableCell>
                            <Checkbox 
                              checked={hasPermission(selectedRole, perm.id)}
                              onCheckedChange={(checked) => togglePermission(perm.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{perm.name}</TableCell>
                          <TableCell className="text-slate-500 text-sm">{perm.description || 'No description'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
