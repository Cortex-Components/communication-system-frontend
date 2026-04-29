import { useCallback } from 'react';
import { APP_CONFIG } from '@/config/app-config';

/**
 * Provides a fetch wrapper that automatically attaches the Bearer token
 * stored in localStorage and calls `onUnauthorized` on a 401 response.
 */
export function useAuthFetch(onUnauthorized: () => void) {
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
      if (!token) {
        onUnauthorized();
        throw new Error('Access denied: No authentication token found.');
      }

      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
      };

      if (url.includes('/public/')) {
        headers['X-Tenant-ID'] = APP_CONFIG.api.tenantId || '';
      }

      const res = await fetch(url, {
        ...options,
        headers,
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
