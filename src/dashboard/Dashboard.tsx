import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Palette, 
  MessageSquare, 
  Globe, 
  Hammer, 
  CheckCircle, 
  AlertCircle, 
  Link, 
  Copy, 
  RefreshCcw,
  Eye,
  EyeOff,
  LogOut,
  Bot,
  FileUp,
  Trash2,
  PlusCircle,
  Layout,
  Shield,
  Key,
  HelpCircle,
  Pencil,
  Mail
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../main';

interface AiConfig {
    business_name?: string;
    business_description?: string;
    ai_tone?: string;
    default_language?: string;
    system_prompt_override?: string;
    grounding_template_override?: string;
    brand_voice_rules?: Record<string, string | number | boolean>;
    custom_intents?: string[];
    escalation_threshold_override?: number;
}

interface KnowledgeStatus {
    chunk_count: number;
    cache_valid: boolean;
    pdf_count?: number;
    pdf_names?: string[];
}

interface Faq {
    id: string;
    page: string;
    question: string;
    description: string;
    answer: string;
}

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string>('idle');
    const [buildLog, setBuildLog] = useState<string>('');
    const [scriptLink, setScriptLink] = useState<string>('');
    const [activeTab, setActiveTab] = useState('general');
    const [showPreview, setShowPreview] = useState(false);
    const [aiConfig, setAiConfig] = useState<AiConfig>({});
    const [savedToast, setSavedToast] = useState(false);
    const [aiStatus, setAiStatus] = useState<string>('idle');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('idle');
    const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus | null>(null);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [faqPage, setFaqPage] = useState<string>('all');
    const [faqStatus, setFaqStatus] = useState<string>('idle');
    const [newFaq, setNewFaq] = useState({ question: '', description: '', answer: '' });
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
    const [tenantApiKey, setTenantApiKey] = useState<string>('');
    const [regeneratingKey, setRegeneratingKey] = useState(false);
    const [availablePages, setAvailablePages] = useState<string[]>([]);
    const [corsOrigins, setCorsOrigins] = useState<string[]>([]);
    const [newCorsOrigin, setNewCorsOrigin] = useState<string>('');
    const [corsOriginError, setCorsOriginError] = useState<string>('');
    const [modal, setModal] = useState<{ 
        show: boolean, 
        title: string, 
        message: string, 
        type: 'success' | 'error' | 'info' | 'confirm',
        onConfirm?: () => void
    }>({ 
        show: false, title: '', message: '', type: 'info' 
    });



    const handleUnauthorized = useCallback(() => {
        onLogout();
    }, [onLogout]);

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            handleUnauthorized();
            throw new Error('Access denied: No authentication token found.');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const res = await fetch(url, { ...options, headers });
        
        if (res.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        return res;
    }, [handleUnauthorized]);
    
    const fetchKnowledgeStatus = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/status`);
            if (res.ok) {
                const data = await res.json();
                setKnowledgeStatus(data);
            } else {
                const text = await res.text();
                console.error(`Failed to fetch knowledge status: ${res.status}`, text);
            }
        } catch (error) {
            console.error('Failed to fetch knowledge status', error);
        }
    }, [fetchWithAuth]);

    const fetchAiConfig = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ai-config`);
            
            if (!res.ok) {
                const text = await res.text();
                console.error(`Failed to fetch AI config: ${res.status}`, text);
                return;
            }

            const data = await res.json();
            // Convert array and object to strings for easier editing in text fields
            setAiConfig({
                ...data,
                brand_voice_rules: data.brand_voice_rules ? JSON.stringify(data.brand_voice_rules, null, 2) : '{}',
                custom_intents: data.custom_intents ? data.custom_intents.join(', ') : ''
            });
        } catch (error) {
            console.error('Failed to fetch AI config', error);
        }
    }, [fetchWithAuth]);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/config`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            } else {
                console.error(`Failed to fetch config: ${res.status}`);
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        }
    }, []);

    const fetchPages = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/pages`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAvailablePages(data.map((p: { page: string }) => p.page));
                }
            }
        } catch (error) {
            console.error('Failed to fetch pages', error);
        }
    }, [fetchWithAuth]);

    const fetchCorsOrigins = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/cors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCorsOrigins(Array.isArray(data.cors_origins) ? data.cors_origins : []);
            }
        } catch (error) {
            console.error('Failed to fetch CORS origins', error);
        }
    }, [fetchWithAuth]);

    const deletePage = useCallback(async (pageToDelete: string) => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/pages/${pageToDelete}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setModal({ show: true, title: 'Success', message: `Page '${pageToDelete}' deleted successfully.`, type: 'success' });
                fetchPages();
                setFaqPage('all');
            } else {
                const txt = await res.text();
                setModal({ show: true, title: 'Error', message: `Failed to delete page: ${txt}`, type: 'error' });
            }
        } catch (error) {
            console.error('Failed to delete page', error);
        }
    }, [fetchPages, fetchWithAuth]);

    const fetchFaqs = useCallback(async () => {
        if (faqPage === 'all') {
            const pagesToFetch = availablePages.length > 0 
                ? availablePages 
                : (config['VITE_AVAILABLE_PAGES'] || 'home,support').split(',').map(p => p.trim());
                
            const allFaqs: Faq[] = [];
            for (const page of pagesToFetch) {
                const url = `${API_BASE_URL}/api/v1/admin/faqs?page=${page}`;
                try {
                    const res = await fetchWithAuth(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            allFaqs.push(...data.map(f => ({ ...f, page })));
                        }
                    } else {
                        // Fallback to path param if query param fails
                        const fbUrl = `${API_BASE_URL}/api/v1/admin/page/${page}/faqs`;
                        const fbRes = await fetchWithAuth(fbUrl);
                        if (fbRes.ok) {
                            const data = await fbRes.json();
                            if (Array.isArray(data)) {
                                allFaqs.push(...data.map(f => ({ ...f, page })));
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error fetching FAQs for ${page}`, e);
                }
            }
            setFaqs(allFaqs);
            return;
        }

        const url = `${API_BASE_URL}/api/v1/admin/faqs?page=${faqPage}`;
        try {
            const res = await fetchWithAuth(url);
            
            if (!res.ok) {
                // If query param fails with 404/405, fallback to path param approach
                if (res.status === 404 || res.status === 405) {
                    const fallbackUrl = `${API_BASE_URL}/api/v1/admin/page/${faqPage}/faqs`;
                    const fallbackRes = await fetchWithAuth(fallbackUrl);
                    if (fallbackRes.ok) {
                        const data = await fallbackRes.json();
                        setFaqs(Array.isArray(data) ? data : []);
                        return;
                    }
                }
                const text = await res.text();
                console.error(`Failed to fetch FAQs (${res.status}):`, text);
                return;
            }

            const data = await res.json();
            setFaqs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch FAQs', error);
        }
    }, [faqPage, availablePages, config, fetchWithAuth]);

    useEffect(() => {
        fetchConfig();
        fetchAiConfig();
        fetchKnowledgeStatus();
        fetchPages();
        fetchFaqs();
        fetchCorsOrigins();
    }, [fetchConfig, fetchAiConfig, fetchKnowledgeStatus, fetchPages, fetchFaqs, fetchCorsOrigins]);
    
    // Also fetch faqs when page changes
    useEffect(() => {
        if (activeTab === 'faqs') {
            fetchFaqs();
        }
    }, [activeTab, fetchFaqs]);

    const handleCreateFaq = useCallback(async () => {
        if (!newFaq.question || !newFaq.answer) {
            alert('Question and Answer are required');
            return;
        }

        setFaqStatus('creating');
        const targetPage = faqPage === 'all' ? 'home' : faqPage; // Default to home if on 'all' view
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/page/${targetPage}/faqs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFaq)
            });
            if (res.ok) {
                setFaqStatus('idle');
                setNewFaq({ question: '', description: '', answer: '' });
                fetchFaqs();
                setModal({ show: true, title: 'Success', message: 'FAQ created successfully!', type: 'success' });
            } else {
                setFaqStatus('error');
                setModal({ show: true, title: 'Error', message: 'Failed to create FAQ.', type: 'error' });
            }
        } catch (error) {
            setFaqStatus('error');
            console.error('Failed to create FAQ', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
        }
    }, [faqPage, newFaq, fetchFaqs, fetchWithAuth]);

    const handleDeleteFaq = useCallback(async (id: string, pageContext?: string) => {
        const targetPage = pageContext || faqPage;
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/page/${targetPage}/faqs/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchFaqs();
                setModal({ show: true, title: 'Success', message: 'FAQ deleted successfully', type: 'success' });
            } else {
                setModal({ show: true, title: 'Error', message: 'Failed to delete FAQ', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to delete FAQ', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
        }
    }, [faqPage, fetchFaqs, fetchWithAuth]);

    const handleUpdateFaq = useCallback(async () => {
        if (!editingFaqId) return;
        if (!newFaq.question || !newFaq.answer) {
            alert('Question and Answer are required');
            return;
        }

        setFaqStatus('saving');
        // We might need to find the page for this FAQ if we're in 'all' view
        const currentFaq = faqs.find(f => f.id === editingFaqId);
        const targetPage = currentFaq?.page || faqPage;

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/page/${targetPage}/faqs/${editingFaqId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFaq)
            });
            if (res.ok) {
                setFaqStatus('idle');
                setEditingFaqId(null);
                setNewFaq({ question: '', description: '', answer: '' });
                fetchFaqs();
                setModal({ show: true, title: 'Success', message: 'FAQ updated successfully!', type: 'success' });
            } else {
                setFaqStatus('error');
                setModal({ show: true, title: 'Error', message: 'Failed to update FAQ.', type: 'error' });
            }
        } catch (error) {
            setFaqStatus('error');
            console.error('Failed to update FAQ', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
        }
    }, [faqPage, faqs, editingFaqId, newFaq, fetchFaqs, fetchWithAuth]);

    const handleRegenerateApiKey = useCallback(async () => {
        setRegeneratingKey(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/regenerate-api-key`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok && data.api_key) {
                setTenantApiKey(data.api_key);
                setModal({ 
                    show: true, 
                    title: 'New API Key Generated', 
                    message: 'Your new API key has been generated. Please copy it now as it will not be shown again for security reasons.', 
                    type: 'success' 
                });
            } else {
                setModal({ show: true, title: 'Error', message: 'Failed to regenerate API key.', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to regenerate API key', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setRegeneratingKey(false);
        }
    }, [fetchWithAuth]);

    const handleSaveConfig = async () => {
        setStatus('saving');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setStatus('idle');
                setSavedToast(true);
                setTimeout(() => setSavedToast(false), 3000);
            }
        } catch (error) {
            setStatus('error');
            console.error('Failed to save config', error);
        }
    };

    const handleSaveAiConfig = async () => {
        setAiStatus('saving');
        const token = localStorage.getItem('admin_token');
        
        // Prepare config for API (convert strings back to object/array/number)
        let payload;
        try {
            payload = {
                ...aiConfig,
                brand_voice_rules: typeof aiConfig.brand_voice_rules === 'string' 
                    ? JSON.parse(aiConfig.brand_voice_rules || '{}') 
                    : aiConfig.brand_voice_rules,
                custom_intents: typeof aiConfig.custom_intents === 'string'
                    ? (aiConfig.custom_intents as string).split(',').map(i => i.trim()).filter(i => i !== '')
                    : aiConfig.custom_intents,
                escalation_threshold_override: Number(aiConfig.escalation_threshold_override || 0)
            };
        } catch (e) {
            alert('Invalid JSON in Brand Voice Rules. Please check your syntax.');
            setAiStatus('error');
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ai-config`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setAiStatus('idle');
                setSavedToast(true);
                setTimeout(() => setSavedToast(false), 3000);
            }
        } catch (error) {
            setAiStatus('error');
            console.error('Failed to save AI config', error);
        }
    };

    const handleUploadPdfs = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }

        setUploadStatus('uploading');
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/upload/batch`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setUploadStatus('success');
                setSelectedFiles(null);
                fetchKnowledgeStatus(); // Refresh status after upload
                setModal({ show: true, title: 'Success', message: 'Files uploaded successfully!', type: 'success' });
                setTimeout(() => setUploadStatus('idle'), 3000);
            } else {
                setUploadStatus('error');
                setModal({ show: true, title: 'Error', message: 'Failed to upload files.', type: 'error' });
            }
        } catch (error) {
            setUploadStatus('error');
            console.error('Failed to upload PDFs', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred during upload.', type: 'error' });
        }
    };

    const handleDeletePdf = async (filename: string) => {
        if (!filename) return;

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/pdf/${filename}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setModal({ show: true, title: 'Success', message: 'File deleted successfully', type: 'success' });
                fetchKnowledgeStatus(); // Refresh status
            } else {
                setModal({ show: true, title: 'Error', message: 'Failed to delete file', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to delete PDF', error);
            setModal({ show: true, title: 'Error', message: 'An unexpected error occurred during deletion.', type: 'error' });
        }
    };

    const handleBuild = async () => {
        // Save the config to .env before building
        await handleSaveConfig();
        
        setStatus('building');
        setBuildLog('Starting build process...');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/build`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setBuildLog(data.stdout || 'Build completed successfully.');
                setScriptLink(data.scriptLink);
                setStatus('success');
            } else {
                setBuildLog(data.details || 'Build failed.');
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
            setBuildLog('Network error occurred during build.');
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleAiInputChange = (key: keyof AiConfig, value: unknown) => {
        setAiConfig((prev: AiConfig) => ({ ...prev, [key]: value }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    // Validate URL using regex - must be valid URL or just "*"
    const isValidCorsOrigin = (url: string): { valid: boolean; error?: string } => {
        const trimmed = url.trim();
        
        if (!trimmed) {
            return { valid: false, error: 'Origin cannot be empty' };
        }
        
        if (trimmed === '*') {
            return { valid: true };
        }
        
        // Regex for valid HTTP/HTTPS URL
        const urlRegex = /^https?:\/\/(?:localhost(:\d+)?|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\/[^\s]*)?$/;
        
        if (!urlRegex.test(trimmed)) {
            return { valid: false, error: 'Invalid URL format. Must start with http:// or https://' };
        }
        
        return { valid: true };
    };

    const handleAddCorsOrigin = () => {
        const trimmed = newCorsOrigin.trim();
        
        // Check for duplicates
        if (trimmed && corsOrigins.includes(trimmed)) {
            setCorsOriginError('This origin already exists in the list');
            return;
        }
        
        // Validate
        const validation = isValidCorsOrigin(trimmed);
        if (!validation.valid) {
            setCorsOriginError(validation.error || 'Invalid origin');
            return;
        }
        
        // Add to list
        setCorsOrigins([...corsOrigins, trimmed]);
        setNewCorsOrigin('');
        setCorsOriginError('');
    };

    const handleRemoveCorsOrigin = (origin: string) => {
        setCorsOrigins(corsOrigins.filter(o => o !== origin));
    };

    const handleCorsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCorsOrigin();
        }
    };

    const handleUpdateCorsOrigins = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/cors`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    cors_origins: corsOrigins.length > 0 ? corsOrigins : ['*'] 
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.notification_email) {
                    handleInputChange('VITE_SUPPORT_EMAIL', data.notification_email);
                }
                setModal({ show: true, title: 'Success', message: 'CORS settings updated successfully!', type: 'success' });
            } else {
                const txt = await res.text();
                setModal({ show: true, title: 'Error', message: `Update failed: ${txt}`, type: 'error' });
            }
        } catch (error) {
            setModal({ show: true, title: 'Error', message: 'Network error occurred.', type: 'error' });
        }
    };

    const configGroups: Record<string, { key?: string, id?: string, label: string, type: string, default?: string }[]> = {
        general: [
            { key: 'VITE_APP_NAME', label: 'App Name', type: 'text' },
            { key: 'VITE_SUPPORT_EMAIL', label: 'Support Email', type: 'email' },
            { key: 'VITE_WIDGET_TAG_NAME', label: 'Widget Tag Name', type: 'text', default: 'cortex-chat-widget' },
            { key: 'VITE_AVAILABLE_PAGES', label: 'Available Pages (comma separated)', type: 'text', default: 'home,support' },
            { key: 'VITE_AVAILABLE_ROLES', label: 'Available Roles (comma separated)', type: 'text', default: 'dev,user' },
            { key: 'VITE_DEFAULT_ROLE', label: 'Default Role', type: 'text', default: 'dev' },
            { key: 'VITE_DEFAULT_PAGE', label: 'Default Page', type: 'text', default: 'home' },
            { key: 'VITE_API_BASE_URL', label: 'API Base URL', type: 'text' },
        ],
        appearance: [
            { key: 'VITE_COLOR_PRIMARY', label: 'Primary Color', type: 'color', default: '#2B3D55' },
            { key: 'VITE_COLOR_SECONDARY', label: 'Secondary Color', type: 'color', default: '#F2DCB3' },
        ],
        content: [
            { key: 'VITE_WELCOME_TITLE', label: 'Welcome Title', type: 'text', default: 'Hi There!' },
            { key: 'VITE_WELCOME_SUBTITLE', label: 'Welcome Subtitle', type: 'textarea', default: 'How can we help?' },
            { key: 'VITE_WELCOME_PROMPT', label: 'Option Prompt', type: 'text', default: 'Please select an option below' },
            { key: 'VITE_WELCOME_CHAT_BTN', label: 'Chat Button Text', type: 'text', default: 'Chat with us' },
            { key: 'VITE_WELCOME_FOLLOW_BTN', label: 'Follow Button Text', type: 'text', default: 'Follow previous request' },
        ],
        persona: [
            { key: 'VITE_ASSISTANT_NAME', label: 'Assistant Name', type: 'text' },
            { key: 'VITE_DEFAULT_USER_NAME', label: 'Default User Name', type: 'text' },
            { key: 'VITE_DEFAULT_USER_ID', label: 'Default User ID', type: 'number' },
        ],
        ai: [
            { key: 'business_name', label: 'Business Identity', type: 'text', default: 'Support AI' },
            { key: 'business_description', label: 'Core Business Description', type: 'textarea' },
            { key: 'ai_tone', label: 'Conversational Tone', type: 'text', default: 'professional' },
            { id: 'divider-1', label: 'Knowledge & Guidance', type: 'divider' },
            { key: 'default_language', label: 'Default Response Language', type: 'text', default: 'en' },
            { key: 'system_prompt_override', label: 'Primary System Prompt', type: 'textarea' },
            { key: 'grounding_template_override', label: 'Context Grounding Template', type: 'textarea' },
            { id: 'divider-2', label: 'Advanced Behavior', type: 'divider' },
            { key: 'brand_voice_rules', label: 'Brand Voice Rules (JSON)', type: 'textarea', default: '{}' },
            { key: 'custom_intents', label: 'Custom Interaction Intents', type: 'text', default: '' },
            { key: 'escalation_threshold_override', label: 'Human Escalation Threshold', type: 'number', default: '0' },
        ],
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 italic-none">
            {/* Background decorative gradients */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 relative z-10">
                {/* Header */}
                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 lg:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Settings className="text-white w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base max-w-xl">Configure and manage your intelligent chat infrastructure from one central command center.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full lg:w-auto">
                        <button 
                            onClick={activeTab === 'ai' ? handleSaveAiConfig : handleSaveConfig}
                            disabled={status === 'saving' || aiStatus === 'saving'}
                            className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-5 sm:py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all group shadow-sm active:scale-95"
                        >
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                {(status === 'saving' || aiStatus === 'saving') ? <RefreshCcw size={18} className="animate-spin" /> : <Settings size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:rotate-45 transition-all" />}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-indigo-600">Save Changes</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-5 sm:py-2.5 rounded-2xl transition-all shadow-sm active:scale-95 border ${
                                showPreview 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                            <span className="text-xs sm:text-sm font-bold">Live Preview</span>
                        </button>

                        <button 
                            onClick={handleBuild}
                            disabled={status === 'building'}
                            className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-6 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-bold shadow-xl shadow-indigo-900/10 active:scale-95"
                        >
                            <div className="p-2 bg-white/20 rounded-lg">
                                {status === 'building' ? <RefreshCcw size={18} className="animate-spin" /> : <Hammer size={18} />}
                            </div>
                            <span className="text-xs sm:text-sm">Deploy Widget</span>
                        </button>
                        
                        <button 
                            onClick={onLogout}
                            className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-5 sm:py-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-all font-bold active:scale-95 group"
                        >
                            <div className="p-2 bg-white/50 rounded-lg group-hover:scale-110 transition-transform">
                                <LogOut size={18} />
                            </div>
                            <span className="text-xs sm:text-sm">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="col-span-12 lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-1 sm:p-1.5 bg-slate-100/50 lg:bg-white/60 backdrop-blur-md rounded-[1.25rem] lg:rounded-2xl border border-slate-200/60 lg:border-slate-200 shadow-inner lg:shadow-sm scrollbar-hide">
                            {[
                                { id: 'general', icon: Settings, label: 'General' },
                                { id: 'content', icon: Layout, label: 'Content & UI' },
                                { id: 'persona', icon: Globe, label: 'Assistant' },
                                { id: 'ai', icon: Bot, label: 'AI Configuration' },
                                { id: 'knowledge', icon: FileUp, label: 'Knowledge' },
                                { id: 'faqs', icon: HelpCircle, label: 'FAQs Management' },
                                { id: 'security', icon: Shield, label: 'Security & API' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 lg:py-3.5 rounded-xl lg:rounded-xl text-[13px] lg:text-sm font-bold transition-all duration-300 whitespace-nowrap lg:w-full group/tab ${
                                        activeTab === tab.id 
                                        ? 'bg-white lg:bg-gradient-to-r lg:from-indigo-600 lg:to-violet-600 text-indigo-600 lg:text-white shadow-md lg:shadow-xl lg:shadow-indigo-600/20 lg:translate-x-2 lg:border-l-4 lg:border-indigo-400' 
                                        : 'text-slate-500 hover:text-slate-900 lg:hover:bg-white lg:hover:text-indigo-600 lg:hover:shadow-md lg:hover:translate-x-1'
                                    }`}
                                >
                                    <tab.icon size={16} className={`flex-shrink-0 transition-transform ${activeTab === tab.id ? 'scale-110 lg:text-white' : 'group-hover/tab:scale-110'}`} />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 lg:bg-white animate-pulse hidden lg:block"></div>
                                    )}
                                </button>
                            ))}
                        </nav>
                        
                        {/* Status Card */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-500/10"></div>
                            <h3 className="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-slate-400">System Engine</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500">Infrastructure</span>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg">
                                        <div className={`w-2 h-2 rounded-full ${status === 'building' ? 'bg-amber-400 animate-pulse' : status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                                        <span className="text-[10px] font-black uppercase text-slate-700">{status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500">Core Version</span>
                                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100/50">v1.2.4-stable</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-9 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="p-5 sm:p-10">
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                                    <span className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-2 rounded-lg shadow-md">                                        {(() => {
                                            const tab = [
                                                { id: 'general', icon: Settings },
                                                { id: 'content', icon: Layout },
                                                { id: 'persona', icon: Globe },
                                                { id: 'ai', icon: Bot },
                                                { id: 'knowledge', icon: FileUp },
                                                { id: 'faqs', icon: HelpCircle },
                                                { id: 'security', icon: Shield },
                                            ].find(t => t.id === activeTab);
                                            return tab && <tab.icon size={20} />;
                                        })()}
                                    </span>
                                    {activeTab === 'knowledge' ? 'Knowledge Assets' : 
                                     activeTab === 'faqs' ? 'FAQ Management' :
                                     activeTab === 'security' ? 'Security & API Access' :
                                     activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Configuration'}
                                </h2>

                                {activeTab === 'security' ? (
                                    <div className="space-y-10">
                                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                                        <Key size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-800">Tenant API Key</h3>
                                                        <p className="text-sm text-slate-500 font-medium">Authentication for your chat widget requests</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Active Key</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-mono text-sm text-slate-600 truncate">
                                                                {tenantApiKey || '••••••••••••••••••••••••••••••••'}
                                                            </div>
                                                            {tenantApiKey && (
                                                                <button 
                                                                    onClick={() => copyToClipboard(tenantApiKey)}
                                                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <Copy size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                                            <AlertCircle size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-1">Warning: Regenerating Key</h4>
                                                            <p className="text-sm text-amber-700 leading-relaxed">
                                                                Regenerating your API key will immediately invalidate the current one. Any active chat widgets using the old key will stop functioning until they are updated with the new key.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={() => {
                                                                setModal({
                                                                    show: true,
                                                                    title: 'Confirm Key Regeneration',
                                                                    message: 'Are you sure you want to regenerate your API key? This will break existing integrations until they are updated.',
                                                                    type: 'confirm',
                                                                    onConfirm: handleRegenerateApiKey
                                                                });
                                                            }}
                                                            disabled={regeneratingKey}
                                                            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                                        >
                                                            {regeneratingKey ? <RefreshCcw size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
                                                            Regenerate New Key
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100">
                                                        <Shield size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-800">CORS Origins</h3>
                                                        <p className="text-sm text-slate-500 font-medium">Whitelist domains authorized to use your chat widget</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Origin List */}
                                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Origins ({corsOrigins.length})</label>
                                                            {corsOrigins.length > 0 && (
                                                                <button
                                                                    onClick={() => setCorsOrigins([])}
                                                                    className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider"
                                                                >
                                                                    Clear All
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {corsOrigins.length > 0 ? (
                                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                {corsOrigins.map((origin, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="group flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl transition-all"
                                                                    >
                                                                        <Globe size={16} className="flex-shrink-0 text-violet-500" />
                                                                        <span className="flex-1 font-mono text-sm text-slate-700 truncate">{origin}</span>
                                                                        <button
                                                                            onClick={() => handleRemoveCorsOrigin(origin)}
                                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                            title="Remove origin"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-slate-400">
                                                                <Globe size={32} className="mx-auto mb-2 opacity-30" />
                                                                <p className="text-xs font-medium">No origins added. Use "*" to allow all origins.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Add New Origin */}
                                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Add New Origin</label>
                                                        <div className="flex gap-3">
                                                            <input
                                                                type="text"
                                                                value={newCorsOrigin}
                                                                onChange={(e) => {
                                                                    setNewCorsOrigin(e.target.value);
                                                                    setCorsOriginError('');
                                                                }}
                                                                onKeyDown={handleCorsKeyDown}
                                                                className={`flex-1 px-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-2 focus:ring-violet-500/10 focus:outline-none transition-all font-mono text-sm text-slate-700 placeholder:text-slate-300 shadow-inner ${
                                                                    corsOriginError 
                                                                        ? 'border-rose-400 focus:border-rose-500' 
                                                                        : 'border-slate-200 focus:border-violet-500'
                                                                }`}
                                                                placeholder="https://example.com or *"
                                                            />
                                                            <button
                                                                onClick={handleAddCorsOrigin}
                                                                disabled={!newCorsOrigin.trim()}
                                                                className="px-6 py-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all font-black shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <PlusCircle size={18} />
                                                                Add
                                                            </button>
                                                        </div>
                                                        {corsOriginError ? (
                                                            <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                                                <AlertCircle size={12} />
                                                                {corsOriginError}
                                                            </p>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-400">Press Enter or click Add to add the origin to the list</p>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={handleUpdateCorsOrigins}
                                                            className="px-8 py-3.5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all font-black shadow-xl shadow-violet-200 flex items-center gap-3 active:scale-95"
                                                        >
                                                            <CheckCircle size={20} />
                                                            Update CORS Policy
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                                                        <Mail size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-800">Notification Channels</h3>
                                                        <p className="text-sm text-slate-500 font-medium">Configure where you receive system alerts and human escalation requests</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Primary Alert Email</label>
                                                        <input 
                                                            type="email"
                                                            value={config['VITE_SUPPORT_EMAIL'] || ''}
                                                            onChange={(e) => handleInputChange('VITE_SUPPORT_EMAIL', e.target.value)}
                                                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner"
                                                            placeholder="alerts@yourbusiness.com"
                                                        />
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant/notification-email`, {
                                                                        method: 'PUT',
                                                                        headers: { 
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({ 
                                                                            notification_email: config['VITE_SUPPORT_EMAIL'] || '' 
                                                                        })
                                                                    });
                                                                    if (res.ok) {
                                                                        const data = await res.json();
                                                                        if (Array.isArray(data.cors_origins)) {
                                                                            setCorsOrigins(data.cors_origins);
                                                                        }
                                                                        setModal({ show: true, title: 'Success', message: 'Notification settings updated successfully!', type: 'success' });
                                                                    } else {
                                                                        const txt = await res.text();
                                                                        setModal({ show: true, title: 'Error', message: `Update failed: ${txt}`, type: 'error' });
                                                                    }
                                                                } catch (error) {
                                                                    setModal({ show: true, title: 'Error', message: 'Network error occurred.', type: 'error' });
                                                                }
                                                            }}
                                                            className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black shadow-xl shadow-emerald-200 flex items-center gap-3 active:scale-95"
                                                        >
                                                            <CheckCircle size={20} />
                                                            Save Notification Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'knowledge' ? (
                                    <div className="space-y-10">
                                        {knowledgeStatus && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Training Chunks</p>
                                                    <div className="flex items-end gap-2">
                                                        <p className="text-4xl font-black text-slate-900 leading-none">{knowledgeStatus.chunk_count || 0}</p>
                                                        <p className="text-sm font-medium text-slate-400 mb-1">Indexed</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cache Integrity</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${knowledgeStatus.cache_valid ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.5)]'}`}></div>
                                                        <p className="text-xl font-bold text-slate-900">{knowledgeStatus.cache_valid ? 'Verified' : 'Syncing...'}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-2">{knowledgeStatus.cache_valid ? 'System is fully optimized.' : 'Rebuilding index from new assets.'}</p>
                                                </div>
                                                <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md md:col-span-2">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Uploaded Assets ({knowledgeStatus.pdf_count || 0})</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {knowledgeStatus.pdf_names && knowledgeStatus.pdf_names.length > 0 ? (
                                                            knowledgeStatus.pdf_names.map((name, i) => (
                                                                <div key={i} className="group/file flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-slate-300 transition-all shadow-sm">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                                    <span className="max-w-[200px] truncate">{name}</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setModal({
                                                                                show: true,
                                                                                title: 'Confirm Deletion',
                                                                                message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
                                                                                type: 'confirm',
                                                                                onConfirm: () => handleDeletePdf(name)
                                                                            });
                                                                        }}
                                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/file:opacity-100"
                                                                        title="Delete asset"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-slate-400">No documents indexed yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="group relative p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                <FileUp size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2">Feed your AI</h3>
                                            <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">
                                                Upload PDF documentation to enhance your assistant's expertise. The knowledge base is updated instantly.
                                            </p>
                                            
                                            <input 
                                                type="file" 
                                                id="pdf-upload"
                                                multiple 
                                                accept=".pdf" 
                                                onChange={(e) => setSelectedFiles(e.target.files)}
                                                className="hidden"
                                            />
                                            <label 
                                                htmlFor="pdf-upload"
                                                className="px-8 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition-all font-bold text-slate-700 shadow-sm cursor-pointer active:scale-95 flex items-center gap-3"
                                            >
                                                <Link size={18} />
                                                Choose Documents
                                            </label>

                                            {selectedFiles && selectedFiles.length > 0 && (
                                                <div className="mt-8 w-full max-w-md bg-white border border-slate-200 rounded-[1.5rem] p-5 shadow-xl animate-in zoom-in-95 duration-300">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Queue ({selectedFiles.length})</p>
                                                        <button onClick={() => setSelectedFiles(null)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase">Clear All</button>
                                                    </div>
                                                    <ul className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                                                        {Array.from(selectedFiles).map((file, i) => (
                                                            <li key={i} className="text-sm text-slate-700 font-medium flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">PDF</div>
                                                                <span className="truncate flex-1">{file.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-center sm:justify-end">
                                            <button 
                                                onClick={handleUploadPdfs}
                                                disabled={uploadStatus === 'uploading' || !selectedFiles}
                                                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[1.25rem] hover:opacity-90 transition-all font-black shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                            >
                                                {uploadStatus === 'uploading' ? <RefreshCcw size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                                Synchronize Data
                                            </button>
                                        </div>


                                    </div>
                                ) : activeTab === 'faqs' ? (
                                    <div className="space-y-10">
                                        {/* Page Selector */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Select Context</h4>
                                                <p className="text-xs text-slate-400 font-medium">Manage FAQs for a specific page</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select 
                                                    value={faqPage}
                                                    onChange={(e) => setFaqPage(e.target.value)}
                                                    className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all font-bold text-slate-700 shadow-sm"
                                                >
                                                    <option value="all">ALL PAGES</option>
                                                    {(availablePages.length > 0 ? availablePages : (config['VITE_AVAILABLE_PAGES'] || 'home,support').split(',')).map(p => (
                                                        <option key={p.trim()} value={p.trim()}>{p.trim().toUpperCase()}</option>
                                                    ))}
                                                </select>

                                                {faqPage !== 'all' && (
                                                    <button 
                                                        onClick={() => {
                                                            setModal({
                                                                show: true,
                                                                title: 'Delete Page',
                                                                message: `Are you sure you want to delete the '${faqPage}' page and all its FAQs? This cannot be undone.`,
                                                                type: 'confirm',
                                                                onConfirm: () => deletePage(faqPage)
                                                            });
                                                        }}
                                                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                        title="Delete this page"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* FAQ List */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Stored Questions ({faqs.length})</h4>
                                            </div>
                                            
                                            {faqs.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {faqs.map((faq) => (
                                                        <div key={faq.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-xl hover:border-slate-300">
                                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                                <div className="flex flex-col gap-1">
                                                                    {faqPage === 'all' && (
                                                                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-md w-fit mb-1">
                                                                            {faq.page}
                                                                        </span>
                                                                    )}
                                                                    <h5 className="font-black text-slate-800 leading-tight">{faq.question}</h5>
                                                                </div>
                                                                <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                                                        <button 
                                                                            onClick={() => {
                                                                                setEditingFaqId(faq.id);
                                                                                setNewFaq({
                                                                                    question: faq.question,
                                                                                    description: faq.description || '',
                                                                                    answer: faq.answer
                                                                                });
                                                                                // Scroll to form
                                                                                document.getElementById('faq-form-container')?.scrollIntoView({ behavior: 'smooth' });
                                                                            }}
                                                                            className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                                            title="Edit FAQ"
                                                                        >
                                                                            <Pencil size={18} />
                                                                        </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setModal({
                                                                                show: true,
                                                                                title: 'Delete FAQ',
                                                                                message: 'Are you sure you want to delete this FAQ? This cannot be undone.',
                                                                                type: 'confirm',
                                                                                onConfirm: () => handleDeleteFaq(faq.id, faq.page)
                                                                            });
                                                                        }}
                                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                        title="Delete FAQ"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
                                                            {faq.description && (
                                                                <p className="mt-3 text-[10px] text-slate-400 font-medium italic">Internal Note: {faq.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                                                    <HelpCircle size={40} className="mx-auto text-slate-200 mb-4" />
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No FAQs defined for this page</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add FAQ Form */}
                                        <div id="faq-form-container" className="bg-white border border-slate-200 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                            
                                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${editingFaqId ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-200'}`}>
                                                    {editingFaqId ? <Pencil size={24} /> : <HelpCircle size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-slate-800">{editingFaqId ? 'Update FAQ' : 'Add New FAQ'}</h3>
                                                        {editingFaqId && (
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingFaqId(null);
                                                                    setNewFaq({ question: '', description: '', answer: '' });
                                                                }}
                                                                className="text-[10px] font-black text-rose-500 uppercase hover:underline"
                                                            >
                                                                Cancel Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{editingFaqId ? 'Currently modifying selection' : 'Train your assistant with context'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-8 relative z-10">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-black text-slate-800 uppercase tracking-widest">Question</label>
                                                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={newFaq.question}
                                                        onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                                                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner hover:bg-white"
                                                        placeholder="e.g. How do I reset my password?"
                                                    />
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-black text-slate-800 uppercase tracking-widest">Answer</label>
                                                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                                    </div>
                                                    <textarea 
                                                        value={newFaq.answer}
                                                        onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                                                        rows={4}
                                                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner hover:bg-white resize-none"
                                                        placeholder="Provide a clear, helpful response..."
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Internal Note (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        value={newFaq.description}
                                                        onChange={(e) => setNewFaq(prev => ({ ...prev, description: e.target.value }))}
                                                        className="w-full px-5 py-4 bg-slate-50/30 border border-slate-100 rounded-2xl focus:border-slate-400 focus:outline-none transition-all text-xs font-medium text-slate-500 placeholder:text-slate-200"
                                                        placeholder="Context for support team..."
                                                    />
                                                </div>
                                                
                                                <button 
                                                    onClick={editingFaqId ? handleUpdateFaq : handleCreateFaq}
                                                    disabled={faqStatus === 'creating' || faqStatus === 'saving'}
                                                    className={`w-full mt-4 text-white py-5 rounded-3xl font-black text-lg transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${editingFaqId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:drop-shadow-lg shadow-indigo-600/20'}`}
                                                >
                                                    {(faqStatus === 'creating' || faqStatus === 'saving') ? <RefreshCcw size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                                    {editingFaqId ? 'Update FAQ Content' : 'Publish FAQ'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        {(configGroups[activeTab as keyof typeof configGroups] || []).map((field, idx) => (
                                            field.type === 'divider' ? (
                                                <div key={`div-${idx}`} className="pt-8 pb-2 border-b border-slate-100 mb-4">
                                                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em]">{field.label}</h4>
                                                </div>
                                            ) : (
                                                <div key={field.key || field.id || idx} className="space-y-3 group">
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <label className="text-sm font-black text-slate-900 uppercase tracking-wider">{field.label}</label>
                                                                {activeTab === 'ai' && <div className="w-1 h-1 rounded-full bg-indigo-400"></div>}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{field.key}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="relative">
                                                        {field.type === 'textarea' ? (
                                                                <textarea 
                                                                    value={activeTab === 'ai' 
                                                                        ? (field.key ? (aiConfig[field.key as keyof AiConfig] as string || '') : '') 
                                                                        : (field.key ? (config[field.key] || '') : '')} 
                                                                    onChange={(e) => field.key && (activeTab === 'ai' ? handleAiInputChange(field.key as keyof AiConfig, e.target.value) : handleInputChange(field.key, e.target.value))}
                                                                    rows={activeTab === 'ai' ? (field.key === 'brand_voice_rules' ? 8 : 4) : 3}
                                                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-300 shadow-inner group-hover:bg-white"
                                                                    placeholder={field.default || `Specify ${field.label.toLowerCase()}...`}
                                                                />
                                                        ) : field.type === 'color' ? (
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-slate-200">
                                                                    <input 
                                                                        type="color" 
                                                                        value={(field.key && config[field.key]) || field.default || '#000000'} 
                                                                        onChange={(e) => field.key && handleInputChange(field.key, e.target.value)}
                                                                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                                                    />
                                                                </div>
                                                                <input 
                                                                    type="text" 
                                                                    value={(field.key && config[field.key]) || field.default || ''} 
                                                                    onChange={(e) => field.key && handleInputChange(field.key, e.target.value)}
                                                                    className="flex-1 px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-mono uppercase tracking-widest text-sm shadow-inner group-hover:bg-white"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <input 
                                                                type={field.type} 
                                                                value={activeTab === 'ai' 
                                                                    ? (field.key ? (aiConfig[field.key as keyof AiConfig] as string || '') : '') 
                                                                    : (field.key ? (config[field.key] || '') : '')} 
                                                                onChange={(e) => field.key && (activeTab === 'ai' ? handleAiInputChange(field.key as keyof AiConfig, e.target.value) : handleInputChange(field.key, e.target.value))}
                                                                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner group-hover:bg-white"
                                                                placeholder={field.default || `Specify ${field.label.toLowerCase()}...`}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Build Results Section */}
                        {(status === 'success' || status === 'building' || status === 'error') && (
                            <div className={`rounded-[2rem] border p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 ${
                                status === 'success' ? 'bg-emerald-50/50 border-emerald-100 shadow-emerald-200/20' : 
                                status === 'error' ? 'bg-rose-50/50 border-rose-100 shadow-rose-200/20' : 
                                'bg-slate-50/50 border-slate-200 shadow-slate-200/20'
                            }`}>
                                <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-xl text-white ${
                                                status === 'success' ? 'bg-emerald-500' : 
                                                status === 'error' ? 'bg-rose-500' : 
                                                'bg-slate-500'
                                            }`}>
                                                {status === 'success' && <CheckCircle size={20} />}
                                                {status === 'error' && <AlertCircle size={20} />}
                                                {status === 'building' && <RefreshCcw size={20} className="animate-spin" />}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">Deployment Pipeline</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm">Automated build and script generation results.</p>
                                    </div>
                                    {status === 'success' && scriptLink && (
                                        <button 
                                            onClick={() => {
                                                const tag = config['VITE_WIDGET_TAG_NAME'] || 'cortex-chat-widget';
                                                copyToClipboard(`<script src="${scriptLink}"></script>\n<${tag}></${tag}>`);
                                            }}
                                            className="w-full xl:w-auto px-6 py-3 bg-white text-emerald-700 rounded-xl border-2 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-3 font-black shadow-lg shadow-emerald-700/5 active:scale-95"
                                        >
                                            <Copy size={18} /> Copy Integration Code
                                        </button>
                                    )}
                                </div>

                                {scriptLink && status === 'success' && (
                                    <div className="mb-8 space-y-3">
                                        <label className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] block">Script Origin</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 px-5 py-4 bg-white/80 border border-emerald-100 rounded-2xl font-mono text-sm text-emerald-900 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-inner">
                                                {scriptLink}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(scriptLink)}
                                                className="p-4 bg-white text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm active:scale-90"
                                            >
                                                <Link size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Runtime Console</label>
                                    <pre className="w-full bg-[#1e293b] text-slate-100 p-8 rounded-[1.5rem] font-mono text-xs overflow-x-auto max-h-80 shadow-2xl scrollbar-thin">
                                        {buildLog || '// Waiting for deployment...'}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showPreview && (() => {
                const primary = config['VITE_COLOR_PRIMARY'] || '#2B3D55';
                const secondary = config['VITE_COLOR_SECONDARY'] || '#F2DCB3';
                const liveConfig = JSON.stringify({
                    colors: { 
                        primary, 
                        secondary,
                        primaryText: primary 
                    },
                    content: {
                        welcome: {
                            title: config['VITE_WELCOME_TITLE'] || 'Hi There!',
                            subtitle: config['VITE_WELCOME_SUBTITLE'] || 'How can we help?',
                            optionPrompt: config['VITE_WELCOME_PROMPT'] || 'Please select an option below',
                            chatBtn: config['VITE_WELCOME_CHAT_BTN'] || 'Chat with us',
                            followBtn: config['VITE_WELCOME_FOLLOW_BTN'] || 'Follow previous request',
                        }
                    },
                    assistant: {
                        name: config['VITE_ASSISTANT_NAME'] || 'Assistant',
                    },
                    user: {
                        id: parseInt(config['VITE_DEFAULT_USER_ID'] || '0'),
                        name: config['VITE_DEFAULT_USER_NAME'] || 'Guest',
                    },
                });
                const tag = import.meta.env.VITE_WIDGET_TAG_NAME || 'cortex-chat-widget';
                return React.createElement(tag, { config: liveConfig });
            })()}
            {savedToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle size={20} className="text-white" />
                    Configuration saved successfully!
                </div>
            )}

            {/* Premium Modal */}
            {modal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-white max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className={`h-2 w-full ${modal.type === 'success' ? 'bg-emerald-500' : modal.type === 'error' ? 'bg-rose-500' : 'bg-slate-900'}`}></div>
                        <div className="p-10 text-center">
                            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${
                                modal.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                                modal.type === 'error' ? 'bg-rose-50 text-rose-500' : 
                                modal.type === 'confirm' ? 'bg-amber-50 text-amber-500' :
                                'bg-slate-50 text-slate-900'
                            }`}>
                                {modal.type === 'success' ? <CheckCircle size={40} /> : 
                                 modal.type === 'error' ? <AlertCircle size={40} /> : 
                                 modal.type === 'confirm' ? <Trash2 size={40} /> :
                                 <Bot size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">{modal.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-10">{modal.message}</p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        if (modal.type === 'confirm' && modal.onConfirm) {
                                            modal.onConfirm();
                                        }
                                        setModal({ ...modal, show: false });
                                    }}
                                    className={`w-full py-4 text-white rounded-2xl transition-all font-black shadow-xl active:scale-95 ${
                                        modal.type === 'confirm' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-600/20'
                                    }`}
                                >
                                    {modal.type === 'confirm' ? 'Confirm Deletion' : 'Acknowledge'}
                                </button>
                                
                                {modal.type === 'confirm' && (
                                    <button 
                                        onClick={() => setModal({ ...modal, show: false })}
                                        className="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
