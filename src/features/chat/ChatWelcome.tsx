import { X } from "lucide-react";
import { CHAT_CONFIG } from "./config";
import HelloIcon from "../../assets/hello.svg";

interface ChatWelcomeProps {
  onClose: () => void;
  onOptionSelect: (option: string) => void;
  onChatWithUs: () => void;
}

export const ChatWelcome = ({ onClose, onOptionSelect, onChatWithUs }: ChatWelcomeProps) => {
  const { style, quickReplies, animations } = CHAT_CONFIG;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Gradient Header */}
      <div 
        className="relative bg-cortex-header-gradient px-6 pt-8 pb-10 overflow-hidden"
        style={{ height: `min(${style.headerHeight}, 30vh)`, minHeight: "160px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-[24px] font-medium text-white mt-5 flex items-center gap-2">
          Hi There! <img src={HelloIcon} alt="Hello" className="w-5 h-5 opacity-90" />
        </h2>
        <h3 className="text-[24px] font-semibold text-cortex-cream leading-tight">
          How can we help?
        </h3>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col min-h-0">
        <p className="text-sm text-muted-foreground mb-4 shrink-0">Please select an option below</p>
        
        <div 
          className="flex flex-col gap-3 items-center w-full px-1 overflow-y-auto shrink-0 pb-1"
          style={{ 
            maxHeight: `calc((${style.quickReplyHeight} * 4) + 36px)` 
          }}
        >
          {quickReplies.map((option) => (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              className={`w-full max-w-[368px] shrink-0 rounded-[18px] bg-cortex-cream text-cortex-black text-base font-medium hover:brightness-95 transition-all flex items-center justify-center text-center`}
              style={{ height: style.quickReplyHeight }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 shrink-0">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-xl bg-cortex-button-gradient text-white text-[18px] hover:text-cortex-cream font-semibold  transition-all"
          >
            Chat with us
          </button>
        </div>
      </div>
    </div>
  );
};
