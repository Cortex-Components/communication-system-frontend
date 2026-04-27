import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuthFetch } from './useAuthFetch';
import type { Faq, AsyncStatus } from '../types';

interface UseFaqsOptions {
  availablePages: string[];
  config: Record<string, string>;
}

export function useFaqs(
  onUnauthorized: () => void,
  { availablePages, config }: UseFaqsOptions,
) {
  const fetchWithAuth = useAuthFetch(onUnauthorized);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqPage, setFaqPage] = useState('all');
  const [faqStatus, setFaqStatus] = useState<AsyncStatus>('idle');
  const [newFaq, setNewFaq] = useState({ question: '', description: '', answer: '' });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    const fetchPageFaqs = async (page: string): Promise<Faq[]> => {
      const url = `${API_BASE_URL}/api/v1/admin/page/${encodeURIComponent(page)}/faqs`;
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data.map((f) => ({ ...f, page })) : [];
      }
      // Fallback to path-param endpoint
      const fbRes = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/page/${encodeURIComponent(page)}/faqs`,
      );
      if (fbRes.ok) {
        const data = await fbRes.json();
        return Array.isArray(data) ? data.map((f) => ({ ...f, page })) : [];
      }
      return [];
    };

    if (faqPage === 'all') {
      const pages =
        availablePages.length > 0
          ? availablePages
          : (config['VITE_AVAILABLE_PAGES'] || 'home,support').split(',').map((p) => p.trim());

      const results = await Promise.allSettled(pages.map(fetchPageFaqs));
      const allFaqs = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
      setFaqs(allFaqs);
      return;
    }

    try {
      const pageFaqs = await fetchPageFaqs(faqPage);
      setFaqs(pageFaqs);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    }
  }, [faqPage, availablePages, config, fetchWithAuth]);

  const createFaq = useCallback(async (): Promise<boolean> => {
    if (!newFaq.question || !newFaq.answer) {
      alert('Question and Answer are required');
      return false;
    }
    const targetPage = faqPage === 'all' ? 'home' : faqPage;
    setFaqStatus('creating');
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/page/${encodeURIComponent(targetPage)}/faqs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFaq),
        },
      );
      if (res.ok) {
        setFaqStatus('idle');
        setNewFaq({ question: '', description: '', answer: '' });
        await fetchFaqs();
        return true;
      }
      setFaqStatus('error');
      return false;
    } catch {
      setFaqStatus('error');
      return false;
    }
  }, [faqPage, newFaq, fetchFaqs, fetchWithAuth]);

  const updateFaq = useCallback(async (): Promise<boolean> => {
    if (!editingFaqId || !newFaq.question || !newFaq.answer) return false;
    const currentFaq = faqs.find((f) => f.id === editingFaqId);
    const targetPage = currentFaq?.page || faqPage;
    setFaqStatus('saving');
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/admin/page/${encodeURIComponent(targetPage)}/faqs/${editingFaqId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFaq),
        },
      );
      if (res.ok) {
        setFaqStatus('idle');
        setEditingFaqId(null);
        setNewFaq({ question: '', description: '', answer: '' });
        await fetchFaqs();
        return true;
      }
      setFaqStatus('error');
      return false;
    } catch {
      setFaqStatus('error');
      return false;
    }
  }, [editingFaqId, faqPage, faqs, newFaq, fetchFaqs, fetchWithAuth]);

  const deleteFaq = useCallback(
    async (id: string, pageContext?: string): Promise<boolean> => {
      const targetPage = pageContext || faqPage;
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/v1/admin/page/${encodeURIComponent(targetPage)}/faqs/${id}`,
          { method: 'DELETE' },
        );
        if (res.ok) await fetchFaqs();
        return res.ok;
      } catch {
        return false;
      }
    },
    [faqPage, fetchFaqs, fetchWithAuth],
  );

  const startEditing = useCallback((faq: Faq) => {
    setEditingFaqId(faq.id);
    setNewFaq({ question: faq.question, description: faq.description || '', answer: faq.answer });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingFaqId(null);
    setNewFaq({ question: '', description: '', answer: '' });
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return {
    faqs,
    faqPage,
    setFaqPage,
    faqStatus,
    newFaq,
    setNewFaq,
    editingFaqId,
    startEditing,
    cancelEditing,
    createFaq,
    updateFaq,
    deleteFaq,
  };
}
