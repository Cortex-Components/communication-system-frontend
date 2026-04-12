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
        requestBtn: "Request a change",
        gettingUpdates: "Getting latest updates...",
        noOptions: "No options available at the moment.",
      },
      followUp: {
        title: "Follow up on previous requests",
        supportConversation: "Support Conversation",
        loadingMessages: "Loading messages...",
      },
      changeRequests: {
        title: "Follow up on change requests",
        viewBtn: "View request",
        noDate: "No Date",
        noChanges: "No changes requested",
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
          replyPlaceholder: "Type your reply...",
          messagePlaceholder: "Enter Your Message...",
        },
        upload: {
          prompt: "Chose a file or drag & drop it here",
          limit: "Maximum 500 MB file size",
          btn: "Upload files",
        },
        actions: {
          cancel: "Cancel",
          submit: "Submit",
          reply: "Reply",
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
      createRequest: {
        details: "Change Request Details",
        moduleInfo: "Module Information",
        uploadPrompt: "Upload required files",
        labels: { module: "Module", purchased: "Purchased" },
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
      followUpOptions: [
        "Update a previous change request",
        "Delete a previous change request",
      ],
      modificationTags: [
        "Frontend",
        "Backend Logic",
        "Database",
        "Integration",
        "API Modification",
        "Bug Fix",
        "Performance Improvement",
        "Security Update",
        "Add New Feature",
        "Custom Business Logic",
      ],
      statusFilters: {
        all: "All",
        noResults: "No results for",
      },
      dataMapping: {
        status: {
          "pending": "Pending",
          "fixed": "Fixed",
          "closed": "Closed",
          "In progress": "In progress",
          "Completed": "Completed",
          "Rejected": "Rejected",
        },
        modules: {
          "Inventory Management": "Inventory Management",
          "Dashboard": "Dashboard",
          "E-commerce": "E-commerce",
        }
      }
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
        requestBtn: "طلب تغيير",
        gettingUpdates: "جاري الحصول على أحدث التحديثات...",
        noOptions: "لا توجد خيارات متاحة حاليا.",
      },
      followUp: {
        title: "متابعة الطلبات السابقة",
        supportConversation: "محادثة الدعم",
        loadingMessages: "جاري تحميل الرسائل...",
      },
      changeRequests: {
        title: "متابعة طلبات التغيير",
        viewBtn: "عرض الطلب",
        noDate: "بدون تاريخ",
        noChanges: "لم يتم طلب أي تغييرات",
      },
      details: {
        title: "تفاصيل طلب التغيير",
        labels: {
          client: "العميل",
          module: "الوحدة",
          purchased: "تاريخ الشراء",
          status: "الحالة",
        },
        sections: {
          requestedChanges: "التغييرات المطلوبة",
          attachments: "المرفقات",
          reply: "الرد على العميل",
          upload: "رفع الملفات",
          modifyPrompt: "ما الذي تود تعديله؟",
          seeAll: "رؤية الكل",
        },
        placeholders: {
          changes: "اشرح التغييرات التي تود إجراؤها...",
          replyPlaceholder: "اكتب ردك...",
          messagePlaceholder: "أدخل رسالتك...",
        },
        upload: {
          prompt: "اختر ملفاً أو اسحبه هنا",
          limit: "الحد الأقصى لحجم الملف المطروح 500 ميغابايت",
          btn: "رفع الملفات",
        },
        actions: {
          cancel: "إلغاء",
          submit: "إرسال",
          reply: "رد",
        }
      },
      userRequestChange: {
        title: "طلب تغيير",
        subtitle: "أدخل رابط الوحدة التي تريد طلب تغييرات لها.",
        placeholder: "الصق رابط الوحدة هنا",
        actions: {
          cancel: "إلغاء",
          continue: "متابعة",
        },
      },
      createRequest: {
        details: "تفاصيل طلب التغيير",
        moduleInfo: "معلومات الوحدة",
        uploadPrompt: "رفع الملفات المطلوبة",
        labels: { module: "الوحدة", purchased: "تاريخ الشراء" },
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
      followUpOptions: [
        "تحديث طلب تغيير سابق",
        "حذف طلب تغيير سابق",
      ],
      modificationTags: [
        "الواجهة الأمامية",
        "منطق الخلفية",
        "قاعدة البيانات",
        "التكامل",
        "تعديل الـ API",
        "إصلاح خطأ",
        "تحسين الأداء",
        "تحديث أمني",
        "إضافة ميزة جديدة",
        "منطق عمل مخصص",
      ],
      statusFilters: {
        all: "الكل",
        noResults: "لا توجد نتائج لـ",
      },
      dataMapping: {
        status: {
          "pending": "قيد الانتظار",
          "fixed": "تم الإصلاح",
          "closed": "مغلق",
          "In progress": "قيد التنفيذ",
          "Completed": "مكتمل",
          "Rejected": "مرفوض",
        },
        modules: {
          "Inventory Management": "إدارة المخزون",
          "Dashboard": "لوحة التحكم",
          "E-commerce": "التجارة الإلكترونية",
        }
      }
    }
  }
};

