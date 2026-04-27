import { HelpCircle, Pencil, Trash2, RefreshCcw, CheckCircle } from 'lucide-react';
import type { Faq, ModalState } from '..';

interface Props {
  faqs: Faq[];
  faqPage: string;
  faqStatus: string;
  newFaq: { question: string; description: string; answer: string };
  editingFaqId: string | null;
  availablePages: string[];
  config: Record<string, string>;
  onPageChange: (page: string) => void;
  onDeletePage: (page: string) => void;
  onFaqChange: (faq: { question: string; description: string; answer: string }) => void;
  onStartEditing: (faq: Faq) => void;
  onCancelEditing: () => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: (id: string, page: string) => void;
  onShowModal: (modal: Omit<ModalState, 'show'>) => void;
}

export function FaqsTab({
  faqs,
  faqPage,
  faqStatus,
  newFaq,
  editingFaqId,
  availablePages,
  config,
  onPageChange,
  onDeletePage,
  onFaqChange,
  onStartEditing,
  onCancelEditing,
  onCreate,
  onUpdate,
  onDelete,
  onShowModal,
}: Props) {
  const pages =
    availablePages.length > 0
      ? availablePages
      : (config['VITE_AVAILABLE_PAGES'] || 'home,support').split(',');

  return (
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
            onChange={(e) => onPageChange(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all font-bold text-slate-700 shadow-sm"
          >
            <option value="all">ALL PAGES</option>
            {pages.map((p) => (
              <option key={p.trim()} value={p.trim()}>{p.trim().toUpperCase()}</option>
            ))}
          </select>
          {faqPage !== 'all' && (
            <button
              onClick={() =>
                onShowModal({
                  title: 'Delete Page',
                  message: `Are you sure you want to delete the '${faqPage}' page and all its FAQs? This cannot be undone.`,
                  type: 'confirm',
                  onConfirm: () => onDeletePage(faqPage),
                })
              }
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
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">
          Stored Questions ({faqs.length})
        </p>

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
                        onStartEditing(faq);
                        document.getElementById('faq-form-container')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit FAQ"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        onShowModal({
                          title: 'Delete FAQ',
                          message: 'Are you sure you want to delete this FAQ? This cannot be undone.',
                          type: 'confirm',
                          onConfirm: () => onDelete(faq.id, faq.page),
                        })
                      }
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

      {/* FAQ Form */}
      <div id="faq-form-container" className="bg-white border border-slate-200 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${editingFaqId ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-200'}`}>
            {editingFaqId ? <Pencil size={24} /> : <HelpCircle size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-800">{editingFaqId ? 'Update FAQ' : 'Add New FAQ'}</h3>
              {editingFaqId && (
                <button onClick={onCancelEditing} className="text-[10px] font-black text-rose-500 uppercase hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              {editingFaqId ? 'Currently modifying selection' : 'Train your assistant with context'}
            </p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              Question <div className="w-1 h-1 rounded-full bg-indigo-400" />
            </label>
            <input
              type="text"
              value={newFaq.question}
              onChange={(e) => onFaqChange({ ...newFaq, question: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner hover:bg-white"
              placeholder="e.g. How do I reset my password?"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              Answer <div className="w-1 h-1 rounded-full bg-indigo-400" />
            </label>
            <textarea
              value={newFaq.answer}
              onChange={(e) => onFaqChange({ ...newFaq, answer: e.target.value })}
              rows={4}
              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner hover:bg-white resize-none"
              placeholder="Provide a clear, helpful response..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Internal Note (Optional)
            </label>
            <input
              type="text"
              value={newFaq.description}
              onChange={(e) => onFaqChange({ ...newFaq, description: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50/30 border border-slate-100 rounded-2xl focus:border-slate-400 focus:outline-none transition-all text-xs font-medium text-slate-500 placeholder:text-slate-200"
              placeholder="Context for support team..."
            />
          </div>

          <button
            onClick={editingFaqId ? onUpdate : onCreate}
            disabled={faqStatus === 'creating' || faqStatus === 'saving'}
            className={`w-full mt-4 text-white py-5 rounded-3xl font-black text-lg transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${
              editingFaqId
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:drop-shadow-lg shadow-indigo-600/20'
            }`}
          >
            {faqStatus === 'creating' || faqStatus === 'saving' ? (
              <RefreshCcw size={22} className="animate-spin" />
            ) : (
              <CheckCircle size={22} />
            )}
            {editingFaqId ? 'Update FAQ Content' : 'Publish FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
}
