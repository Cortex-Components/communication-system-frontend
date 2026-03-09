import { useState } from "react";
import ChatWidget from "@/features/chat/ChatWidget";

const Index = () => {
  const [role, setRole] = useState<"dev" | "user">("dev");

  return (
    <div className="min-h-screen bg-cortex-cream relative overflow-hidden">
      {/* Role Switcher */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 shadow-xl">
        <button
          onClick={() => setRole("dev")}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            role === "dev" 
              ? "bg-cortex-button-gradient text-white shadow-lg scale-[1.02]" 
              : "text-slate-600 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          Developer
        </button>
        <button
          onClick={() => setRole("user")}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            role === "user" 
              ? "bg-cortex-button-gradient text-white shadow-lg scale-[1.02]" 
              : "text-slate-600 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          User
        </button>
      </div>
      <ChatWidget role={role} />
    </div>
  );
};

export default Index;
