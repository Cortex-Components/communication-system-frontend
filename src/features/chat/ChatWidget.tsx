import { useState } from "react";
import { getChatId } from "@/utils/chatId";
import ChatIcon from "../../assets/chatwidget.svg";
import { ChatWelcome } from "./ChatWelcome";
import { ChatFollowUp } from "./ChatFollowUp";
import { ChangeRequestList } from "./ChangeRequestList";
import { ChangeRequestDetails } from "./ChangeRequestDetails";
import { CreateChangeRequest } from "./CreateChangeRequest";
import { RequestChangeModal } from "./RequestChangeModal";
import { ChatConversation } from "./ChatConversation";
import { Faq, ChatConfig } from "@/config/app-config";
import { ChatProvider } from "./context/ChatProvider";
import { useChat } from "./context/ChatContext";

export type ChatView = "closed" | "welcome" | "follow-up" | "change-requests" | "change-request-details" | "user-request-change" | "create-change-request" | "chat";

interface ChatWidgetProps {
  role?: string;
  currentPage?: string;
  accessToken?: string;
  config?: Partial<ChatConfig>;
}

const ChatWidgetContent = () => {
  const { config, role, chatService, isAuthenticated } = useChat();
  const featureEnabled = config.featureFlags?.cortexInternal;
  const [view, setView] = useState<ChatView>("closed");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [isFaqOnly, setIsFaqOnly] = useState<boolean>(false);
  const [followUpMode, setFollowUpMode] = useState<"options" | "history">("options");

  const { layout, animations, user, style } = config;
  const { apiClient, currentPage } = useChat();

  const handleChatSelect = (chatId: string) => {
    console.log("[ChatWidget] Selecting chat from history:", chatId);
    setSelectedChatId(chatId);
    setSelectedOption("");
    setSelectedAnswer("");
    setIsFaqOnly(false);
    setView("chat");
  };

  const handleOptionSelect = async (option: string | Faq) => {
    const questionText = typeof option === "string" ? option : option.question;
    const lowerText = questionText.toLowerCase();
    const isStatusCheck = featureEnabled && lowerText.includes("change request status");
    if (isStatusCheck) {
      setView("change-requests");
      return;
    }
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



  const handleChatWithUs = async () => {
    setSelectedOption("");
    setSelectedAnswer("");
    setIsFaqOnly(false);
    
    if (isAuthenticated) {
      try {
        // Create a new registered chat on the backend
        const newChat = await chatService.createChat(user.id, "Support Chat");
        console.log("[ChatWidget] Created new authenticated chat:", newChat);
        setSelectedChatId(newChat.chat_id);
      } catch (error) {
        console.error("Failed to create new chat:", error);
        setSelectedChatId(getChatId());
      }
    } else {
      // Use a fixed chat ID from env and send via /public/chat/{chat_id}
      setSelectedChatId(getChatId());
    }
    
    setView("chat");
  };

  const handleRequestChange = featureEnabled ? () => {
    const nextView = config.rolePermissions[role]?.requestChangeView || "user-request-change";
    setView(nextView as ChatView);
  } : undefined;

  const handleFollowRequest = featureEnabled ? () => {
    setFollowUpMode("options");
    setView("follow-up");
  } : undefined;

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
              onHistoryClick={() => {
                setFollowUpMode("history");
                setView("follow-up");
              }}
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
          {featureEnabled && view === "change-requests" && (
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
          {featureEnabled && view === "change-request-details" && (
            <ChangeRequestDetails
              requestId={selectedRequestId}
              onClose={() => setView("closed")}
              onCancel={() => {
                const backView = config.rolePermissions[role]?.requestChangeView || "user-request-change";
                setView(backView as ChatView);
              }}
              onSubmit={() => {
                setSelectedOption(`I'm submitting changes for request #${selectedRequestId}`);
                setView("chat");
              }}
            />
          )}
          {featureEnabled && view === "user-request-change" && (
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
          {featureEnabled && view === "create-change-request" && (
            <CreateChangeRequest
              onClose={() => setView("closed")}
              onCancel={() => setView("welcome")}
              onSubmit={(data) => {
                setSelectedOption(`I'd like to request changes: ${data.tags.join(", ")}`);
                setSelectedAnswer("Request received! Our team will review your details and get back to you shortly.");
                setView("chat");
              }}
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
          className={`${layout.bubbleWidth} ${layout.bubbleHeight} pt-1 rounded-xl shadow-lg flex items-center justify-center transition-transform ${layout.zIndex.bubble} bg-cortex-header-gradient`}
        >
          <img src={ChatIcon} alt="Chat" className="w-9 h-9" />
        </button>
      )}
    </div>
  );
};

export const ChatWidget = ({ role = "dev", currentPage = "home", accessToken, config }: ChatWidgetProps) => {
  return (
    <ChatProvider role={role} currentPage={currentPage} accessToken={accessToken} config={config}>
      <ChatWidgetContent />
    </ChatProvider>
  );
};

export default ChatWidget;

