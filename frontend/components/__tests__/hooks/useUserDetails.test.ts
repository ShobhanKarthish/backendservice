// __tests__/hooks/useUserDetails.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUserDetails } from '@/hooks/useUserDetails';

global.fetch = jest.fn();

describe('useUserDetails Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user, posts, and preferences successfully', async () => {
    const mockUser = {
      _id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockPosts = [
      {
        _id: 'post1',
        userId: '1',
        title: 'Test Post',
        content: 'Content',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    const mockPreferences = {
      _id: 'pref1',
      userId: '1',
      theme: 'dark' as const,
      notifications: true,
      language: 'en',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPosts })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPreferences });

    const { result } = renderHook(() => useUserDetails('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.preferences).toEqual(mockPreferences);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing preferences gracefully', async () => {
    const mockUser = {
      _id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => useUserDetails('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.posts).toEqual([]);
    expect(result.current.preferences).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle user fetch errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useUserDetails('invalid-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.user).toBeNull();
    expect(result.current.posts).toEqual([]);
    expect(result.current.preferences).toBeNull();
  });

  it('should refetch all data when refetch is called', async () => {
    const mockUser = { _id: '1', username: 'test', email: 'test@test.com', role: 'user' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' };

    (global.fetch as jest.Mock)
      .mockResolvedValue({ ok: true, json: async () => mockUser })
      .mockResolvedValue({ ok: true, json: async () => [] })
      .mockResolvedValue({ ok: false, status: 404 });

    const { result } = renderHook(() => useUserDetails('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

    result.current.refetch();

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});