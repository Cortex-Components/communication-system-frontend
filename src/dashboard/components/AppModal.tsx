import { CheckCircle, AlertCircle, Trash2, Bot } from 'lucide-react';
import type { ModalState } from '../types';

interface Props {
  modal: ModalState;
  onClose: () => void;
}

export function AppModal({ modal, onClose }: Props) {
  if (!modal.show) return null;

  const handleConfirm = () => {
    if (modal.type === 'confirm') modal.onConfirm?.();
    onClose();
  };

  const iconMap = {
    success: <CheckCircle size={40} />,
    error: <AlertCircle size={40} />,
    confirm: <Trash2 size={40} />,
    info: <Bot size={40} />,
  };

  const colorMap = {
    success: 'bg-emerald-50 text-emerald-500',
    error: 'bg-rose-50 text-rose-500',
    confirm: 'bg-amber-50 text-amber-500',
    info: 'bg-slate-50 text-slate-900',
  };

  const barMap = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    confirm: 'bg-slate-900',
    info: 'bg-slate-900',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-white max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-500">
        <div className={`h-2 w-full ${barMap[modal.type]}`} />
        <div className="p-10 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${colorMap[modal.type]}`}>
            {iconMap[modal.type]}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">{modal.title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">{modal.message}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className={`w-full py-4 text-white rounded-2xl transition-all font-black shadow-xl active:scale-95 ${
                modal.type === 'confirm'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-600/20'
              }`}
            >
              {modal.type === 'confirm' ? 'Confirm' : 'Acknowledge'}
            </button>
            {modal.type === 'confirm' && (
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold active:scale-95"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
