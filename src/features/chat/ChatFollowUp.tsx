import { X, ArrowLeft } from "lucide-react";
import { CHAT_CONFIG } from "./config";

interface ChatFollowUpProps {
  onClose: () => void;
  onBack: () => void;
  onOptionSelect: (option: string) => void;
  onChatWithUs: () => void;
}

export const ChatFollowUp = ({ onClose, onBack, onOptionSelect, onChatWithUs }: ChatFollowUpProps) => {
  const { style, followUpOptions, colors, content } = CHAT_CONFIG;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300 text-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100/50 transition-colors"
          style={{ color: colors.mutedText }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100/50 transition-colors"
          style={{ color: colors.mutedText }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 mt-2 mb-6">
        <h2 className="text-[22px] font-medium" style={{ color: colors.primaryText }}>
          {content.followUp.title}
        </h2>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pb-8 flex flex-col min-h-0">
        <div 
          className="flex flex-col gap-3.5 items-center w-full px-1 overflow-y-auto pb-4 text-center"
        >
          {followUpOptions.map((option) => (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              className="w-full max-w-[368px] shrink-0 rounded-[12px] bg-cortex-cream text-cortex-black text-base font-medium hover:brightness-95 transition-all flex items-center justify-center px-4"
              style={{ height: style.quickReplyHeight }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-2 shrink-0">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-[14px] bg-cortex-button-gradient text-white text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.99]"
          >
            {content.welcome.chatBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
