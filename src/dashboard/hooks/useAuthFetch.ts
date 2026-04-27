import { useCallback } from 'react';

/**
 * Provides a fetch wrapper that automatically attaches the Bearer token
 * stored in localStorage and calls `onUnauthorized` on a 401 response.
 */
export function useAuthFetch(onUnauthorized: () => void) {
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        onUnauthorized();
        throw new Error('Access denied: No authentication token found.');
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        onUnauthorized();
        throw new Error('Unauthorized');
      }

      return res;
    },
    [onUnauthorized],
  );

  return fetchWithAuth;
}
