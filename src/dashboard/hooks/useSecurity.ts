import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';

function isValidCorsOrigin(url: string): { valid: boolean; error?: string } {
  const trimmed = url.trim();
  if (!trimmed) return { valid: false, error: 'Origin cannot be empty' };
  if (trimmed === '*') return { valid: true };
  const urlRegex =
    /^https?:\/\/(?:localhost(:\d+)?|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\/[^\s]*)?$/;
  return urlRegex.test(trimmed)
    ? { valid: true }
    : { valid: false, error: 'Invalid URL format. Must start with http:// or https://' };
}

export function useSecurity(
  onUnauthorized: () => void,
  onConfigChange: (key: string, value: string) => void,
) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [tenantApiKey, setTenantApiKey] = useState('');
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [corsOrigins, setCorsOrigins] = useState<string[]>([]);
  const [newCorsOrigin, setNewCorsOrigin] = useState('');
  const [corsOriginError, setCorsOriginError] = useState('');

  const fetchCorsOrigins = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/cors`);
      if (res.ok) {
        const data = await res.json();
        setCorsOrigins(Array.isArray(data.cors_origins) ? data.cors_origins : []);
      }
    } catch (err) {
      console.error('Failed to fetch CORS origins', err);
    }
  }, [fetchWithAuth]);

  const regenerateApiKey = useCallback(async (): Promise<boolean> => {
    setRegeneratingKey(true);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/tenant/regenerate-api-key`,
        { method: 'POST' },
      );
      const data = await res.json();
      if (res.ok && data.api_key) {
        setTenantApiKey(data.api_key);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setRegeneratingKey(false);
    }
  }, [fetchWithAuth]);

  const addCorsOrigin = useCallback(() => {
    const trimmed = newCorsOrigin.trim();
    if (corsOrigins.includes(trimmed)) {
      setCorsOriginError('This origin already exists in the list');
      return false;
    }
    const validation = isValidCorsOrigin(trimmed);
    if (!validation.valid) {
      setCorsOriginError(validation.error || 'Invalid origin');
      return false;
    }
    setCorsOrigins((prev) => [...prev, trimmed]);
    setNewCorsOrigin('');
    setCorsOriginError('');
    return true;
  }, [corsOrigins, newCorsOrigin]);

  const removeCorsOrigin = useCallback((origin: string) => {
    setCorsOrigins((prev) => prev.filter((o) => o !== origin));
  }, []);

  const saveCorsOrigins = useCallback(async (): Promise<{ ok: boolean; notificationEmail?: string }> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/cors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cors_origins: corsOrigins.length > 0 ? corsOrigins : ['*'] }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notification_email) {
          onConfigChange('VITE_SUPPORT_EMAIL', data.notification_email);
        }
        return { ok: true, notificationEmail: data.notification_email };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }, [corsOrigins, fetchWithAuth, onConfigChange]);

  const saveNotificationEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/admin/tenant/notification-email`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_email: email }),
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cors_origins)) setCorsOrigins(data.cors_origins);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchWithAuth],
  );

  const clearAllCorsOrigins = useCallback(() => setCorsOrigins([]), []);

  useEffect(() => {
    fetchCorsOrigins();
  }, [fetchCorsOrigins]);

  return {
    tenantApiKey,
    regeneratingKey,
    corsOrigins,
    newCorsOrigin,
    setNewCorsOrigin,
    corsOriginError,
    setCorsOriginError,
    addCorsOrigin,
    removeCorsOrigin,
    clearAllCorsOrigins,
    saveCorsOrigins,
    saveNotificationEmail,
    regenerateApiKey,
  };
}
