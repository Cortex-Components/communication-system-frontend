export type Language = 'en' | 'ar';

export type Translations = {
  [key in Language]: Record<string, unknown>;
};

export const translations: Translations = {
  en: {
    home: "Home",
    support: "Support",
    devView: "Developer View",
    userView: "User View",
    welcomeHome: "Welcome Home",
    supportCenter: "Support Center",
    language: "العربية",
    chatWidget: {
      welcome: {
        title: "Hi There!",
        subtitle: "How can we help?",
        optionPrompt: "Please select an option below",
        chatBtn: "Chat with us",
        followBtn: "Follow previous request",
        gettingUpdates: "Getting latest updates...",
        noOptions: "No options available at the moment.",
      },
      followUp: {
        supportConversation: "Support Conversation",
        loadingMessages: "Loading messages...",
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
    }
  },
  ar: {
    home: "الرئيسية",
    support: "الدعم",
    devView: "عرض المطور",
    userView: "عرض المستخدم",
    welcomeHome: "مرحباً بك",
    supportCenter: "مركز الدعم",
    language: "English",
    chatWidget: {
      welcome: {
        title: "أهلاً بك!",
        subtitle: "كيف يمكننا مساعدتك؟",
        optionPrompt: "يرجى تحديد خيار أدناه",
        chatBtn: "تحدث معنا",
        followBtn: "متابعة طلب سابق",
        gettingUpdates: "جاري الحصول على أحدث التحديثات...",
        noOptions: "لا توجد خيارات متاحة حاليا.",
      },
      followUp: {
        supportConversation: "محادثة الدعم",
        loadingMessages: "جاري تحميل الرسائل...",
      },
      history: {
        title: "سجل المحادثات",
        recentChats: "المحادثات الأخيرة",
        noChats: "لا توجد محادثات حديثة.",
        actions: {
          select: "تحديد",
          selectAll: "تحديد الكل",
          deselectAll: "إلغاء التحديد",
          all: "الكل",
          undo: "تراجع",
          cancel: "إلغاء",
          delete: "حذف",
        },
        messages: {
          chatDeleted: "تم حذف المحادثة بنجاح",
          chatsDeleted: "تم حذف المحادثات بنجاح",
          deletedOne: "تم حذف محادثة واحدة",
          deletedMultiple: "تم حذف {count} محادثات",
          allChatsDeleted: "تم حذف جميع المحادثات",
        },
      },
    }
  }
};

