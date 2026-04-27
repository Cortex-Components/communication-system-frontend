import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';
import type { AiConfig, AsyncStatus } from '../types';

export function useAiConfig(onUnauthorized: () => void) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [aiConfig, setAiConfig] = useState<AiConfig>({});
  const [aiStatus, setAiStatus] = useState<AsyncStatus>('idle');

  const fetchAiConfig = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ai-config`);
      if (!res.ok) return;
      const data = await res.json();
      setAiConfig({
        ...data,
        brand_voice_rules: data.brand_voice_rules
          ? JSON.stringify(data.brand_voice_rules, null, 2)
          : '{}',
        custom_intents: data.custom_intents ? data.custom_intents.join(', ') : '',
      });
    } catch (err) {
      console.error('Failed to fetch AI config', err);
    }
  }, [fetchWithAuth]);

  const handleAiInputChange = useCallback(
    (key: keyof AiConfig, value: unknown) => {
      setAiConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saveAiConfig = useCallback(async (): Promise<boolean> => {
    setAiStatus('saving');
    let payload: AiConfig;
    try {
      payload = {
        ...aiConfig,
        brand_voice_rules:
          typeof aiConfig.brand_voice_rules === 'string'
            ? JSON.parse(aiConfig.brand_voice_rules || '{}')
            : aiConfig.brand_voice_rules,
        custom_intents:
          typeof aiConfig.custom_intents === 'string'
            ? (aiConfig.custom_intents as string)
                .split(',')
                .map((i) => i.trim())
                .filter(Boolean)
            : aiConfig.custom_intents,
        escalation_threshold_override: Number(
          aiConfig.escalation_threshold_override || 0,
        ),
      };
    } catch {
      alert('Invalid JSON in Brand Voice Rules. Please check your syntax.');
      setAiStatus('error');
      return false;
    }

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/tenant-ai-config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      setAiStatus(res.ok ? 'idle' : 'error');
      return res.ok;
    } catch {
      setAiStatus('error');
      return false;
    }
  }, [aiConfig, fetchWithAuth]);

  useEffect(() => {
    fetchAiConfig();
  }, [fetchAiConfig]);

  return { aiConfig, aiStatus, handleAiInputChange, saveAiConfig };
}
