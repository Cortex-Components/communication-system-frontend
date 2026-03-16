import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
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
  onHistoryClick: () => void;
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
        text: initialAnswer || (initialMessage.match(/[\u0600-\u06FF]/) ? assistant.arabicResponse : assistant.defaultResponse),
        sender: "other",
        name: assistant.name,
      });
    }
    return initial;
  });

  const [input, setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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


  const menuOptions = ["Conversation history", "Close chat"];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
              Support Conversation
            </p>
          )}
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:bg-white/10 transition-colors rounded-full p-1.5"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-[calc(100%-8px)] right-4 w-[210px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-2.5 z-50 animate-in fade-in zoom-in-95 duration-200">
            {menuOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (option === "Close chat") {
                    onClose();
                  } else if (option === "Conversation history") {
                    onHistoryClick();
                  }
                }}
                className="w-full text-left px-5 py-2.5 text-[15px] text-[#2C3E50] hover:bg-cortex-gray/10 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground animate-pulse">Loading messages...</span>
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
      </div>

      {/* Input area */}
      {!isStatic && (
        <div className="bg-cortex-cream px-5 py-6">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Your Message..."
              className="flex-1 bg-transparent text-[16px] text-cortex-black/70 placeholder:text-cortex-black/40 outline-none"
            />
            <button
              onClick={sendMessage}
              className="transition-all hover:brightness-75 active:scale-95 disabled:opacity-60"
              disabled={!input.trim()}
            >
              <img src={VectorIcon} alt="Send" className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

