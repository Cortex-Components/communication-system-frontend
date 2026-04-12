import React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useChat } from "./context/ChatContext";

interface SubmissionStatusModalProps {
  status: "success" | "error";
  message: string;
  onClose: () => void;
}

export const SubmissionStatusModal = ({ status, message, onClose }: SubmissionStatusModalProps) => {
  const { config } = useChat();
  const { colors, style } = config;

  const isSuccess = status === "success";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[400px] shadow-2xl flex flex-col items-center text-center p-8 animate-in zoom-in-95 duration-300"
        style={{ borderRadius: "24px" }}
      >
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className={`mb-6 p-4 rounded-full ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          {isSuccess ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>

        <h2 className="text-[24px] font-bold mb-2" style={{ color: colors.primaryText }}>
          {isSuccess ? "Success!" : "Submission Failed"}
        </h2>
        
        <p className="text-[16px] text-muted-foreground mb-8">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-white text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
          style={{ background: style.gradients.button }}
        >
          {isSuccess ? "Done" : "Try Again"}
        </button>
      </div>
    </div>
  );
};
