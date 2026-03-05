"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
}

interface Role {
  id: number;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role_id: '' });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users/'),
        api.get('/roles/')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasRole = (user: User, roleId: number) => {
    return user.roles.some(r => r.id === roleId);
  };

  const handleRoleToggle = async (roleId: number, checked: boolean) => {
    if (!selectedUser) return;
    
    const currentRoles = selectedUser.roles.map(r => r.id);
    let newRoleIds;
    
    if (checked) {
      newRoleIds = [...currentRoles, roleId];
    } else {
      newRoleIds = currentRoles.filter(id => id !== roleId);
    }

    try {
      await api.post(`/users/${selectedUser.id}/roles`, {
        role_ids: newRoleIds
      });
      fetchData(); // Refresh UI
      
      // Optimistically update the selectedUser state so the dialog stays updated
      setSelectedUser({
        ...selectedUser,
        roles: roles.filter(r => newRoleIds.includes(r.id))
      });
    } catch (err) {
      console.error("Failed to update user roles", err);
    }
  };

  const handleCreateUser = async () => {
    try {
      const payload: any = { ...newUser };
      if (payload.role_id) payload.role_id = parseInt(payload.role_id);
      else delete payload.role_id;
      
      await api.post('/users/', payload);
      setNewUser({ username: '', email: '', password: '', role_id: '' });
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Failed to create user", err);
      alert(err.response?.data?.detail || "Failed to create user");
    }
  };

  const handleEditUser = async () => {
    try {
      const payload: any = {
        username: editUser.username,
        email: editUser.email,
      };
      if (editUser.role_id) payload.role_id = parseInt(editUser.role_id);
      if (editUser.password) payload.password = editUser.password;

      await api.put(`/users/${editUser.id}`, payload);
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Failed to update user", err);
      alert(err.response?.data?.detail || "Failed to update user");
    }
  };

  const openEditDialog = (user: User) => {
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.roles.length > 0 ? user.roles[0].id.toString() : ''
    });
    setIsEditOpen(true);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Master Data: Users</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                    value={newUser.role_id}
                    onChange={e => setNewUser({...newUser, role_id: e.target.value})}
                  >
                    <option value="">No Role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">Save User</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog (hidden logic) */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={editUser?.username || ''} onChange={e => setEditUser({...editUser, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editUser?.email || ''} onChange={e => setEditUser({...editUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                    value={editUser?.role_id || ''}
                    onChange={e => setEditUser({...editUser, role_id: e.target.value})}
                  >
                    <option value="">No Role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Reset Password (optional)</Label>
                  <Input type="password" placeholder="Leave empty to keep current password" value={editUser?.password || ''} onChange={e => setEditUser({...editUser, password: e.target.value})} />
                </div>
                <Button onClick={handleEditUser} className="w-full">Update User</Button>
              </div>
            </DialogContent>
          </Dialog>

        </header>

        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-semibold">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(r => (
                          <span key={r.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>Edit User</Button>
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
