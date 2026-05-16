export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  pageEndpoints: Record<string, string>;
  tenantId?: string;
}


export interface Faq {
  page: string;
  id: string;
  question: string;
  description?: string | null;
  answer: string;
}

export interface UserChat {
  user_id: number;
  chat_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface UserMessage {
  user_id: number;
  chat_id: string;
  message_id: string;
  message: string;
  sender: string;
  created_at: string;
}

export interface EscalationRequest {
  user_id: number;
  session_id: string;
  status?: "pending" | "fixed" | "closed";
  priority: "high" | "normal" | "low";
}

export interface EscalationResponse {
  user_id: number;
  session_id: string;
  status: "pending" | "fixed" | "closed";
  priority: "high" | "normal" | "low";
}

export interface ChatConfig {
  followUpOptions: string[];
  layout: {
    widgetWidth: string;
    widgetHeight: string;
    bottom: string;
    right: string;
    bubbleWidth: string;
    bubbleHeight: string;
    zIndex: {
      bubble: string;
      panel: string;
    };
  };
  style: {
    headerHeight: string;
    chatHeaderHeight: string;
    quickReplyHeight: string;
    gradients: {
      header: string;
      button: string;
    };
  };
  colors: {
    [key: string]: string;
  };
  content: {
    welcome: {
      title: string;
      subtitle: string;
      optionPrompt: string;
      chatBtn: string;
      followBtn: string;
    };
    followUp: {
      title: string;
    };
    history: {
      title: string;
      recentChats: string;
      noChats: string;
      actions: {
        select: string;
        deselectAll: string;
        all: string;
        undo: string;
        cancel: string;
        delete: string;
      };
      messages: {
        chatDeleted: string;
        chatsDeleted: string;
        deletedOne: string;
        deletedMultiple: string;
        allChatsDeleted: string;
      };
    };
  };
  user: {
    id: number;
    name: string;
  };

  assistant: {
    name: string;
  };
  animations: {
    entryTransition: string;
  };
  api: ApiConfig;
}

export interface AppConfig {
  api: ApiConfig;
  chat: ChatConfig;
}

const API_CONFIG: ApiConfig = {
    // Force a relative path for local development to ensure the Vite proxy is always used.
    // In production, fallback to an absolute URL if no environment override is provided.
    baseUrl: import.meta.env.DEV 
        ? "/api/v1" 
        : (import.meta.env.VITE_API_BASE_URL || "http://142.93.167.9:8010/api/v1"),
    endpoints: {
      faqs: "/public/page/{page}/faqs",
      faq_details: "/public/page/{page}/faqs/{faq_id}",
      user_chats: "/user_chat/me",
      user_chat: "/user_chat/{chat_id}",
      user_messages: "/user_message/{chat_id}",
      create_message: "/public/chat/{chat_id}",
      create_user_chat: "/user_chat",
      delete_chat: "/user_chats",
      escalation: "/escalation",
      escalations: "/escalations",
      escalation_details: "/escalation_details/{session_id}",
      user_escalations: "/user_escalations",
    },
    pageEndpoints: (import.meta.env.VITE_AVAILABLE_PAGES ? import.meta.env.VITE_AVAILABLE_PAGES.split(",") : ["home", "support"]).reduce((acc: Record<string, string>, page: string) => ({ ...acc, [page.trim()]: page.trim() }), {}),
    tenantId: import.meta.env.VITE_X_TENANT_ID,
};

export const APP_CONFIG: AppConfig = {
  api: API_CONFIG,

  chat: {
    // Widget Dimensions & Positioning
    layout: {
      widgetWidth: "420px",
      widgetHeight: "614px",
      bottom: "24px", 
      right: "24px",  
      bubbleWidth: "w-16",
      bubbleHeight: "h-16",
      zIndex: {
        bubble: "z-50",
        panel: "z-50",
      },
    },

    // Design tokens
    style: {
      headerHeight: "201px",
      chatHeaderHeight: "88px",
      quickReplyHeight: "58px",
      gradients: {
        header: `linear-gradient(360deg, ${import.meta.env.VITE_COLOR_SECONDARY || "#DDD8BB"} -68.13%, #858B89 15.94%, ${import.meta.env.VITE_COLOR_PRIMARY || "#37475C"} 100%)`,
        button: `linear-gradient(270deg, ${import.meta.env.VITE_COLOR_SECONDARY || "#DDD8BB"} 0%, #858B89 50%, ${import.meta.env.VITE_COLOR_PRIMARY || "#37475C"} 100%)`,
      }
    },

    // Color Palette (Commonly used hex codes)
    colors: {
      primary: import.meta.env.VITE_COLOR_PRIMARY || "#2B3D55",
      secondary: import.meta.env.VITE_COLOR_SECONDARY || "#F2DCB3",
      primaryText: import.meta.env.VITE_COLOR_PRIMARY || "#2B3D55",
      secondaryText: "#737373",
      mutedText: "#7E8CA0",
      black: "#0C161F",
      pureBlack: "#000000",
      cream: "#F2E9C3",
      tan: "#F2DCB3",
      border: "#DEDEDE",
      bgGray: "#D9D9D9",
      wordsGray: "#949791",
    },

    // UI Strings & Content
    content: {
      welcome: {
        title: import.meta.env.VITE_WELCOME_TITLE || "Hi There!",
        subtitle: import.meta.env.VITE_WELCOME_SUBTITLE || "How can we help?",
        optionPrompt: import.meta.env.VITE_WELCOME_PROMPT || "Please select an option below",
        chatBtn: import.meta.env.VITE_WELCOME_CHAT_BTN || "Chat with us",
        followBtn: import.meta.env.VITE_WELCOME_FOLLOW_BTN || "Follow previous request",
      },
      followUp: {
        title: "Follow up on previous requests",
      },
      history: {
        title: "Conversation history",
        recentChats: "Recent Chats",
        noChats: "No recent chats found.",
        actions: {
          select: "Select",
          deselectAll: "None",
          all: "All",
          undo: "UNDO",
          cancel: "Cancel",
          delete: "Delete",
        },
        messages: {
          chatDeleted: "Chat deleted successfully",
          chatsDeleted: "Chats deleted successfully",
          deletedOne: "Deleted 1 chat",
          deletedMultiple: "Deleted {count} chats",
          allChatsDeleted: "Deleted all chats",
        },
      },
    },

    // Content & Persona
    followUpOptions: import.meta.env.VITE_FOLLOW_UP_OPTIONS
      ? import.meta.env.VITE_FOLLOW_UP_OPTIONS.split(",")
      : [
          "bug report status",
          "support request",
          "Update a previous change request",
          "payment issue",
          "complaint",
        ],

    user: {
      id: parseInt(import.meta.env.VITE_DEFAULT_USER_ID || "0"),
      name: "User",
    },

    assistant: {
      name: import.meta.env.VITE_ASSISTANT_NAME || "Assistant",
    },

    // Animation settings
    animations: {
      entryTransition: "animate-in slide-in-from-bottom-4 fade-in duration-300",
    },
    api: API_CONFIG
  }
};

export default APP_CONFIG;
export const CHAT_CONFIG: ChatConfig = APP_CONFIG.chat;
