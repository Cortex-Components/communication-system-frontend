import { X, Paperclip } from "lucide-react";
import { CHAT_CONFIG } from "./config";

interface RequestChangeModalProps {
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (url: string) => void;
}

export const RequestChangeModal = ({ onClose, onCancel, onSubmit }: RequestChangeModalProps) => {
  const { colors, content } = CHAT_CONFIG;
  const { userRequestChange } = content;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[620px] max-h-[min(600px,calc(100vh-32px))] rounded-[24px] shadow-2xl flex flex-col overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-5 text-left">
          <div className="space-y-1.5">
            <h2 className="text-[28px] font-medium leading-none" style={{ color: colors.primaryText }}>
              {userRequestChange.title}
            </h2>
            <p className="text-[17px] font-normal leading-tight opacity-60" style={{ color: colors.primaryText }}>
              {userRequestChange.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-all"
            style={{ color: colors.primaryText }}
          >
            <X className="w-8 h-8 font-thin" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-8 py-3">
          <div className="relative group flex items-center">
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: colors.primaryText }}
            >
              <Paperclip className="w-6 h-6 rotate-45" />
            </div>
            <input 
              type="text"
              placeholder={userRequestChange.placeholder}
              className="w-full pl-12 pr-4 py-4 rounded-[12px] outline-none text-[16px] transition-all font-medium"
              style={{ backgroundColor: colors.cream, color: colors.primaryText }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-8 py-8 grid grid-cols-2 gap-5">
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-[12px] font-bold text-[18px] hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ backgroundColor: colors.bgGray, color: colors.primaryText }}
          >
            {userRequestChange.actions.cancel}
          </button>
          <button
            onClick={() => onSubmit("")}
            className="w-full py-2 rounded-[12px] bg-cortex-button-gradient text-white text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
          >
            {userRequestChange.actions.continue}
          </button>
        </div>
      </div>
    </div>
  );
};
