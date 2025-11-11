// hooks/useUserDetails.ts
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

export interface Post {
  _id: string;
  userId: string;
  title: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  _id: string;
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface UseUserDetailsReturn {
  user: User | null;
  posts: Post[];
  preferences: Preferences | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserDetails(userId: string): UseUserDetailsReturn {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user, posts, and preferences in parallel
      const [userRes, postsRes, prefsRes] = await Promise.all([
        fetch(`/api/v1/users/${userId}`),
        fetch(`/api/v1/users/${userId}/posts`),
        fetch(`/api/v1/users/${userId}/preferences`).catch(() => null), // Preferences might not exist
      ]);

      // Handle user fetch
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user: ${userRes.statusText}`);
      }
      const userData = await userRes.json();
      setUser(userData);

      // Handle posts fetch
      if (!postsRes.ok) {
        throw new Error(`Failed to fetch posts: ${postsRes.statusText}`);
      }
      const postsData = await postsRes.json();
      setPosts(postsData);

      // Handle preferences fetch (optional)
      if (prefsRes && prefsRes.ok) {
        const prefsData = await prefsRes.json();
        setPreferences(prefsData);
      } else {
        setPreferences(null);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      setUser(null);
      setPosts([]);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const refetch = useCallback(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return {
    user,
    posts,
    preferences,
    loading,
    error,
    refetch,
  };
}