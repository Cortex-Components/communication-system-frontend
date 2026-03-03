import { useState, useRef, useEffect } from "react";
import { X, Send, MoreVertical } from "lucide-react";
import chatIcon from "@/assets/chat-icon.png";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "chat">("menu");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName] = useState("Ahmed");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Ask about a module",
    "Request a change",
    "Give feedback",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "أكيد طبعا اتفضل" },
      ]);
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setView("menu");
    setMessages([]);
    setShowDropdown(false);
  };

  const handleBackToMenu = () => {
    setView("menu");
    setMessages([]);
    setShowDropdown(false);
  };

  return (
    <>
      {/* Chat bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform overflow-hidden p-0 border-0"
          aria-label="Open chat"
        >
          <img src={chatIcon} alt="Chat" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 border border-border/50">
          {view === "menu" ? (
            <>
              {/* Gradient header */}
              <div
                className="relative px-5 pt-5 pb-6"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(210 15% 30%), hsl(200 10% 50%) 50%, hsl(43 40% 78%))",
                }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
                <p className="text-xl font-semibold text-white">Hi There! 👋</p>
                <p className="text-lg font-bold text-white">How can we help?</p>
              </div>

              {/* Quick replies */}
              <div className="bg-popover px-5 py-4 space-y-2.5">
                <p className="text-xs text-muted-foreground">Please select an option below</p>
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setView("chat");
                      setMessages([{ from: "user", text: reply }]);
                      setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          { from: "bot", text: "Great question! Let me look into that for you." },
                        ]);
                      }, 800);
                    }}
                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Chat with us button */}
              <div className="px-5 pb-5 pt-2 bg-popover">
                <button
                  onClick={() => setView("chat")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(210 15% 30%), hsl(200 10% 45%) 60%, hsl(43 35% 70%))",
                  }}
                >
                  Chat with us
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Chat header with name and menu */}
              <div
                className="relative px-5 py-4 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(210 15% 30%), hsl(200 10% 50%) 50%, hsl(43 40% 78%))",
                }}
              >
                <p className="text-white font-semibold text-lg">Hi {userName}!</p>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                    aria-label="Menu"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-popover rounded-xl shadow-lg border border-border py-2 z-10">
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Conversation history
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleBackToMenu();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Change category
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Close chat
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[380px] bg-popover">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 text-sm ${
                        msg.from === "user"
                          ? "bg-primary text-white rounded-2xl rounded-bl-sm"
                          : "bg-secondary text-secondary-foreground rounded-2xl rounded-br-sm"
                      }`}
                    >
                      {msg.from === "user" && (
                        <p className="text-xs text-white/60 mb-1 font-medium">{userName}</p>
                      )}
                      {msg.text}
                    </div>
                    {msg.from === "user" && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {userName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 flex gap-2 bg-popover">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Send a message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
