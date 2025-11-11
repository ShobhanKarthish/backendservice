// app/users/page.tsx
'use client';

import { useState } from 'react';
import { useUsers, User } from '@/hooks/useUsers';
import { UserTable } from '@/components/UserTable';
import { UserForm } from '@/components/UserForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { users, pagination, loading, error, refetch } = useUsers(currentPage, 10);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreateClick = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleDelete = () => {
    refetch();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">User Management</CardTitle>
              <CardDescription className="mt-2">
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <Button onClick={handleCreateClick}>
              Create User
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <UserTable
            users={users}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {pagination.totalUsers} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        user={editingUser}
      />
    </div>
  );
}
