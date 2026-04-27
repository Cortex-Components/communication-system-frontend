import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';

export function usePages(onUnauthorized: () => void) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [availablePages, setAvailablePages] = useState<string[]>([]);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/pages`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAvailablePages(data.map((p: { page: string }) => p.page));
        }
      }
    } catch (err) {
      console.error('Failed to fetch pages', err);
    }
  }, [fetchWithAuth]);

  const deletePage = useCallback(
    async (page: string): Promise<boolean> => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/admin/pages/${page}`,
          { method: 'DELETE' },
        );
        if (res.ok) await fetchPages();
        return res.ok;
      } catch {
        return false;
      }
    },
    [fetchPages, fetchWithAuth],
  );

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return { availablePages, fetchPages, deletePage };
}
