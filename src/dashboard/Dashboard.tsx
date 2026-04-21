import React, { useState, useEffect } from 'react';
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
  Trash2
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

    useEffect(() => {
        fetchConfig();
        fetchAiConfig();
        fetchKnowledgeStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUnauthorized = () => {
        onLogout();
    };

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, options);
        if (res.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }
        return res;
    };

    const fetchKnowledgeStatus = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setKnowledgeStatus(data);
        } catch (error) {
            console.error('Failed to fetch knowledge status', error);
        }
    };

    const fetchAiConfig = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/tenant-ai-config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/config`);
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error('Failed to fetch config', error);
        }
    };

    const handleSaveConfig = async () => {
        setStatus('saving');
        try {
            const res = await fetch(`${API_BASE_URL}/api/config`, {
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        const token = localStorage.getItem('admin_token');
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/upload/batch`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (res.ok) {
                setUploadStatus('success');
                setSelectedFiles(null);
                fetchKnowledgeStatus(); // Refresh status after upload
                alert('Files uploaded successfully!');
                setTimeout(() => setUploadStatus('idle'), 3000);
            } else {
                setUploadStatus('error');
                alert('Failed to upload files.');
            }
        } catch (error) {
            setUploadStatus('error');
            console.error('Failed to upload PDFs', error);
        }
    };

    const handleDeletePdf = async (filename: string) => {
        if (!filename) return;
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/v1/admin/knowledge/pdf/${filename}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('File deleted successfully');
                fetchKnowledgeStatus(); // Refresh status
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Failed to delete PDF', error);
        }
    };

    const handleBuild = async () => {
        // Save the config to .env before building
        await handleSaveConfig();
        
        setStatus('building');
        setBuildLog('Starting build process...');
        try {
            const res = await fetch(`${API_BASE_URL}/api/build`, { method: 'POST' });
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

    const configGroups: Record<string, { key: string, label: string, type: string, default?: string }[]> = {
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
            { key: 'business_name', label: 'Business Name', type: 'text', default: 'Support AI' },
            { key: 'business_description', label: 'Business Description', type: 'textarea' },
            { key: 'ai_tone', label: 'AI Tone', type: 'text', default: 'professional' },
            { key: 'default_language', label: 'Default Language', type: 'text', default: 'en' },
            { key: 'system_prompt_override', label: 'System Prompt Override', type: 'textarea' },
            { key: 'grounding_template_override', label: 'Grounding Template Override', type: 'textarea' },
            { key: 'brand_voice_rules', label: 'Brand Voice Rules (JSON)', type: 'textarea', default: '{}' },
            { key: 'custom_intents', label: 'Custom Intents (Comma separated)', type: 'text', default: '' },
            { key: 'escalation_threshold_override', label: 'Escalation Threshold', type: 'number', default: '0' },
        ],
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 italic-none">
            {/* Background decorative gradients */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 relative z-10">
                {/* Header */}
                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                                <Settings className="text-white w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base max-w-xl">Configure and manage your intelligent chat infrastructure from one central command center.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button 
                            onClick={activeTab === 'ai' ? handleSaveAiConfig : handleSaveConfig}
                            disabled={status === 'saving' || aiStatus === 'saving'}
                            className="flex-1 sm:flex-none justify-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 shadow-sm flex items-center gap-2 group"
                        >
                            {(status === 'saving' || aiStatus === 'saving') ? <RefreshCcw size={18} className="animate-spin" /> : <Settings size={18} className="group-hover:rotate-45 transition-transform" />}
                            Save Changes
                        </button>
                        
                        <button 
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl transition-all font-semibold shadow-sm flex items-center gap-2 border ${
                                showPreview 
                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                            }`}
                        >
                            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showPreview ? "Hide Preview" : "Live Preview"}
                        </button>

                        <button 
                            onClick={handleBuild}
                            disabled={status === 'building'}
                            className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-xl shadow-slate-900/10 flex items-center gap-2 active:scale-[0.98]"
                        >
                            {status === 'building' ? <RefreshCcw size={18} className="animate-spin" /> : <Hammer size={18} />}
                            Deploy Widget
                        </button>
                        
                        <div className="w-[1px] h-10 bg-slate-200 mx-1 hidden sm:block"></div>
                        
                        <button 
                            onClick={onLogout}
                            className="flex-1 sm:flex-none justify-center px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all font-semibold flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="col-span-12 lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1.5 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm scrollbar-hide">
                            {[
                                { id: 'general', icon: Settings, label: 'General' },
                                { id: 'content', icon: MessageSquare, label: 'Content & UI' },
                                { id: 'persona', icon: Globe, label: 'Assistant' },
                                { id: 'ai', icon: Bot, label: 'AI Logic' },
                                { id: 'knowledge', icon: FileUp, label: 'Knowledge' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap lg:w-full ${
                                        activeTab === tab.id 
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1 lg:translate-x-2' 
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <tab.icon size={18} className="flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-xs font-bold mb-4 uppercase tracking-[0.15em] text-slate-400">System Engine</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${status === 'building' ? 'bg-amber-400 animate-pulse' : status === 'success' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        <span className="text-sm font-bold capitalize text-slate-900">{status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Sync</span>
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">v1.2.4</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="p-6 sm:p-10">
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                                    <span className="bg-slate-900 text-white p-2 rounded-lg">                                        {(() => {
                                            const tab = [
                                                { id: 'general', icon: Settings },
                                                { id: 'content', icon: MessageSquare },
                                                { id: 'persona', icon: Globe },
                                                { id: 'ai', icon: Bot },
                                                { id: 'knowledge', icon: FileUp },
                                            ].find(t => t.id === activeTab);
                                            return tab && <tab.icon size={20} />;
                                        })()}
                                    </span>
                                    {activeTab === 'knowledge' ? 'Knowledge Assets' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Configuration'}
                                </h2>
                                
                                {activeTab === 'knowledge' ? (
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
                                                    <div className="flex flex-wrap gap-2">
                                                        {knowledgeStatus.pdf_names && knowledgeStatus.pdf_names.length > 0 ? (
                                                            knowledgeStatus.pdf_names.map((name, i) => (
                                                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                                    {name}
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
                                                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-[1.25rem] hover:bg-slate-800 transition-all font-black shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                            >
                                                {uploadStatus === 'uploading' ? <RefreshCcw size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                                Synchronize Data
                                            </button>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <div className="bg-rose-50/50 rounded-3xl p-8 border border-rose-100/50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-rose-500 rounded-xl text-white">
                                                        <Trash2 size={18} />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-900">Asset Management</h3>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                                    Remove specific documents from the knowledge engine. Enter the exact filename from your index.
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. training_data_v1.pdf" 
                                                        className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                                                        id="delete-filename-input"
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            const input = document.getElementById('delete-filename-input') as HTMLInputElement;
                                                            handleDeletePdf(input.value);
                                                            input.value = '';
                                                        }}
                                                        className="px-8 py-3.5 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        Purge File
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        {(configGroups[activeTab as keyof typeof configGroups] || []).map((field) => (
                                            <div key={field.key} className="space-y-3 group">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <label className="text-sm font-black text-slate-900 uppercase tracking-wider">{field.label}</label>
                                                        <p className="text-xs text-slate-400 font-medium">{field.key}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="relative">
                                                    {field.type === 'textarea' ? (
                                                        <textarea 
                                                            value={activeTab === 'ai' ? (aiConfig[field.key as keyof AiConfig] as string || '') : (config[field.key] || '')} 
                                                            onChange={(e) => activeTab === 'ai' ? handleAiInputChange(field.key as keyof AiConfig, e.target.value) : handleInputChange(field.key, e.target.value)}
                                                            rows={activeTab === 'ai' ? 6 : 3}
                                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder={field.default || `Specify ${field.label.toLowerCase()}...`}
                                                        />
                                                    ) : field.type === 'color' ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-slate-200">
                                                                <input 
                                                                    type="color" 
                                                                    value={config[field.key] || field.default || '#000000'} 
                                                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                                                />
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                value={config[field.key] || field.default || ''} 
                                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all font-mono uppercase tracking-widest text-sm"
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type={field.type} 
                                                            value={activeTab === 'ai' ? (aiConfig[field.key as keyof AiConfig] as string || '') : (config[field.key] || '')} 
                                                            onChange={(e) => activeTab === 'ai' ? handleAiInputChange(field.key as keyof AiConfig, e.target.value) : handleInputChange(field.key, e.target.value)}
                                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                                            placeholder={field.default || `Specify ${field.label.toLowerCase()}...`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle size={16} className="text-emerald-400" />
                    Configuration saved successfully!
                </div>
            )}
        </div>
    );
};

export default Dashboard;
