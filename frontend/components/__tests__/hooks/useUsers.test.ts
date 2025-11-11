// __tests__/hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '@/hooks/useUsers';

// Mock fetch globally
global.fetch = jest.fn();

describe('useUsers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockData = {
      users: [
        {
          _id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 1,
        usersPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useUsers(1, 10));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockData.users);
    expect(result.current.pagination).toEqual(mockData.pagination);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useUsers(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.users).toEqual([]);
    expect(result.current.pagination).toBeNull();
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = {
      users: [{ _id: '1', username: 'test', email: 'test@example.com', role: 'user' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
      pagination: { currentPage: 1, totalPages: 1, totalUsers: 1, usersPerPage: 10, hasNextPage: false, hasPrevPage: false },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useUsers(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should update when page changes', async () => {
    const mockData = {
      users: [],
      pagination: { currentPage: 1, totalPages: 5, totalUsers: 50, usersPerPage: 10, hasNextPage: true, hasPrevPage: false },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result, rerender } = renderHook(
      ({ page }) => useUsers(page, 10),
      { initialProps: { page: 1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change page
    rerender({ page: 2 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/users?page=2&limit=10');
    });
  });
});