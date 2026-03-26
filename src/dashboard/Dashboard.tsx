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
  EyeOff
} from 'lucide-react';
import '../main';

const Dashboard = () => {
    const [config, setConfig] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string>('idle');
    const [buildLog, setBuildLog] = useState<string>('');
    const [scriptLink, setScriptLink] = useState<string>('');
    const [activeTab, setActiveTab] = useState('general');
    const [showPreview, setShowPreview] = useState(false);
    const [savedToast, setSavedToast] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/config');
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error('Failed to fetch config', error);
        }
    };

    const handleSaveConfig = async () => {
        setStatus('saving');
        try {
            const res = await fetch('http://localhost:3001/api/config', {
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

    const handleBuild = async () => {
        setStatus('building');
        setBuildLog('Starting build process...');
        try {
            const res = await fetch('http://localhost:3001/api/build', { method: 'POST' });
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
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Config Dashboard</h1>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your chat widget settings and build the production script.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button 
                            onClick={handleSaveConfig}
                            disabled={status === 'saving'}
                            className="w-full sm:w-auto justify-center px-6 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700 shadow-sm flex items-center gap-2"
                        >
                            {status === 'saving' ? <RefreshCcw size={18} className="animate-spin" /> : <Settings size={18} />}
                            Save Config
                        </button>
                        <button 
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full sm:w-auto justify-center px-6 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition font-medium shadow-sm flex items-center gap-2"
                        >
                            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                        <button 
                            onClick={handleBuild}
                            disabled={status === 'building'}
                            className="w-full sm:w-auto justify-center px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium shadow-md flex items-center gap-2"
                        >
                            {status === 'building' ? <RefreshCcw size={18} className="animate-spin" /> : <Hammer size={18} />}
                            Build Widget
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="col-span-12 md:col-span-3">
                        <nav className="flex md:flex-col overflow-x-auto space-x-2 md:space-x-0 md:space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm scrollbar-hide">
                            {[
                                { id: 'general', icon: Settings, label: 'General' },
                                { id: 'appearance', icon: Palette, label: 'Appearance' },
                                { id: 'content', icon: MessageSquare, label: 'Content & UI' },
                                { id: 'persona', icon: Globe, label: 'Persona' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition whitespace-nowrap md:w-full ${
                                        activeTab === tab.id 
                                        ? 'bg-slate-900 text-white' 
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <tab.icon size={18} className="flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        {/* Status Widget */}
                        <div className="mt-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wider text-slate-400">Status</h3>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status === 'building' ? 'bg-amber-400 transition-pulse' : status === 'success' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <span className="text-sm font-medium capitalize">{status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 md:col-span-9 space-y-6">
                        {/* Form Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            <div className="p-5 sm:p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                                </h2>
                                
                                <div className="space-y-6">
                                    {(configGroups[activeTab as keyof typeof configGroups] || []).map((field) => (
                                        <div key={field.key} className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-semibold text-slate-700">{field.label}</label>
                                                <span className="text-xs font-mono text-slate-400">{field.key}</span>
                                            </div>
                                            {field.type === 'textarea' ? (
                                                <textarea 
                                                    value={config[field.key] || ''} 
                                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none transition resize-none"
                                                    placeholder={field.default || `Enter ${field.label}...`}
                                                />
                                            ) : field.type === 'color' ? (
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="color" 
                                                        value={config[field.key] || field.default || '#000000'} 
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        className="w-12 h-12 p-1 border border-slate-200 rounded-lg cursor-pointer transition flex-shrink-0 bg-white"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={config[field.key] || field.default || ''} 
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none transition uppercase"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            ) : (
                                                <input 
                                                    type={field.type} 
                                                    value={config[field.key] || ''} 
                                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                                                    placeholder={field.default || `Enter ${field.label}...`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Build Results Section */}
                        {(status === 'success' || status === 'building' || status === 'error') && (
                            <div className={`rounded-2xl border p-8 shadow-lg ${
                                status === 'success' ? 'bg-emerald-50 border-emerald-100' : 
                                status === 'error' ? 'bg-rose-50 border-rose-100' : 
                                'bg-slate-50 border-slate-200'
                            }`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                    <div>
                                        <h3 className={`text-lg font-bold flex items-center gap-2 ${
                                            status === 'success' ? 'text-emerald-900' : 
                                            status === 'error' ? 'text-rose-900' : 
                                            'text-slate-900'
                                        }`}>
                                            {status === 'success' && <CheckCircle className="text-emerald-500" />}
                                            {status === 'error' && <AlertCircle className="text-rose-500" />}
                                            {status === 'building' && <RefreshCcw size={20} className="text-slate-500 animate-spin" />}
                                            Build Output
                                        </h3>
                                        <p className="text-slate-600 text-sm mt-1">Review the build logs and get your connection script.</p>
                                    </div>
                                    {status === 'success' && scriptLink && (
                                        <button 
                                            onClick={() => {
                                                const tag = config['VITE_WIDGET_TAG_NAME'] || 'cortex-chat-widget';
                                                copyToClipboard(`<script src="${scriptLink}"></script>\n<${tag}></${tag}>`);
                                            }}
                                            className="px-4 py-2 bg-white text-emerald-700 rounded-lg border border-emerald-200 hover:bg-white/50 transition flex items-center gap-2 text-sm font-semibold"
                                        >
                                            <Copy size={16} /> Copy Script Tag
                                        </button>
                                    )}
                                </div>

                                {scriptLink && status === 'success' && (
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2 block">Direct Script Link</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-4 py-3 bg-white/50 border border-emerald-200 rounded-lg font-mono text-xs text-emerald-900 overflow-x-auto whitespace-nowrap">
                                                {scriptLink}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(scriptLink)}
                                                className="p-3 bg-white text-emerald-700 rounded-lg border border-emerald-200 hover:bg-white/50 transition shadow-sm"
                                            >
                                                <Link size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Terminal Logs</label>
                                    <pre className="w-full bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs overflow-x-auto max-h-60 shadow-inner">
                                        {buildLog || 'Pending logs...'}
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
                    colors: { primary, secondary, primaryText: primary },
                    style: {
                        gradients: {
                            header: `linear-gradient(360deg, ${secondary} -68.13%, #858B89 15.94%, ${primary} 100%)`,
                            button: `linear-gradient(270deg, ${secondary} 0%, #858B89 50%, ${primary} 100%)`,
                            icon: `linear-gradient(90deg, ${secondary} 0%, #949791 15.87%, ${primary} 68.27%)`,
                        }
                    }
                });
                const tag = config['VITE_WIDGET_TAG_NAME'] || 'cortex-chat-widget';
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
