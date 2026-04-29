import { X, Loader2, History } from "lucide-react";
import { useEffect, useState } from "react";
import { Faq } from "@/config/app-config";
import HelloIcon from "../../assets/hello.svg";
import { useApi } from "@/hooks/use-api";
import { useChat } from "./context/ChatContext";

interface ChatWelcomeProps {
  role: string;
  onClose: () => void;
  onOptionSelect: (faq: Faq | string) => void;
  onChatWithUs: () => void;
  onFollowRequest: () => void;
  onHistoryClick: () => void;
}

export const ChatWelcome = ({ role, onClose, onOptionSelect, onChatWithUs, onFollowRequest, onHistoryClick }: ChatWelcomeProps) => {
  const { config } = useChat();
  const { style, content } = config;

  const { get } = useApi();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const data = await get<Faq[]>("faqs");
        setFaqs(data || []);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [get]);


  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Gradient Header */}
      <div 
        className="relative px-6 pt-6 sm:pt-8 pb-8 sm:pb-10 overflow-hidden shrink-0"
        style={{ height: `min(${style.headerHeight}, 25vh)`, minHeight: "130px", background: "var(--cortex-header-gradient)" }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onHistoryClick}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-[22px] sm:text-[24px] font-medium text-white mt-3 sm:mt-5 flex items-center gap-2">
          {content.welcome.title} <img src={HelloIcon} alt="Hello" className="w-5 h-5 opacity-90" />
        </h2>
        <h3 className="text-[22px] sm:text-[24px] font-semibold text-cortex-cream leading-tight">
          {content.welcome.subtitle}
        </h3>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pt-4 sm:pt-5 pb-6 sm:pb-8 flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 shrink-0 px-1">
          <p className="text-[14px] sm:text-[16px] text-muted-foreground truncate flex-1">
            {content.welcome.optionPrompt}
          </p>
        </div>
        
        <div 
          className="flex-1 flex flex-col gap-2.5 sm:gap-3 items-center w-full px-1 overflow-y-auto pb-1 custom-scrollbar"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-cortex-amber" />
              <p className="text-sm font-medium">{(content.welcome as {gettingUpdates?: string}).gettingUpdates || "Getting latest updates..."}</p>
            </div>
          ) : faqs.length > 0 ? (
            faqs.map((faq) => (
              <button
                key={faq.id}
                onClick={() => onOptionSelect(faq)}
                className={`w-full max-w-[368px] shrink-0 rounded-[12px] bg-cortex-cream text-cortex-black text-[15px] font-medium hover:brightness-95 transition-all flex items-center justify-center text-center px-4 py-3 min-h-[58px] shadow-sm`}
              >
                {faq.question}
              </button>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">{(content.welcome as {noOptions?: string}).noOptions || "No options available at the moment."}</p>
          )}
        </div>

        <div className="mt-auto pt-3 sm:pt-4 shrink-0 flex flex-col gap-2.5 sm:gap-3">
          <button
            onClick={onFollowRequest}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-white text-[17px] sm:text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.98] bg-cortex-button-gradient"
          >
            {content.welcome.followBtn}
          </button>
          <button
            onClick={onChatWithUs}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-white text-[17px] sm:text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.98] bg-cortex-button-gradient"
          >
            {content.welcome.chatBtn}
          </button>

        </div>
      </div>
    </div>
  );
};


