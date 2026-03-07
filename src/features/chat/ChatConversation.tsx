import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { CHAT_CONFIG } from "./config";
import VectorIcon from "../../assets/Vector.svg";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  avatar?: string;
  name?: string;
}

interface ChatConversationProps {
  onBack: () => void;
  onClose: () => void;
  initialMessage?: string;
}

export const ChatConversation = ({ onBack, onClose, initialMessage }: ChatConversationProps) => {
  const { user, assistant, style } = CHAT_CONFIG;
  
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
        text: initialMessage.match(/[\u0600-\u06FF]/) ? assistant.arabicResponse : assistant.defaultResponse,
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), sender: "user" },
    ]);
    setInput("");
  };

  const menuOptions = ["Conversation history", "Change category", "Close chat"];

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
        className="relative flex items-center gap-3 px-4 py-3 bg-cortex-header-gradient"
        style={{ height: style.chatHeaderHeight }}
      >
        <button onClick={onBack} className="text-white hover:bg-white/10 transition-colors rounded-full p-1.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="flex-1 text-[18px] font-semibold text-white">Hi {user.name}!</h3>
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
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {msg.name && (
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
                  ? "bg-cortex-gray text-cortex-black rounded-2xl rounded-tr-none"
                  : "bg-cortex-cream text-cortex-black rounded-2xl rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
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
    </div>
  );
};
