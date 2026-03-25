import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatWidget from "@/features/chat/ChatWidget";
import { useLanguage } from "@/contexts/useLanguage";

const Index = () => {
  const [role, setRole] = useState<"dev" | "user">("dev");
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  
  // Deriving current page from URL
  const currentPage: "home" | "support" = location.pathname === "/support" ? "support" : "home";

  return (
    <div className="min-h-screen bg-cortex-cream relative overflow-hidden transition-colors duration-500">
      {/* Background Subtle Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cortex-amber/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cortex-primary/10 rounded-full blur-[120px]" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-[#111111] text-white shadow-lg border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 md:gap-12 w-full md:w-auto overflow-visible">

          {/* Page Links */}
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <button
              onClick={() => navigate("/")}
              className={`text-[14px] md:text-[15px] font-semibold transition-all duration-300 relative whitespace-nowrap ${
                currentPage === "home" 
                  ? "text-white" 
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t("home")} 
              {currentPage === "home" && (
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => navigate("/support")}
              className={`text-[14px] md:text-[15px] font-semibold transition-all duration-300 relative whitespace-nowrap ${
                currentPage === "support" 
                  ? "text-white" 
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t("support")} 
              {currentPage === "support" && (
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4 md:ml-0 rtl:mr-4 rtl:md:mr-0 rtl:ml-0 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
             className="px-3 md:px-4 py-1.5 rounded-full font-semibold text-[12px] md:text-[13px] transition-all duration-300 whitespace-nowrap bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            {t("language")}
          </button>

          {/* Role Switcher */}
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-sm relative shrink-0">
            <button
              onClick={() => setRole("dev")}
              className={`px-3 md:px-5 py-1.5 rounded-full font-semibold text-[12px] md:text-[13px] transition-all duration-300 whitespace-nowrap ${
                role === "dev" 
                  ? "bg-white text-[#111] shadow-md scale-105" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("devView")}
            </button>
            <button
              onClick={() => setRole("user")}
              className={`px-3 md:px-5 py-1.5 rounded-full font-semibold text-[12px] md:text-[13px] transition-all duration-300 whitespace-nowrap ${
                role === "user" 
                  ? "bg-white text-[#111] shadow-md scale-105" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("userView")}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area (Visual representation of page change) */}
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-[#2B3D55] mb-6 tracking-tight">
          {currentPage === "home" ? t("welcomeHome") : t("supportCenter")}
        </h1>
      </main>

      <ChatWidget role={role} currentPage={currentPage} />
    </div>
  );
};

export default Index;

