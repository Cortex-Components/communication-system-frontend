export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  pageEndpoints: Record<string, string>;
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

export interface PurchasedModule {
  id: string;
  name: string;
  purchaseDate: string;
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
    detailsModal: {
      width: string;
      height: string;
      borderRadius: string;
    };
    gradients: {
      header: string;
      button: string;
      icon: string;
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
    changeRequests: {
      title: string;
      viewBtn: string;
    };
    details: {
      title: string;
      labels: Record<string, string>;
      sections: Record<string, string>;
      placeholders: {
        changes: string;
      };
      upload: {
        prompt: string;
        limit: string;
        btn: string;
      };
      actions: {
        cancel: string;
        submit: string;
      };
    };
      userRequestChange: {
        title: string;
        subtitle: string;
        placeholder: string;
        actions: {
          cancel: string;
          continue: string;
        };
      };
      history: {
        title: string;
        recentChats: string;
        noChats: string;
        actions: {
          select: string;
          selectAll: string;
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
  roles: Record<string, string>;
  rolePermissions: Record<string, {
    requestChangeView: string;
  }>;
  user: {
    id: number;
    name: string;
  };

  assistant: {
    name: string;
  };
  followUpOptions: string[];
  changeRequests: {
    id: string;
    userName: string;
    module: string;
    purchasedDate: string;
    status: string;
    statusColor: string;
    requestedChanges: string;
    attachments: { name: string; size: string; type: string }[];
  }[];
  modificationTags: string[];
  statusFilters: {
    all: string;
    noResults: string;
  };
  dataMapping: {
    status: Record<string, string>;
    modules: Record<string, string>;
  };
  animations: {
    entryTransition: string;
  };
  purchasedModules: PurchasedModule[];
  api: ApiConfig;
}

export interface AppConfig {
  api: ApiConfig;
  general: {
    appName: string;
    supportEmail: string;
  };
  chat: ChatConfig;
}

export const APP_CONFIG: AppConfig = {

  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",

    endpoints: {
      faqs: "/page/{page}/faqs",
      faq_details: "/faqs/{faq_id}",
      user_chats: "/user_chats/{user_id}",
      user_chat: "/user_chat/{user_id}/{chat_id}",
      user_messages: "/user_message/{user_id}/{chat_id}",
      create_message: "/user_message",
      create_user_chat: "/user_chat",
      escalation: "/escalation",
      escalations: "/escalations",
      escalation_details: "/escalation/{user_id}/{session_id}",
      user_escalations: "/escalation/{user_id}",
      delete_chat: "/user_chats/delete",
      developer_change_requests: "/developer/change-requests/",
      developer_change_request_details: "/developer/change-requests/{id}/",
      developer_change_request_update: "/developer/change-requests/{id}/",
      developer_change_requests_attachments_create: "/developer/change-requests/attachments/",
      user_change_requests: "/user/change-requests/",
      user_change_request_details: "/user/change-requests/{id}/",
      user_change_request_update: "/user/change-requests/{id}/",
      user_change_requests_attachments_create: "/user/change-requests/attachments/",
      user_change_request_delete: "/user/change-requests/{id}/",
      purchased_modules: "/user/purchased-modules/",
      user_change_requests_attachments_delete: "/user/change-requests/attachments/{id}/",
    },

    pageEndpoints: {
      home: "home",
      support: "support",
    }
  },


  general: {
    appName: import.meta.env.VITE_APP_NAME || "Communication System",
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "support@gmail.com",
  },
  
  // Chat configuration moved from feature specific folder to general config
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
      detailsModal: {
        width: "800px",
        height: "733px",
        borderRadius: "24px",
      },
      gradients: {
        header: "linear-gradient(360deg, #DDD8BB -68.13%, #858B89 15.94%, #37475C 100%)",
        button: "linear-gradient(270deg, #DDD8BB 0%, #858B89 50%, #37475C 100%)",
        icon: "linear-gradient(90deg, #DBD6BA 0%, #949791 15.87%, #3A495E 68.27%)",
      }
    },

    // Color Palette (Commonly used hex codes)
    colors: {
      primaryText: "#2B3D55",
      secondaryText: "#737373",
      mutedText: "#7E8CA0",
      black: "#0C161F",
      pureBlack: "#000000",
      cream: "#F2E9C3",
      tan: "#F2DCB3",
      border: "#DEDEDE",
      bgGray: "#D9D9D9",
      wordsGray: "#949791",
      successGreen: "#00642F",
      progressGold: "#9C6F46",
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
      changeRequests: {
        title: "Follow up on change requests",
        viewBtn: "View request",
      },
      details: {
        title: "Change Request Details",
        labels: {
          client: "Client",
          module: "Module",
          purchased: "Purchased",
          status: "Status",
        },
        sections: {
          requestedChanges: "Requested Changes",
          attachments: "Attachments",
          reply: "Reply to the client",
          upload: "Upload files",
          modifyPrompt: "What would you like to modify?",
          seeAll: "See all",
        },
        placeholders: {
          changes: "Explain the changes you would like to make...",
        },
        upload: {
          prompt: "Chose a file or drag & drop it here",
          limit: "Maximum 500 MB file size",
          btn: "Upload files",
        },
        actions: {
          cancel: "Cancel",
          submit: "Submit",
        }
      },
      userRequestChange: {
        title: "Request a change",
        subtitle: "Enter the module link you want to request changes for.",
        placeholder: "Paste the module URL here",
        actions: {
          cancel: "Cancel",
          continue: "Continue",
        },
      },
      history: {
        title: "Conversation history",
        recentChats: "Recent Chats",
        noChats: "No recent chats found.",
        actions: {
          select: "Select",
          selectAll: "Select All",
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

    // Roles
    roles: {
      dev: import.meta.env.VITE_ROLE_DEV || "dev",
      user: import.meta.env.VITE_ROLE_USER || "user",
    },
    rolePermissions: {
      dev: { requestChangeView: "change-requests" },
      user: { requestChangeView: "user-request-change" },
    },

    // Content & Persona
    user: {
      id: parseInt(import.meta.env.VITE_DEFAULT_USER_ID || "0"),
      name: import.meta.env.VITE_DEFAULT_USER_NAME || "Ahmed",
    },

    
    assistant: {
      name: import.meta.env.VITE_ASSISTANT_NAME || "Assistant",
    },

    followUpOptions: [
          "Update a previous change request",
          "Delete a previous change request",
        ],

    modificationTags: import.meta.env.VITE_MODIFICATION_TAGS
      ? import.meta.env.VITE_MODIFICATION_TAGS.split(",")
      : [
          "Frontend", "Backend Logic", "Database", "Integration", 
          "API Modification", "Bug Fix", "Performance Improvement", 
          "Security Update", "Add New Feature", "Custom Business Logic"
        ],

    statusFilters: {
      all: "All",
      noResults: "No results for",
    },


    changeRequests: [
      {
        id: "101",
        userName: "Ahmed Tech",
        module: "Inventory Management Pro",
        purchasedDate: "2024-03-15",
        status: "opened",
        statusColor: "#9C6F46",
        requestedChanges: "Need to add a custom PDF export feature for monthly reports.",
        attachments: [{ name: "export_spec.pdf", size: "1.2 MB", type: "pdf" }]
      },
      {
        id: "102",
        userName: "Sara Wilson",
        module: "E-commerce Dashboard",
        purchasedDate: "2024-04-10",
        status: "in_progress",
        statusColor: "#9C6F46",
        requestedChanges: "The inventory sync is lagging on mobile devices. Please optimize.",
        attachments: [{ name: "screen_record.mp4", size: "4.5 MB", type: "video" }]
      }
    ],

    purchasedModules: [
      { id: "1", name: "Inventory Management Pro", purchaseDate: "2024-03-15" },
      { id: "2", name: "E-commerce Dashboard", purchaseDate: "2024-04-10" },
    ],

    dataMapping: {
      status: {},
      modules: {}
    },
    // Animation settings
    animations: {
      entryTransition: "animate-in slide-in-from-bottom-4 fade-in duration-300",
    },
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",
      endpoints: {
        faqs: "/page/{page}/faqs",
        user_chats: "/user_chats/{user_id}",
        user_chat: "/user_chat/{user_id}/{chat_id}",
        user_messages: "/user_message/{user_id}/{chat_id}",
        create_message: "/user_message",
        create_user_chat: "/user_chat",
        delete_chat: "/user_chats/delete",
        developer_change_requests: "/developer/change-requests/",
        developer_change_request_details: "/developer/change-requests/{id}/",
        developer_change_request_update: "/developer/change-requests/{id}/",
        developer_change_requests_attachments_create: "/developer/change-requests/attachments/",
        user_change_requests: "/user/change-requests/",
        user_change_request_details: "/user/change-requests/{id}/",
        user_change_request_update: "/user/change-requests/{id}/",
        user_change_requests_attachments_create: "/user/change-requests/attachments/",
        user_change_request_delete: "/user/change-requests/{id}/",
        purchased_modules: "/user/purchased-modules/",
        user_change_requests_attachments_delete: "/user/change-requests/attachments/{id}/",
      },
      pageEndpoints: {
        home: "home",
        support: "support",
      }
    }
  }
};

export default APP_CONFIG;
export const CHAT_CONFIG: ChatConfig = APP_CONFIG.chat;
