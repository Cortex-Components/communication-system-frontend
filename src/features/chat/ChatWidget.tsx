import { useState } from "react";
import ChatIcon from "../../assets/chatwidget.svg";
import { ChatWelcome } from "./ChatWelcome";
import { ChatConversation } from "./ChatConversation";
import { CHAT_CONFIG } from "./config";

export type ChatView = "closed" | "welcome" | "chat";

const ChatWidget = () => {
  const [view, setView] = useState<ChatView>("closed");
  const [selectedOption, setSelectedOption] = useState<string>("");

  const { layout, animations } = CHAT_CONFIG;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setView("chat");
  };

  const handleChatWithUs = () => {
    setSelectedOption("");
    setView("chat");
  };

  return (
    <div 
      className={`fixed ${layout.zIndex.panel} flex flex-col items-end gap-3`}
      style={{ bottom: layout.bottom, right: layout.right }}
    >
      {view !== "closed" && (
        <div 
          className={`rounded-2xl overflow-hidden shadow-2xl bg-background flex flex-col ${animations.entryTransition}`}
          style={{ 
            width: `min(${layout.widgetWidth}, calc(100vw - 32px))`, 
            height: `min(${layout.widgetHeight}, 85vh)` 
          }}
        >
          {view === "welcome" && (
            <ChatWelcome
              onClose={() => setView("closed")}
              onOptionSelect={handleOptionSelect}
              onChatWithUs={handleChatWithUs}
            />
          )}
          {view === "chat" && (
            <ChatConversation
              onBack={() => setView("welcome")}
              onClose={() => setView("closed")}
              initialMessage={selectedOption}
            />
          )}
        </div>
      )}

      {view === "closed" && (
        <button
          onClick={() => setView("welcome")}
          className={`${layout.bubbleWidth} ${layout.bubbleHeight} pt-1 rounded-xl bg-cortex-header-gradient shadow-lg flex items-center justify-center  transition-transform ${layout.zIndex.bubble}`}
        >
          <img src={ChatIcon} alt="Chat" className="w-9 h-9" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
