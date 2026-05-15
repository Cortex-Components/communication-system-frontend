import { useState } from "react";
import { getChatId } from "@/utils/chatId";
import ChatIcon from "../../assets/chatwidget.svg";
import { ChatWelcome } from "./ChatWelcome";
import { ChatConversation } from "./ChatConversation";
import { Faq, ChatConfig } from "@/config/app-config";
import { ChatProvider } from "./context/ChatProvider";
import { useChat } from "./context/ChatContext";

export type ChatView = "closed" | "welcome" | "follow-up" | "chat";

interface ChatWidgetProps {
  role?: string;
  currentPage?: string;
  config?: Partial<ChatConfig>;
}

const ChatWidgetContent = () => {
  const { config, role, chatService } = useChat();
  const [view, setView] = useState<ChatView>("closed");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [isFaqOnly, setIsFaqOnly] = useState<boolean>(false);

  const { layout, animations, user, style } = config;
  const { apiClient, currentPage } = useChat();

  const handleChatSelect = (chatId: string) => {

    setSelectedChatId(chatId);
    setSelectedOption("");
    setSelectedAnswer("");
    setIsFaqOnly(false);
    setView("chat");
  };

  const handleOptionSelect = async (option: string | Faq) => {
    const questionText = typeof option === "string" ? option : option.question;
    if (typeof option !== "string") {
      // Use existing data from the FAQ object if available to avoid redundant or failing fetch calls.
      if (option.answer) {
        setSelectedOption(option.question);
        setSelectedAnswer(option.answer);
        setSelectedChatId(undefined);
        setIsFaqOnly(true);
        setView("chat");
        return;
      }

      // FAQ logic: Fetch specific FAQ details if answer is not already present
      try {
        const faqDetails = await apiClient.get<Faq>(currentPage, "faq_details", { faq_id: option.id });
        setSelectedOption(faqDetails.question);
        setSelectedAnswer(faqDetails.answer);
      } catch (error) {
        console.error("Failed to fetch FAQ details:", error);
        setSelectedOption(option.question);
        setSelectedAnswer(option.answer);
      }
      setSelectedChatId(undefined);
      setIsFaqOnly(true);
      setView("chat");
      return;
    }

    // Non-FAQ option: use public chat endpoint with a fixed session ID
    setIsFaqOnly(false);
    setSelectedChatId(getChatId());
    setSelectedOption(option);
    setSelectedAnswer("");
    setView("chat");
  };



  const handleChatWithUs = () => {
    setSelectedOption("");
    setSelectedAnswer("");
    setIsFaqOnly(false);
    // Use a fixed chat ID from env and send via /public/chat/{chat_id}
    setSelectedChatId(getChatId());
    setView("chat");
  };



  return (
    <div 
      className={`fixed ${layout.zIndex.panel} flex flex-col items-end gap-2 sm:gap-3`}
      style={{ 
        bottom: `min(${layout.bottom}, 4vh)`, 
        right: `min(${layout.right}, 4vw)` 
      }}
    >
      {view !== "closed" && (
        <div 
          className={`rounded-2xl overflow-hidden shadow-2xl bg-background flex flex-col ${animations.entryTransition}`}
          style={{ 
            width: `min(${layout.widgetWidth}, calc(100vw - 32px))`, 
            height: `min(${layout.widgetHeight}, calc(100vh - 100px))` 
          }}
        >
          {view === "welcome" && (
            <ChatWelcome
              role={role}
              onClose={() => setView("closed")}
              onOptionSelect={handleOptionSelect}
              onChatWithUs={handleChatWithUs}

              onHistoryClick={() => {}}
            />
          )}
          {view === "chat" && (
            <ChatConversation
              onBack={() => {
                setView("welcome");
                setSelectedChatId(undefined);
              }}
              onClose={() => setView("closed")}
              initialMessage={selectedOption}
              initialAnswer={selectedAnswer}
              chatId={selectedChatId}
              isStatic={isFaqOnly}
            />
          )}

        </div>
      )}

      {view === "closed" && (
        <button
          onClick={() => setView("welcome")}
          className={`${layout.bubbleWidth} ${layout.bubbleHeight} pt-1 rounded-xl shadow-lg flex items-center justify-center transition-transform ${layout.zIndex.bubble}`}
          style={{ background: "var(--cortex-header-gradient)" }}
        >
          <img src={ChatIcon} alt="Chat" className="w-9 h-9" />
        </button>
      )}
    </div>
  );
};

export const ChatWidget = ({ role = "dev", currentPage = "home", config }: ChatWidgetProps) => {
  return (
    <ChatProvider role={role} currentPage={currentPage} config={config}>
      <ChatWidgetContent />
    </ChatProvider>
  );
};

export default ChatWidget;

