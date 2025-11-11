// components/UserTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { User } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Pencil, Trash2, Shield, User as UserIcon, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({ users, loading, onEdit, onDelete }: UserTableProps) {
  const router = useRouter();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/v1/users/${deleteUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      onDelete(deleteUserId);
      setDeleteUserId(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
          <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first user to get started with user management.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarFallback className={getRoleColor(user.role)}>
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">ID: {user._id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <UserIcon className="h-3 w-3" />
                    )}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/users/${user._id}`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteUserId(user._id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the user and all their associated posts. 
              The user can be permanently deleted after 24 hours.
              This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}