import React, { useState, useCallback } from 'react';
import {
  Settings, Palette, MessageSquare, Globe, Hammer, CheckCircle,
  AlertCircle, Link, Copy, RefreshCcw, Eye, EyeOff, LogOut, Bot,
  FileUp, Layout, Shield, HelpCircle,
} from 'lucide-react';

import { useConfig } from './hooks/useConfig';
import { useAiConfig } from './hooks/useAiConfig';
import { useKnowledge } from './hooks/useKnowledge';
import { useFaqs } from './hooks/useFaqs';
import { useSecurity } from './hooks/useSecurity';
import { useBuilds } from './hooks/useBuilds';
import { usePages } from './hooks/usePages';

import { AppModal } from './components/AppModal';
import { ConfigForm } from './components/ConfigForm';
import { KnowledgeTab } from './components/KnowledgeTab';
import { FaqsTab } from './components/FaqsTab';
import { SecurityTab } from './components/SecurityTab';
import { BuildTab } from './components/BuildTab';

import type { ModalState, TabId } from '.';

// ---------------------------------------------------------------------------
// Static config-field definitions (no logic, purely declarative)
// ---------------------------------------------------------------------------
const CONFIG_GROUPS: Record<
  string,
  { key?: string; id?: string; label: string; type: string; default?: string }[]
> = {
  general: [
    { key: 'app_name', label: 'App Name', type: 'text' },
    { key: 'support_email', label: 'Support Email', type: 'email' },
    { key: 'widget_tag_name', label: 'Widget Tag Name', type: 'text', default: 'cortex-chat-widget' },
    { key: 'available_pages', label: 'Available Pages (comma separated)', type: 'text', default: 'home,support' },
    { key: 'available_roles', label: 'Available Roles (comma separated)', type: 'text', default: 'dev,user' },
    { key: 'default_role', label: 'Default Role', type: 'text', default: 'dev' },
    { key: 'default_page', label: 'Default Page', type: 'text', default: 'home' },
    { key: 'api_base_url', label: 'API Base URL', type: 'text' },
  ],
  appearance: [
    { key: 'color_primary', label: 'Primary Color', type: 'color', default: '#2B3D55' },
    { key: 'color_secondary', label: 'Secondary Color', type: 'color', default: '#F2DCB3' },
  ],
  content: [
    { key: 'welcome_title', label: 'Welcome Title', type: 'text', default: 'Hi There!' },
    { key: 'welcome_subtitle', label: 'Welcome Subtitle', type: 'textarea', default: 'How can we help?' },
    { key: 'option_prompt', label: 'Option Prompt', type: 'text', default: 'Please select an option below' },
    { key: 'chat_button_text', label: 'Chat Button Text', type: 'text', default: 'Chat with us' },
    { key: 'follow_button_text', label: 'Follow Button Text', type: 'text', default: 'Follow previous request' },
  ],
  persona: [
    { key: 'assistant_name', label: 'Assistant Name', type: 'text' },
    { key: 'default_user_name', label: 'Default User Name', type: 'text' },
    { key: 'default_user_id', label: 'Default User ID', type: 'number' },
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

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: 'general', icon: Settings, label: 'General' },
  { id: 'content', icon: Layout, label: 'Content & UI' },
  { id: 'persona', icon: Globe, label: 'Assistant' },
  { id: 'ai', icon: Bot, label: 'AI Configuration' },
  { id: 'knowledge', icon: FileUp, label: 'Knowledge' },
  { id: 'faqs', icon: HelpCircle, label: 'FAQs Management' },
  { id: 'security', icon: Shield, label: 'Security & API' },
  { id: 'build', icon: Hammer, label: 'Builds' },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showPreview, setShowPreview] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [modal, setModal] = useState<ModalState>({ show: false, title: '', message: '', type: 'info' });

  // Helpers
  const showModal = useCallback((m: Omit<ModalState, 'show'>) => setModal({ show: true, ...m }), []);
  const closeModal = useCallback(() => setModal((prev) => ({ ...prev, show: false })), []);
  const showSavedToast = useCallback(() => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  }, []);
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }, []);

  // Hooks
  const { config, status, buildLog, scriptLink, handleInputChange, saveConfig, build } =
    useConfig(onLogout);

  const { aiConfig, aiStatus, handleAiInputChange, saveAiConfig } = useAiConfig(onLogout);

  const {
    knowledgeStatus, selectedFiles, setSelectedFiles, uploadStatus, uploadPdfs, deletePdf,
  } = useKnowledge(onLogout);

  const { availablePages, deletePage } = usePages(onLogout);

  const {
    faqs, faqPage, setFaqPage, faqStatus, newFaq, setNewFaq,
    editingFaqId, startEditing, cancelEditing, createFaq, updateFaq, deleteFaq,
  } = useFaqs(onLogout, { availablePages, config });

  const {
    tenantApiKey, regeneratingKey, corsOrigins, newCorsOrigin, setNewCorsOrigin,
    corsOriginError, setCorsOriginError, addCorsOrigin, removeCorsOrigin,
    clearAllCorsOrigins, saveCorsOrigins, saveNotificationEmail, regenerateApiKey,
  } = useSecurity(onLogout, handleInputChange);

  const {
    builds, currentBuild, currentScript, listStatus, actionStatus,
    listBuilds, getBuild, getBuildScript, createBuild, deleteBuild, pollBuildStatus,
  } = useBuilds(onLogout);

  // Save dispatcher
  const handleSave = useCallback(async () => {
    const ok = activeTab === 'ai' ? await saveAiConfig() : await saveConfig();
    if (ok) showSavedToast();
  }, [activeTab, saveAiConfig, saveConfig, showSavedToast]);

  // Tab content title
  const tabTitle =
    activeTab === 'knowledge' ? 'Knowledge Assets' :
    activeTab === 'faqs'      ? 'FAQ Management' :
    activeTab === 'security'  ? 'Security & API Access' :
    activeTab === 'build'     ? 'Build Management' :
    `${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)} Configuration`;

  const ActiveTabIcon = TABS.find((t) => t.id === activeTab)?.icon ?? Settings;

  // Live preview (web component)
  const renderPreview = () => {
    const primary   = config['color_primary']   || '#2B3D55';
    const secondary = config['color_secondary'] || '#F2DCB3';
    const liveConfig = JSON.stringify({
      colors:    { primary, secondary, primaryText: primary },
      content:   {
        welcome: {
          title:        config['welcome_title']      || 'Hi There!',
          subtitle:     config['welcome_subtitle']   || 'How can we help?',
          optionPrompt: config['option_prompt']     || 'Please select an option below',
          chatBtn:      config['chat_button_text']   || 'Chat with us',
          followBtn:    config['follow_button_text'] || 'Follow previous request',
        },
      },
      assistant: { name: config['assistant_name'] || 'Assistant' },
      user:      { id: parseInt(config['default_user_id'] || '0'), name: config['default_user_name'] || 'Guest' },
    });
    const tag =
      config['widget_tag_name'] ||
      import.meta.env.VITE_WIDGET_TAG_NAME ||
      'cortex-chat-widget';
    return React.createElement(tag, { config: liveConfig });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Decorative background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 relative z-10">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 lg:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Settings className="text-white w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm md:text-base max-w-xl">
              Configure and manage your intelligent chat infrastructure from one central command center.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full lg:w-auto">
            <button
              onClick={handleSave}
              disabled={status === 'saving' || aiStatus === 'saving'}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-5 sm:py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all group shadow-sm active:scale-95"
            >
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                {status === 'saving' || aiStatus === 'saving'
                  ? <RefreshCcw size={18} className="animate-spin" />
                  : <Settings size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:rotate-45 transition-all" />}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-indigo-600">Save Changes</span>
            </button>

            <button
              onClick={() => setShowPreview((p) => !p)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-5 sm:py-2.5 rounded-2xl transition-all shadow-sm active:scale-95 border ${
                showPreview
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-white/20' : 'bg-slate-50'}`}>
                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              <span className="text-xs sm:text-sm font-bold">Live Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('build')}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:px-6 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-bold shadow-xl shadow-indigo-900/10 active:scale-95"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Hammer size={18} />
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
          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-1 sm:p-1.5 bg-slate-100/50 lg:bg-white/60 backdrop-blur-md rounded-[1.25rem] lg:rounded-2xl border border-slate-200/60 lg:border-slate-200 shadow-inner lg:shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 lg:py-3.5 rounded-xl text-[13px] lg:text-sm font-bold transition-all duration-300 whitespace-nowrap lg:w-full group/tab ${
                    activeTab === tab.id
                      ? 'bg-white lg:bg-gradient-to-r lg:from-indigo-600 lg:to-violet-600 text-indigo-600 lg:text-white shadow-md lg:shadow-xl lg:shadow-indigo-600/20 lg:translate-x-2 lg:border-l-4 lg:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-900 lg:hover:bg-white lg:hover:text-indigo-600 lg:hover:shadow-md lg:hover:translate-x-1'
                  }`}
                >
                  <tab.icon
                    size={16}
                    className={`flex-shrink-0 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover/tab:scale-110'}`}
                  />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 lg:bg-white animate-pulse hidden lg:block" />
                  )}
                </button>
              ))}
            </nav>

            {/* Status card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-500/10" />
              <h3 className="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-slate-400">System Engine</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Infrastructure</span>
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'building' ? 'bg-amber-400 animate-pulse' :
                      status === 'success'  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                      'bg-slate-300'
                    }`} />
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

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-9 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="p-5 sm:p-10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <span className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-2 rounded-lg shadow-md">
                    <ActiveTabIcon size={20} />
                  </span>
                  {tabTitle}
                </h2>

                {activeTab === 'security' ? (
                  <SecurityTab
                    tenantApiKey={tenantApiKey}
                    regeneratingKey={regeneratingKey}
                    corsOrigins={corsOrigins}
                    newCorsOrigin={newCorsOrigin}
                    corsOriginError={corsOriginError}
                    notificationEmail={config['support_email'] || ''}
                    onCorsInputChange={setNewCorsOrigin}
                    onCorsErrorChange={setCorsOriginError}
                    onAddCors={addCorsOrigin}
                    onRemoveCors={removeCorsOrigin}
                    onClearAllCors={clearAllCorsOrigins}
                    onSaveCors={async () => {
                      const result = await saveCorsOrigins();
                      if (result.ok) showModal({ title: 'Success', message: 'CORS settings updated successfully!', type: 'success' });
                      else showModal({ title: 'Error', message: 'Failed to update CORS settings.', type: 'error' });
                    }}
                    onSaveEmail={async () => {
                      const ok = await saveNotificationEmail(config['support_email'] || '');
                      showModal(ok
                        ? { title: 'Success', message: 'Notification settings updated successfully!', type: 'success' }
                        : { title: 'Error', message: 'Failed to update notification settings.', type: 'error' });
                    }}
                    onEmailChange={(v) => handleInputChange('support_email', v)}
                    onRegenerateKey={async () => {
                      const ok = await regenerateApiKey();
                      showModal(ok
                        ? { title: 'New API Key Generated', message: 'Your new API key has been generated. Please copy it now as it will not be shown again.', type: 'success' }
                        : { title: 'Error', message: 'Failed to regenerate API key.', type: 'error' });
                    }}
                    onShowModal={showModal}
                    onCopyToClipboard={copyToClipboard}
                  />
                ) : activeTab === 'knowledge' ? (
                  <KnowledgeTab
                    knowledgeStatus={knowledgeStatus}
                    selectedFiles={selectedFiles}
                    uploadStatus={uploadStatus}
                    onFilesChange={setSelectedFiles}
                    onUpload={async () => {
                      const ok = await uploadPdfs();
                      showModal(ok
                        ? { title: 'Success', message: 'Files uploaded successfully!', type: 'success' }
                        : { title: 'Error', message: 'Failed to upload files.', type: 'error' });
                    }}
                    onDeletePdf={async (name) => {
                      const ok = await deletePdf(name);
                      showModal(ok
                        ? { title: 'Success', message: 'File deleted successfully', type: 'success' }
                        : { title: 'Error', message: 'Failed to delete file', type: 'error' });
                    }}
                    onShowModal={showModal}
                  />
                ) : activeTab === 'faqs' ? (
                  <FaqsTab
                    faqs={faqs}
                    faqPage={faqPage}
                    faqStatus={faqStatus}
                    newFaq={newFaq}
                    editingFaqId={editingFaqId}
                    availablePages={availablePages}
                    config={config}
                    onPageChange={setFaqPage}
                    onDeletePage={async (page) => {
                      const ok = await deletePage(page);
                      if (ok) {
                        setFaqPage('all');
                        showModal({ title: 'Success', message: `Page '${page}' deleted successfully.`, type: 'success' });
                      } else {
                        showModal({ title: 'Error', message: `Failed to delete page '${page}'.`, type: 'error' });
                      }
                    }}
                    onFaqChange={setNewFaq}
                    onStartEditing={startEditing}
                    onCancelEditing={cancelEditing}
                    onCreate={async () => {
                      const ok = await createFaq();
                      showModal(ok
                        ? { title: 'Success', message: 'FAQ created successfully!', type: 'success' }
                        : { title: 'Error', message: 'Failed to create FAQ.', type: 'error' });
                    }}
                    onUpdate={async () => {
                      const ok = await updateFaq();
                      showModal(ok
                        ? { title: 'Success', message: 'FAQ updated successfully!', type: 'success' }
                        : { title: 'Error', message: 'Failed to update FAQ.', type: 'error' });
                    }}
                    onDelete={async (id, page) => {
                      const ok = await deleteFaq(id, page);
                      showModal(ok
                        ? { title: 'Success', message: 'FAQ deleted successfully', type: 'success' }
                        : { title: 'Error', message: 'Failed to delete FAQ.', type: 'error' });
                    }}
                    onShowModal={showModal}
                  />
                ) : activeTab === 'build' ? (
                  <BuildTab
                    builds={builds}
                    currentBuild={currentBuild}
                    currentScript={currentScript}
                    listStatus={listStatus}
                    actionStatus={actionStatus}
                    onListBuilds={listBuilds}
                    onGetBuild={getBuild}
                    onGetBuildScript={getBuildScript}
                    onCreateBuild={createBuild}
                    onDeleteBuild={deleteBuild}
                    onPollBuildStatus={pollBuildStatus}
                    onShowModal={showModal}
                  />
                ) : (
                  <ConfigForm
                    fields={CONFIG_GROUPS[activeTab] ?? []}
                    isAiTab={activeTab === 'ai'}
                    config={config}
                    aiConfig={aiConfig}
                    onConfigChange={handleInputChange}
                    onAiChange={handleAiInputChange}
                  />
                )}
              </div>
            </div>

            {/* Build results */}
            {(status === 'success' || status === 'building' || status === 'error') && (
              <div className={`rounded-[2rem] border p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 ${
                status === 'success' ? 'bg-emerald-50/50 border-emerald-100 shadow-emerald-200/20' :
                status === 'error'   ? 'bg-rose-50/50 border-rose-100 shadow-rose-200/20' :
                'bg-slate-50/50 border-slate-200 shadow-slate-200/20'
              }`}>
                <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl text-white ${
                        status === 'success' ? 'bg-emerald-500' :
                        status === 'error'   ? 'bg-rose-500' : 'bg-slate-500'
                      }`}>
                        {status === 'success' && <CheckCircle size={20} />}
                        {status === 'error'   && <AlertCircle size={20} />}
                        {status === 'building'&& <RefreshCcw size={20} className="animate-spin" />}
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Deployment Pipeline</h3>
                    </div>
                    <p className="text-slate-500 text-sm">Automated build and script generation results.</p>
                  </div>
                  {status === 'success' && scriptLink && (
                    <button
                      onClick={() => {
                        const tag = config['widget_tag_name'] || 'cortex-chat-widget';
                        copyToClipboard(`<script src="${scriptLink}"></script>\n<${tag}></${tag}>`);
                      }}
                      className="w-full xl:w-auto px-6 py-3 bg-white text-emerald-700 rounded-xl border-2 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-3 font-black shadow-lg active:scale-95"
                    >
                      <Copy size={18} /> Copy Integration Code
                    </button>
                  )}
                </div>

                {scriptLink && status === 'success' && (
                  <div className="mb-8 space-y-3">
                    <label className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] block">Script Origin</label>
                    <div className="flex gap-3">
                      <div className="flex-1 px-5 py-4 bg-white/80 border border-emerald-100 rounded-2xl font-mono text-sm text-emerald-900 overflow-x-auto whitespace-nowrap shadow-inner">
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
                  <pre className="w-full bg-[#1e293b] text-slate-100 p-8 rounded-[1.5rem] font-mono text-xs overflow-x-auto max-h-80 shadow-2xl">
                    {buildLog || '// Waiting for deployment...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live preview web component */}
      {showPreview && renderPreview()}

      {/* Saved toast */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle size={20} className="text-white" />
          Configuration saved successfully!
        </div>
      )}

      <AppModal modal={modal} onClose={closeModal} />
    </div>
  );
};

export default Dashboard;
