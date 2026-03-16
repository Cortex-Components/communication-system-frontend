import { useState } from "react";
import ChatIcon from "../../assets/chatwidget.svg";
import { ChatWelcome } from "./ChatWelcome";
import { ChatConversation } from "./ChatConversation";
import { ChatFollowUp } from "./ChatFollowUp";
import { ChangeRequestList } from "./ChangeRequestList";
import { ChangeRequestDetails } from "./ChangeRequestDetails";
import { CreateChangeRequest } from "./CreateChangeRequest";
import { RequestChangeModal } from "./RequestChangeModal";
import { Faq, ChatConfig } from "@/config/app-config";
import { ChatProvider } from "./context/ChatProvider";
import { useChat } from "./context/ChatContext";

export type ChatView = "closed" | "welcome" | "follow-up" | "change-requests" | "change-request-details" | "user-request-change" | "create-change-request" | "chat";

interface ChatWidgetProps {
  role?: "dev" | "user";
  currentPage?: "home" | "support";
  config?: Partial<ChatConfig>;
}

const ChatWidgetContent = () => {
  const { config, role, chatService } = useChat();
  const [view, setView] = useState<ChatView>("closed");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [followUpMode, setFollowUpMode] = useState<"options" | "history">("options");
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
    const lowerText = questionText.toLowerCase();
    const isStatusCheck = lowerText.includes("change request status");

    if (isStatusCheck) {
      setView("change-requests");
      return;
    }

    if (typeof option !== "string") {
      // FAQ logic: Fetch specific FAQ details and don't create a chat session (disable AI endpoint)
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

    // Non-FAQ option: create chat session (AI endpoint)
    setIsFaqOnly(false);
    try {
      const newChat = await chatService.createChat(user.id, questionText);
      setSelectedChatId(newChat.chat_id);
    } catch (error) {
      console.error("Failed to create chat for option:", error);
    }

    setSelectedOption(option);
    setSelectedAnswer("");
    setView("chat");
  };

  const handleRequestChange = () => {
    if (role === "dev") {
      setView("change-requests");
    } else {
      setView("user-request-change");
    }
  };

  const handleChatWithUs = async () => {
    setSelectedOption("");
    setSelectedAnswer("");
    setIsFaqOnly(false);
    try {
      const newChat = await chatService.createChat(user.id, config.content.welcome.chatBtn);
      setSelectedChatId(newChat.chat_id);
    } catch (error) {
       console.error("Failed to create chat session:", error);
    }
    setView("chat");
  };

  const handleFollowRequest = () => {
    setFollowUpMode("options");
    setView("follow-up");
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
              onRequestChange={handleRequestChange}
              onChatWithUs={handleChatWithUs}
              onFollowRequest={handleFollowRequest}
            />
          )}
          {view === "follow-up" && (
            <ChatFollowUp
              onClose={() => setView("closed")}
              onBack={() => setView("welcome")}
              onOptionSelect={handleOptionSelect}
              onChatSelect={handleChatSelect}
              onChatWithUs={handleChatWithUs}
              mode={followUpMode}
            />
          )}
          {view === "change-requests" && (
            <ChangeRequestList
              onClose={() => setView("closed")}
              onBack={() => setView("follow-up")}
              onViewRequest={(id) => {
                setSelectedRequestId(id);
                setView("change-request-details");
              }}
              onChatWithUs={handleChatWithUs}
            />
          )}
          {view === "chat" && (
            <ChatConversation
              onBack={() => {
                setView("welcome");
                setSelectedChatId(undefined);
              }}
              onClose={() => setView("closed")}
              onHistoryClick={() => {
                setSelectedChatId(undefined);
                setFollowUpMode("history");
                setView("follow-up");
              }}
              initialMessage={selectedOption}
              initialAnswer={selectedAnswer}
              chatId={selectedChatId}
              isStatic={isFaqOnly}
            />
          )}
          {view === "user-request-change" && (
            <RequestChangeModal
              onClose={() => setView("closed")}
              onCancel={() => setView("welcome")}
              onSubmit={(moduleId) => {
                console.log("Selected module:", moduleId);
                setView("create-change-request");
              }}
              onChatWithUs={handleChatWithUs}
            />
          )}
          {view === "change-request-details" && (
            <ChangeRequestDetails
              requestId={selectedRequestId}
              onClose={() => setView("closed")}
              onCancel={() => {
                if (role === "user") setView("user-request-change");
                else setView("change-requests");
              }}
              onSubmit={() => {
                setSelectedOption(`I'm submitting changes for request #${selectedRequestId}`);
                setView("chat");
              }}
            />
          )}
          {view === "create-change-request" && (
            <CreateChangeRequest
              onClose={() => setView("closed")}
              onCancel={() => setView("welcome")}
              onSubmit={(data) => {
                console.log("Creating request:", data);
                setSelectedOption(`I'd like to request changes: ${data.tags.join(", ")}`);
                setSelectedAnswer("Request received! Our team will review your details and get back to you shortly.");
                setView("chat");
              }}
            />
          )}
        </div>
      )}

      {view === "closed" && (
        <button
          onClick={() => setView("welcome")}
          className={`${layout.bubbleWidth} ${layout.bubbleHeight} pt-1 rounded-xl shadow-lg flex items-center justify-center transition-transform ${layout.zIndex.bubble}`}
          style={{ background: style.gradients.header }}
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

