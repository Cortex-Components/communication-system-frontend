import { useState, useCallback, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';
import type { BuildSerializer } from '../index';

type BuildListStatus = 'idle' | 'loading' | 'success' | 'error';
type BuildActionStatus = 'idle' | 'creating' | 'deleting' | 'success' | 'error';

export function useBuilds(onUnauthorized: () => void) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);

  const [builds, setBuilds] = useState<BuildSerializer[]>([]);
  const [currentBuild, setCurrentBuild] = useState<BuildSerializer | null>(null);
  const [currentScript, setCurrentScript] = useState<string | null>(null);
  const [listStatus, setListStatus] = useState<BuildListStatus>('idle');
  const [actionStatus, setActionStatus] = useState<BuildActionStatus>('idle');

  const pollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const listBuilds = useCallback(async () => {
    setListStatus('loading');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build`);
      if (res.ok) {
        const data = await res.json();
        setBuilds(Array.isArray(data) ? data : []);
        setListStatus('success');
      } else {
        setListStatus('error');
      }
    } catch {
      setListStatus('error');
    }
  }, [fetchWithAuth]);

  const getBuild = useCallback(async (buildId: string): Promise<BuildSerializer | null> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build/${buildId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentBuild(data);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, [fetchWithAuth]);

  const getBuildScript = useCallback(async (buildId: string): Promise<string | null> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build/${buildId}/script`);
      if (res.ok) {
        const script = await res.text();
        setCurrentScript(script);
        return script;
      }
      return null;
    } catch {
      return null;
    }
  }, [fetchWithAuth]);

  const createBuild = useCallback(async (): Promise<BuildSerializer | null> => {
    setActionStatus('creating');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build`, {
        method: 'POST',
      });
      if (res.ok || res.status === 201) {
        const data = await res.json();
        setActionStatus('success');
        await listBuilds();
        return data;
      }
      setActionStatus('error');
      return null;
    } catch {
      setActionStatus('error');
      return null;
    }
  }, [fetchWithAuth, listBuilds]);

  const deleteBuild = useCallback(async (buildId: string): Promise<boolean> => {
    setActionStatus('deleting');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/build/${buildId}`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setActionStatus('success');
        setBuilds((prev) => prev.map((b) => (
          b.build_id === buildId ? { ...b, is_deleted: true } : b
        )));
        if (currentBuild?.build_id === buildId) {
          setCurrentBuild(null);
        }
        return true;
      }
      setActionStatus('error');
      return false;
    } catch {
      setActionStatus('error');
      return false;
    }
  }, [fetchWithAuth, currentBuild]);

  const pollBuildStatus = useCallback((buildId: string, intervalMs = 10000) => {
    if (pollingRef.current[buildId]) {
      clearInterval(pollingRef.current[buildId]);
    }

    pollingRef.current[buildId] = setInterval(async () => {
      await listBuilds();
      const build = builds.find((b) => b.build_id === buildId);
      if (build && build.status !== 'PENDING') {
        clearInterval(pollingRef.current[buildId]);
        delete pollingRef.current[buildId];
      }
    }, intervalMs);
  }, [listBuilds, builds]);

  useEffect(() => {
    listBuilds();
  }, [listBuilds]);

  useEffect(() => {
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval);
    };
  }, []);

  return {
    builds,
    currentBuild,
    currentScript,
    listStatus,
    actionStatus,
    listBuilds,
    getBuild,
    getBuildScript,
    createBuild,
    deleteBuild,
    pollBuildStatus,
  };
}