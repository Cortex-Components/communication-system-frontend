import { X } from "lucide-react";
import { CHAT_CONFIG } from "./config";
import HelloIcon from "../../assets/hello.svg";

interface ChatWelcomeProps {
  onClose: () => void;
  onOptionSelect: (option: string) => void;
  onChatWithUs: () => void;
  onFollowRequest: () => void;
}

export const ChatWelcome = ({ onClose, onOptionSelect, onChatWithUs, onFollowRequest }: ChatWelcomeProps) => {
  const { style, quickReplies, animations } = CHAT_CONFIG;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Gradient Header */}
      <div 
        className="relative bg-cortex-header-gradient px-6 pt-6 sm:pt-8 pb-8 sm:pb-10 overflow-hidden shrink-0"
        style={{ height: `min(${style.headerHeight}, 25vh)`, minHeight: "130px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-[22px] sm:text-[24px] font-medium text-white mt-3 sm:mt-5 flex items-center gap-2">
          Hi There! <img src={HelloIcon} alt="Hello" className="w-5 h-5 opacity-90" />
        </h2>
        <h3 className="text-[22px] sm:text-[24px] font-semibold text-cortex-cream leading-tight">
          How can we help?
        </h3>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pt-4 sm:pt-5 pb-6 sm:pb-8 flex flex-col min-h-0">
        <p className="text-sm text-muted-foreground mb-3 sm:mb-4 shrink-0">Please select an option below</p>
        
        <div 
          className="flex flex-col gap-2.5 sm:gap-3 items-center w-full px-1 overflow-y-auto shrink-0 pb-1"
          style={{ 
            maxHeight: `calc((${style.quickReplyHeight} * 3) + 24px)` 
          }}
        >
          {quickReplies.map((option) => (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              className={`w-full max-w-[368px] shrink-0 rounded-[12px] bg-cortex-cream text-cortex-black text-base font-medium hover:brightness-95 transition-all flex items-center justify-center text-center px-4`}
              style={{ height: style.quickReplyHeight }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-3 sm:pt-4 shrink-0 flex flex-col gap-2.5 sm:gap-3">
          <button
            onClick={onFollowRequest}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-cortex-button-gradient text-white text-[17px] sm:text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.98]"
          >
            Follow previous request
          </button>
          <button
            onClick={onChatWithUs}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-cortex-button-gradient text-white text-[17px] sm:text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.98]"
          >
            Chat with us
          </button>
        </div>
      </div>
    </div>
  );
};
