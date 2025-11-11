// hooks/useUsers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseUsersReturn {
  users: User[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(page: number = 1, limit: number = 10): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/users?page=${page}&limit=${limit}`);

      if (!response.ok) {
        // Handle different status codes with appropriate error messages
        let errorMessage = `Failed to fetch users: ${response.statusText}`;
        
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || 'Server error occurred while fetching users';
        } else if (response.status === 404) {
          errorMessage = 'Users endpoint not found';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden while fetching users';
        } else if (response.status >= 400 && response.status < 500) {
          errorMessage = `Client error: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred while fetching users';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your connection.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    pagination,
    loading,
    error,
    refetch,
  };
}