import { FileUp, Link, RefreshCcw, CheckCircle, Trash2 } from 'lucide-react';
import type { KnowledgeStatus, ModalState } from '../types';

interface Props {
  knowledgeStatus: KnowledgeStatus | null;
  selectedFiles: FileList | null;
  uploadStatus: string;
  onFilesChange: (files: FileList | null) => void;
  onUpload: () => void;
  onDeletePdf: (name: string) => void;
  onShowModal: (modal: Omit<ModalState, 'show'>) => void;
}

export function KnowledgeTab({
  knowledgeStatus,
  selectedFiles,
  uploadStatus,
  onFilesChange,
  onUpload,
  onDeletePdf,
  onShowModal,
}: Props) {
  return (
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
              <div className={`w-3 h-3 rounded-full ${knowledgeStatus.cache_valid ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.5)]'}`} />
              <p className="text-xl font-bold text-slate-900">{knowledgeStatus.cache_valid ? 'Verified' : 'Syncing...'}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {knowledgeStatus.cache_valid ? 'System is fully optimized.' : 'Rebuilding index from new assets.'}
            </p>
          </div>

          <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md md:col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Uploaded Assets ({knowledgeStatus.pdf_count || 0})
            </p>
            <div className="flex flex-wrap gap-3">
              {knowledgeStatus.pdf_names?.length ? (
                knowledgeStatus.pdf_names.map((name, i) => (
                  <div key={i} className="group/file flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-slate-300 transition-all shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="max-w-[200px] truncate">{name}</span>
                    <button
                      onClick={() =>
                        onShowModal({
                          title: 'Confirm Deletion',
                          message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
                          type: 'confirm',
                          onConfirm: () => onDeletePdf(name),
                        })
                      }
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
          onChange={(e) => onFilesChange(e.target.files)}
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
              <button onClick={() => onFilesChange(null)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase">
                Clear All
              </button>
            </div>
            <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
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
          onClick={onUpload}
          disabled={uploadStatus === 'uploading' || !selectedFiles}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[1.25rem] hover:opacity-90 transition-all font-black shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          {uploadStatus === 'uploading' ? <RefreshCcw size={22} className="animate-spin" /> : <CheckCircle size={22} />}
          Synchronize Data
        </button>
      </div>
    </div>
  );
}
