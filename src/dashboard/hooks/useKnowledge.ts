import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';
import type { KnowledgeStatus, AsyncStatus } from '../types';

export function useKnowledge(onUnauthorized: () => void) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<AsyncStatus>('idle');

  const fetchKnowledgeStatus = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/status`);
      if (res.ok) setKnowledgeStatus(await res.json());
    } catch (err) {
      console.error('Failed to fetch knowledge status', err);
    }
  }, [fetchWithAuth]);

  const uploadPdfs = useCallback(async (): Promise<boolean> => {
    if (!selectedFiles?.length) return false;

    setUploadStatus('uploading');
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append('files', file));

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/knowledge/upload/batch`,
        { method: 'POST', body: formData },
      );
      if (res.ok) {
        setUploadStatus('success');
        setSelectedFiles(null);
        await fetchKnowledgeStatus();
        setTimeout(() => setUploadStatus('idle'), 3000);
        return true;
      }
      setUploadStatus('error');
      return false;
    } catch {
      setUploadStatus('error');
      return false;
    }
  }, [fetchWithAuth, fetchKnowledgeStatus, selectedFiles]);

  const deletePdf = useCallback(
    async (filename: string): Promise<boolean> => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/admin/knowledge/pdf/${encodeURIComponent(filename)}`,
          { method: 'DELETE' },
        );
        if (res.ok) await fetchKnowledgeStatus();
        return res.ok;
      } catch {
        return false;
      }
    },
    [fetchWithAuth, fetchKnowledgeStatus],
  );

  useEffect(() => {
    fetchKnowledgeStatus();
  }, [fetchKnowledgeStatus]);

  return {
    knowledgeStatus,
    selectedFiles,
    setSelectedFiles,
    uploadStatus,
    uploadPdfs,
    deletePdf,
  };
}
