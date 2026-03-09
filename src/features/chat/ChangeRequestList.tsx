import { X, ArrowLeft, Settings2 } from "lucide-react";
import { CHAT_CONFIG } from "./config";

interface ChangeRequestListProps {
  onClose: () => void;
  onBack: () => void;
  onViewRequest: (requestId: string) => void;
  onChatWithUs: () => void;
}

export const ChangeRequestList = ({ onClose, onBack, onViewRequest, onChatWithUs }: ChangeRequestListProps) => {
  const { changeRequests, colors, content } = CHAT_CONFIG;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100/50 transition-colors"
          style={{ color: colors.mutedText }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100/50 transition-colors"
          style={{ color: colors.mutedText }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 mt-2 mb-6 flex items-center justify-between text-left">
        <h2 className="text-[22px] font-medium" style={{ color: colors.primaryText }}>
          {content.changeRequests.title}
        </h2>
        <button 
          className="p-1 transition-colors"
          style={{ color: colors.secondaryText }}
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {/* Request Cards */}
      <div className="flex-1 px-5 pb-8 flex flex-col min-h-0">
        <div className="flex flex-col gap-4 items-center w-full px-1 overflow-y-auto pb-4">
          {changeRequests.map((request) => (
            <div 
              key={request.id}
              className="w-full max-w-[368px] rounded-[12px] bg-cortex-gray px-5 py-4 flex flex-col gap-3 shadow-sm text-left"
            >
              <div className="space-y-0.5">
                <h3 className="text-[19px] font-bold" style={{ color: colors.primaryText }}>{request.userName}</h3>
                <div className="space-y-0">
                  <p className="text-[15px] font-semibold" style={{ color: colors.pureBlack }}>
                    <span style={{ color: colors.primaryText }}>{content.details.labels.module}: </span>
                    {request.module}
                  </p>
                  <p className="text-[15px] font-semibold" style={{ color: colors.pureBlack }}>
                    <span style={{ color: colors.primaryText }}>{content.details.labels.purchased}: </span>
                    {request.purchasedDate}
                  </p>
                  <p className="text-[15px] font-semibold" style={{ color: colors.pureBlack }}>
                    <span style={{ color: colors.primaryText }}>{content.details.labels.status}: </span>
                    <span style={{ color: request.statusColor }}>{request.status}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onViewRequest(request.id)}
                className="w-full py-2 rounded-[10px] text-base font-medium hover:brightness-95 transition-all shadow-sm"
                style={{ backgroundColor: colors.cream, color: colors.black }}
              >
                {content.changeRequests.viewBtn}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2 shrink-0">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-[14px] bg-cortex-button-gradient text-white text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.99]"
          >
            {content.welcome.chatBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
