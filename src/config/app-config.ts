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
  };
  roles: {
    dev: string;
    user: string;
  };
  user: {
    id: number;
    name: string;
  };

  assistant: {
    name: string;
    defaultResponse: string;
    arabicResponse: string;
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
    baseUrl: "/api/v1",

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
    },

    pageEndpoints: {
      home: "home",
      support: "support",
    }
  },


  general: {
    appName: "Communication System",
    supportEmail: "support@gmail.com",
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
        title: "Hi There!",
        subtitle: "How can we help?",
        optionPrompt: "Please select an option below",
        chatBtn: "Chat with us",
        followBtn: "Follow previous request",
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
        }
      }
    },

    // Roles
    roles: {
      dev: "dev",
      user: "user",
    },

    // Content & Persona
    user: {
      id: 0,
      name: "Ahmed",
    },

    
    assistant: {
      name: "Assistant",
      defaultResponse: "Great question! Let me look into that for you.",
      arabicResponse: "أكيد طبعا اتفضل",
    },

    followUpOptions: [
      "change request status",
      "bug report status",
      "support request",
      "Update a previous change request",
      "payment issue",
      "complaint",
    ],

    modificationTags: [
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
        id: "1",
        userName: "Ahmed Waleed",
        module: "Inventory Management",
        purchasedDate: "12 Mar 2025",
        status: "In progress",
        statusColor: "#9C6F46",
        requestedChanges: "The client requested additional reporting features in the inventory module...",
        attachments: [
          { name: "requirements.pdf", size: "20 MB", type: "pdf" },
          { name: "screenshot.png", size: "20 MB", type: "png" },
        ]
      },
      {
        id: "2",
        userName: "Ahmed Waleed",
        module: "Inventory Management",
        purchasedDate: "12 Mar 2025",
        status: "Completed",
        statusColor: "#00642F",
        requestedChanges: "Implemented custom export to excel functionality.",
        attachments: [
          { name: "final_report.pdf", size: "15 MB", type: "pdf" },
        ]
      },
      {
        id: "3",
        userName: "Ahmed Waleed",
        module: "Inventory Management",
        purchasedDate: "12 Mar 2025",
        status: "In progress",
        statusColor: "#9C6F46",
        requestedChanges: "Add support for multiple warehouses.",
        attachments: []
      },
    ],

    purchasedModules: [
      { id: "1", name: "Inventory Management", purchaseDate: "12 Mar 2025" },
      { id: "2", name: "Inventory Management", purchaseDate: "12 Mar 2025" },
      { id: "3", name: "Inventory Management", purchaseDate: "12 Mar 2025" },
      { id: "4", name: "Inventory Management", purchaseDate: "12 Mar 2025" },
    ],

    // Animation settings
    animations: {
      entryTransition: "animate-in slide-in-from-bottom-4 fade-in duration-300",
    },
    api: {
      baseUrl: "/api/v1",
      endpoints: {
        faqs: "/page/{page}/faqs",
        user_chats: "/user_chats/{user_id}",
        user_chat: "/user_chat/{user_id}/{chat_id}",
        user_messages: "/user_message/{user_id}/{chat_id}",
        create_message: "/user_message",
        create_user_chat: "/user_chat",
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
