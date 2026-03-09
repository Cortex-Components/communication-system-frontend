export const CHAT_CONFIG = {
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
    name: "Ahmed",
  },
  
  assistant: {
    name: "Assistant",
    defaultResponse: "Great question! Let me look into that for you.",
    arabicResponse: "أكيد طبعا اتفضل",
  },

  // Menu Options
  quickReplies: [
    "Ask about a module",
    "Request a change",
    "Give feedback",
  ],

  followUpOptions: [
    "change request status",
    "bug report status",
    "support request",
    "Update a previous change request",
    "payment issue",
    "complaint",
  ],

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

  // Animation settings
  animations: {
    entryTransition: "animate-in slide-in-from-bottom-4 fade-in duration-300",
  }
};
