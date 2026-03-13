import { X, ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { CHAT_CONFIG } from "@/config/app-config";
import { chatService, UserChat } from "@/services/chat-service";

interface ChatFollowUpProps {
  onClose: () => void;
  onBack: () => void;
  onOptionSelect: (option: string) => void;
  onChatSelect: (chatId: string) => void;
  onChatWithUs: () => void;
  mode?: "options" | "history";
}

export const ChatFollowUp = ({ onClose, onBack, onOptionSelect, onChatSelect, onChatWithUs, mode = "options" }: ChatFollowUpProps) => {
  const { style, followUpOptions, colors, content, user } = CHAT_CONFIG;
  const [chats, setChats] = useState<UserChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        // Fetch chats for user ID 0 as requested
        const data = await chatService.getUserChats(0);
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch user chats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, []);

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

      <div className="px-6 mt-2 mb-4">
        <h2 className="text-[22px] font-medium" style={{ color: colors.primaryText }}>
          {mode === "history" ? "Conversation history" : content.followUp.title}
        </h2>
      </div>

      {/* List Container */}
      <div className="flex-1 px-5 pb-8 flex flex-col min-h-0 bg-slate-50/30">
        <div className="flex-1 overflow-y-auto px-1 space-y-4 py-2 custom-scrollbar">
          
          {/* Static Options - Only show in options mode */}
          {mode === "options" && (
            <div className="flex flex-col gap-3.5 items-center w-full px-1 overflow-y-auto pb-4 text-center">
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
          )}

          {/* Recent Chats - Only show in history mode */}
          {mode === "history" && (
            <div className="pb-1">
               <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-3">Recent Chats</h3>
               
               {isLoading ? (
                 <div className="space-y-3">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
                   ))}
                 </div>
               ) : chats.length > 0 ? (
                 <div className="space-y-3">
                   {chats.map((chat) => (
                     <button
                      key={chat.chat_id}
                      onClick={() => onChatSelect(chat.chat_id)}
                      className="w-full text-left bg-white border border-slate-100 rounded-xl p-4 hover:border-[#2B3D55] hover:bg-blue-50/30 transition-all group shadow-sm"
                     >
                       <div className="flex items-start justify-between">
                         <div className="flex gap-3">
                           <div className="mt-1 w-8 h-8 rounded-lg bg-cortex-cream flex items-center justify-center shrink-0">
                             <MessageSquare className="w-4 h-4 text-[#2B3D55]" />
                           </div>
                           <div className="min-w-0">
                             <p className="font-semibold text-[15px] text-[#2B3D55] truncate ">
                               {chat.title}
                             </p>
                             <p className="text-xs text-[#737373] mt-0.5 flex items-center">
                               <Clock className="w-3 h-3 mr-1" />
                               {new Date(chat.updated_at).toLocaleDateString()}
                             </p>
                           </div>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-slate-400 text-center py-4">No recent chats found.</p>
               )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 shrink-0">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-[14px] bg-cortex-button-gradient text-white text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {content.welcome.chatBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
