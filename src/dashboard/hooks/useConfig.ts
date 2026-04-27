import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';
import type { BuildStatus } from '../index';

export function useConfig(onUnauthorized: () => void) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<BuildStatus>('idle');
  const [buildLog, setBuildLog] = useState('');
  const [scriptLink, setScriptLink] = useState('');

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ui-config`);
      if (res.ok) setConfig(await res.json());
    } catch (err) {
      console.error('Failed to fetch config', err);
    }
  }, []);

  const handleInputChange = useCallback((key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveConfig = useCallback(async (): Promise<boolean> => {
    setStatus('saving');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ui-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setStatus(res.ok ? 'idle' : 'error');
      return res.ok;
    } catch {
      setStatus('error');
      return false;
    }
  }, [config, fetchWithAuth]);

  const build = useCallback(async () => {
    await saveConfig();
    setStatus('building');
    setBuildLog('Starting build process...');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBuildLog(data.stdout || 'Build completed successfully.');
        setScriptLink(data.scriptLink);
        setStatus('success');
      } else {
        setBuildLog(data.details || 'Build failed.');
        setStatus('error');
      }
    } catch {
      setStatus('error');
      setBuildLog('Network error occurred during build.');
    }
  }, [fetchWithAuth, saveConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    status,
    buildLog,
    scriptLink,
    handleInputChange,
    saveConfig,
    build,
  };
}
