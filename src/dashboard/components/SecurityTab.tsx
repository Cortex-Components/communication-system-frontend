import {
  Key, Shield, Mail, RefreshCcw, CheckCircle, AlertCircle,
  Copy, Trash2, Globe, PlusCircle,
} from 'lucide-react';
import type { ModalState } from '../types';

interface Props {
  tenantApiKey: string;
  regeneratingKey: boolean;
  corsOrigins: string[];
  newCorsOrigin: string;
  corsOriginError: string;
  notificationEmail: string;
  onCorsInputChange: (value: string) => void;
  onCorsErrorChange: (error: string) => void;
  onAddCors: () => void;
  onRemoveCors: (origin: string) => void;
  onSaveCors: () => void;
  onSaveEmail: () => void;
  onEmailChange: (email: string) => void;
  onRegenerateKey: () => void;
  onClearAllCors: () => void;
  onShowModal: (modal: Omit<ModalState, 'show'>) => void;
  onCopyToClipboard: (text: string) => void;
}

export function SecurityTab({
  tenantApiKey,
  regeneratingKey,
  corsOrigins,
  newCorsOrigin,
  corsOriginError,
  notificationEmail,
  onCorsInputChange,
  onCorsErrorChange,
  onAddCors,
  onRemoveCors,
  onSaveCors,
  onSaveEmail,
  onEmailChange,
  onRegenerateKey,
  onClearAllCors,
  onShowModal,
  onCopyToClipboard,
}: Props) {
  const handleCorsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddCors();
    }
  };

  return (
    <div className="space-y-10">
      {/* API Key */}
      <section className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
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
                    onClick={() => onCopyToClipboard(tenantApiKey)}
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
                onClick={() =>
                  onShowModal({
                    title: 'Confirm Key Regeneration',
                    message: 'Are you sure you want to regenerate your API key? This will break existing integrations until they are updated.',
                    type: 'confirm',
                    onConfirm: onRegenerateKey,
                  })
                }
                disabled={regeneratingKey}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {regeneratingKey ? <RefreshCcw size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
                Regenerate New Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORS Origins */}
      <section className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
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
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Authorized Origins ({corsOrigins.length})
                </label>
                {corsOrigins.length > 0 && (
                  <button onClick={onClearAllCors} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider">
                    Clear All
                  </button>
                )}
              </div>

              {corsOrigins.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {corsOrigins.map((origin, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <Globe size={16} className="flex-shrink-0 text-violet-500" />
                      <span className="flex-1 font-mono text-sm text-slate-700 truncate">{origin}</span>
                      <button
                        onClick={() => onRemoveCors(origin)}
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

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Add New Origin</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCorsOrigin}
                  onChange={(e) => { onCorsInputChange(e.target.value); onCorsErrorChange(''); }}
                  onKeyDown={handleCorsKeyDown}
                  className={`flex-1 px-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-2 focus:ring-violet-500/10 focus:outline-none transition-all font-mono text-sm text-slate-700 placeholder:text-slate-300 shadow-inner ${corsOriginError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-violet-500'}`}
                  placeholder="https://example.com or *"
                />
                <button
                  onClick={onAddCors}
                  disabled={!newCorsOrigin.trim()}
                  className="px-6 py-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all font-black shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle size={18} /> Add
                </button>
              </div>
              {corsOriginError ? (
                <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {corsOriginError}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">Press Enter or click Add to add the origin to the list</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onSaveCors}
                className="px-8 py-3.5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all font-black shadow-xl shadow-violet-200 flex items-center gap-3 active:scale-95"
              >
                <CheckCircle size={20} /> Update CORS Policy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Email */}
      <section className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
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
                value={notificationEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner"
                placeholder="alerts@yourbusiness.com"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={onSaveEmail}
                className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black shadow-xl shadow-emerald-200 flex items-center gap-3 active:scale-95"
              >
                <CheckCircle size={20} /> Save Notification Settings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
