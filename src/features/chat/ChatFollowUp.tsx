import { X, ArrowLeft, MessageSquare, Clock, Trash2, Loader2, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { UserChat } from "@/services/chat-service";
import { useChat } from "./context/ChatContext";

interface ChatFollowUpProps {
  onClose: () => void;
  onBack: () => void;
  onOptionSelect: (option: string) => void;
  onChatSelect: (chatId: string) => void;
  onChatWithUs: () => void;
  mode?: "options" | "history";
}

export const ChatFollowUp = ({ onClose, onBack, onOptionSelect, onChatSelect, onChatWithUs, mode = "options" }: ChatFollowUpProps) => {
  const { config, chatService } = useChat();
  const { style, colors, content } = config;
  const [chats, setChats] = useState<UserChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    timeLeft: number;
    intervalId: NodeJS.Timeout;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (pendingDelete) {
        clearInterval(pendingDelete.intervalId);
      }
    };
  }, [pendingDelete]);

  const commitDelete = async (ids: string[]) => {
    setIsDeleting(prev => [...prev, ...ids]);
    try {
      await chatService.deleteChats(config.user.id, ids);
      setChats(prev => prev.filter(c => !ids.includes(c.chat_id)));
      setSuccessMessage(ids.length > 1 ? content.history.messages.chatsDeleted : content.history.messages.chatDeleted);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to delete chats:", error);
    } finally {
      setIsDeleting(prev => prev.filter(id => !ids.includes(id)));
      setPendingDelete(null);
    }
  };

  const scheduleDelete = (ids: string[]) => {
    if (pendingDelete) {
      clearInterval(pendingDelete.intervalId);
      commitDelete(pendingDelete.ids);
    }

    let currentSeconds = 4;

    const intervalId = setInterval(() => {
      currentSeconds--;
      if (currentSeconds <= 0) {
        clearInterval(intervalId);
        commitDelete(ids);
      } else {
        setPendingDelete(prev => prev ? { ...prev, timeLeft: currentSeconds } : null);
      }
    }, 1000);

    setPendingDelete({
      ids,
      timeLeft: currentSeconds,
      intervalId
    });
  };

  const undoDelete = () => {
    if (pendingDelete) {
      clearInterval(pendingDelete.intervalId);
      setPendingDelete(null);
    }
  };

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatService.getUserChats(config.user.id);
      const sortedData = (data || []).sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setChats(sortedData);
    } catch (error) {
      console.error("Failed to fetch user chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [config.user.id, chatService]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = (chatId: string) => {
    setSelectedIds(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const visibleChats = chats.filter(c =>
    !pendingDelete?.ids.includes(c.chat_id) &&
    !isDeleting.includes(c.chat_id)
  );

  const handleSelectAll = () => {
    if (selectedIds.length === visibleChats.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleChats.map(c => c.chat_id));
    }
  };

  const handleDeleteSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.length > 0) {
      scheduleDelete(selectedIds);
      setIsSelectionMode(false);
      setSelectedIds([]);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    scheduleDelete([chatId]);
  };

  const handleEnterSelectionMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelectionMode(true);
    setSelectedIds([]);
  };

  const handleCancelSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300 text-left relative">
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
          {mode === "history" ? content.history.title : content.followUp.title}
        </h2>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col min-h-0 bg-slate-50/30">
        <div className="flex-1 overflow-y-auto px-1 space-y-4 py-2 custom-scrollbar">

          {mode === "options" && (
            <div className="flex flex-col gap-3.5 items-center w-full px-1 overflow-y-auto pb-4 text-center">
              {config.followUpOptions.map((option) => (
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

          {mode === "history" && (
            <div className="pb-1">
               <div className="flex items-center justify-between px-1 mb-3">
                 <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
                   {isSelectionMode ? `${selectedIds.length} Selected` : content.history.recentChats}
                 </h3>

                 <div className="flex items-center gap-3">
                   {isSelectionMode ? (
                     <>
                       <button
                         onClick={handleSelectAll}
                         className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-tight transition-colors"
                       >
                         {selectedIds.length === visibleChats.length ? content.history.actions.deselectAll : content.history.actions.all}
                       </button>
                       <button
                         onClick={handleDeleteSelected}
                         disabled={selectedIds.length === 0}
                         className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${selectedIds.length > 0 ? 'text-red-500 hover:text-red-700' : 'text-slate-300'}`}
                       >
                         {content.history.actions.delete}
                       </button>
                       <button
                         onClick={handleCancelSelection}
                         className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tight transition-colors"
                       >
                         {content.history.actions.cancel}
                       </button>
                     </>
                   ) : (
                     visibleChats.length > 0 && (
                       <button
                         onClick={handleEnterSelectionMode}
                         className="text-[12px] font-bold uppercase tracking-tight transition-colors"
                         style={{ color: colors.primaryText }}
                       >
                         {content.history.actions.select}
                       </button>
                     )
                   )}
                 </div>
               </div>

               {isLoading ? (
                 <div className="space-y-3">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
                   ))}
                 </div>
               ) : visibleChats.length > 0 ? (
                 <div className="space-y-3">
                    {visibleChats.map((chat) => (
                      <div
                        key={chat.chat_id}
                        onClick={() => isSelectionMode ? toggleSelection(chat.chat_id) : onChatSelect(chat.chat_id)}
                        className={`w-full text-left bg-white border rounded-xl p-4 transition-all group shadow-sm cursor-pointer relative ${
                          selectedIds.includes(chat.chat_id) ? 'bg-blue-50/30' : 'border-slate-100 hover:bg-blue-50/30'
                        }`}
                        style={{
                          borderColor: selectedIds.includes(chat.chat_id) ? colors.primaryText : 'transparent'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 min-w-0 pr-8">
                            {isSelectionMode && (
                              <div className={`mt-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                selectedIds.includes(chat.chat_id) ? 'border-transparent' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: selectedIds.includes(chat.chat_id) ? colors.primaryText : 'transparent', borderColor: selectedIds.includes(chat.chat_id) ? colors.primaryText : undefined }}
                              >
                                {selectedIds.includes(chat.chat_id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                              </div>
                            )}
                            <div className="mt-1 w-8 h-8 rounded-lg bg-cortex-cream flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4" style={{ color: colors.primaryText }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[15px] truncate" style={{ color: colors.primaryText }}>
                                {chat.title}
                              </p>
                              <p className="text-xs mt-0.5 flex items-center" style={{ color: colors.secondaryText }}>
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(chat.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {!isSelectionMode && (
                            <button
                              onClick={(e) => handleDeleteChat(e, chat.chat_id)}
                              disabled={isDeleting.includes(chat.chat_id)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete conversation"
                            >
                              {isDeleting.includes(chat.chat_id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-sm text-slate-400 text-center py-4">{content.history.noChats}</p>
               )}
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mx-6 mb-4 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
               style={{ backgroundColor: colors.primaryText }}>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {pendingDelete && (
          <div className="mx-6 mb-4 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
               style={{ backgroundColor: colors.primaryText }}>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">
                {pendingDelete.ids.length >= chats.length
                  ? content.history.messages.allChatsDeleted
                  : (pendingDelete.ids.length === 1
                      ? content.history.messages.deletedOne
                      : content.history.messages.deletedMultiple.replace('{count}', pendingDelete.ids.length.toString())
                    )
                }
              </span>
            </div>
            <button
              onClick={undoDelete}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-cortex-cream text-xs font-bold transition-colors"
            >
              {content.history.actions.undo} ({pendingDelete.timeLeft}s)
            </button>
          </div>
        )}

        <div className="mt-auto pt-6 shrink-0">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-[14px] text-white text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: style.gradients.button }}
          >
            {content.welcome.chatBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
