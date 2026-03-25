import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import VectorIcon from "../../assets/Vector.svg";
import { useChat } from "./context/ChatContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other" | string;
  avatar?: string;
  name?: string;
}

interface ChatConversationProps {
  onBack: () => void;
  onClose: () => void;
  onHistoryClick?: () => void;
  initialMessage?: string;
  initialAnswer?: string;
  chatId?: string;
  isStatic?: boolean;
}

export const ChatConversation = ({ onBack, onClose, onHistoryClick, initialMessage, initialAnswer, chatId, isStatic }: ChatConversationProps) => {
  const { config, chatService } = useChat();
  const { user, assistant, style, colors } = config;
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const initial: Message[] = [];
    if (initialMessage) {
      initial.push({
        id: "1",
        text: initialMessage,
        sender: "user",
      });
      initial.push({
        id: "2",
        text: initialAnswer || "",
        sender: "other",
        name: assistant.name,
      });
    }
    return initial;
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (chatId) {
      const fetchMessages = async () => {
        try {
          const history = await chatService.getUserMessages(user.id, chatId);
          if (history.length > 0) {
            const sortedHistory = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const mappedMessages: Message[] = sortedHistory.map((m) => ({
              id: m.message_id,
              text: m.message,
              sender: m.sender === "user" ? "user" : "other",
              name: m.sender === "user" ? user.name : assistant.name,
            }));
            
            setMessages(prev => {
              // Only update state if the backend has same or more messages.
              // This prevents optimistic local messages from disappearing while the backend is still processing.
              if (mappedMessages.length >= prev.length) {
                return mappedMessages;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      };

      const initChat = async () => {
        setIsLoading(true);
        try {
          try {
            const chatDetails = await chatService.getChat(user.id, chatId);
            setChatTitle(chatDetails.title);
          } catch (e) {
            console.warn("Could not fetch chat title:", e);
          }

          const history = await chatService.getUserMessages(user.id, chatId);
          if (history.length === 0) {
            if (initialMessage) {
              await chatService.sendMessage(user.id, chatId, initialMessage, 'user');
              if (initialAnswer) {
                await chatService.sendMessage(user.id, chatId, initialAnswer, 'user');
              }
              await fetchMessages();
            }
          } else {
            const sortedHistory = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const mappedMessages: Message[] = sortedHistory.map((m) => ({
              id: m.message_id,
              text: m.message,
              sender: m.sender === "user" ? "user" : "other",
              name: m.sender === "user" ? user.name : assistant.name,
            }));
            setMessages(mappedMessages);
          }
        } catch (error) {
          console.error("Failed to sync chat state:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      initChat();

      // Poll every 3 seconds to get the chatbot's response
      if (!isStatic) {
        intervalId = setInterval(fetchMessages, 3000);
      }
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [chatId, user.id, assistant.name, user.name, initialMessage, initialAnswer, chatService, isStatic]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const text = input.trim();
    setInput("");

    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: text, sender: "user" },
    ]);

    if (chatId) {
      try {
        await chatService.sendMessage(user.id, chatId, text);
      } catch (error) {
        console.error("Failed to send message to backend:", error);
      }
    }
  };




  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isAITyping = !isStatic && messages.length > 0 && messages[messages.length - 1].sender === "user";

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Header */}
      <div 
        className="relative flex items-center gap-3 px-4 py-3"
        style={{ height: style.chatHeaderHeight, background: style.gradients.header }}
      >
        <button onClick={onBack} className="text-white hover:bg-white/10 transition-colors rounded-full p-1.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-[18px] font-semibold text-white truncate">
            {chatTitle || `Hi ${user.name}!`}
          </h3>
          {chatTitle && (
            <p className="text-[12px] text-white/80 truncate -mt-0.5 font-medium opacity-90">
              {(config.content.followUp as {supportConversation?: string}).supportConversation || "Support Conversation"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground animate-pulse">
              {(config.content.welcome as {loadingMessages?: string}).loadingMessages || "Loading messages..."}
            </span>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {msg.sender !== "user" && msg.name && (
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <div className="w-6 h-6 rounded-full bg-cortex-amber/20 flex items-center justify-center text-[10px] font-bold text-cortex-amber">
                  {msg.name[0]}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{msg.name}</span>
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "rounded-2xl rounded-tr-none"
                  : "rounded-2xl rounded-tl-none"
              }`}
              style={{
                backgroundColor: msg.sender === "user" ? colors.bgGray : colors.cream,
                color: colors.black
              }}
            >
              {msg.text}
            </div>

          </div>
        ))}
        {isAITyping && (
          <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <div className="w-6 h-6 rounded-full bg-cortex-amber/20 flex items-center justify-center text-[10px] font-bold text-cortex-amber">
                {assistant.name[0]}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{assistant.name}</span>
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1"
              style={{
                backgroundColor: colors.cream,
                color: colors.black
              }}
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {!isStatic && (
        <div className="bg-cortex-cream px-5 py-6">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={(config.content.details.placeholders as {messagePlaceholder?: string}).messagePlaceholder || "Enter Your Message..."}
              className="flex-1 bg-transparent text-[16px] text-cortex-black/70 placeholder:text-cortex-black/40 outline-none"
            />
            <button
              onClick={sendMessage}
              className="transition-all hover:brightness-75 active:scale-95 disabled:opacity-60"
              disabled={!input.trim()}
            >
              <img src={VectorIcon} alt="Send" className="w-6 h-6 rtl:scale-x-[-1]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

