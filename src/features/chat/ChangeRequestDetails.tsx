import { X, Paperclip, FileText, Image as ImageIcon, Upload } from "lucide-react";
import { CHAT_CONFIG } from "./config";

interface ChangeRequestDetailsProps {
  requestId: string;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ChangeRequestDetails = ({ requestId, onClose, onCancel, onSubmit }: ChangeRequestDetailsProps) => {
  const { changeRequests, style, colors, content } = CHAT_CONFIG;
  const request = changeRequests.find((r) => r.id === requestId) || changeRequests[0];
  const { detailsModal } = style;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white w-full shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ 
          maxWidth: `min(${detailsModal.width}, calc(100vw - 32px))`, 
          height: `min(${detailsModal.height}, calc(100vh - 40px))`,
          borderRadius: detailsModal.borderRadius 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b text-left" style={{ borderColor: colors.border }}>
          <h2 className="text-[22px] font-medium" style={{ color: colors.primaryText }}>
            {content.details.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors"
            style={{ color: colors.mutedText }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 min-h-0">
          {/* Info */}
          <div className="space-y-0.5 text-left">
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.client}: </span>
              {request.userName}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.module}: </span>
              {request.module}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.purchased}: </span>
              {request.purchasedDate}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.status}: </span>
              <span style={{ color: request.statusColor }}>{request.status}</span>
            </p>
          </div>

          <div className="border-t" style={{ borderColor: colors.border }} />

          {/* Requested Changes */}
          <div className="space-y-4 text-left">
            <h3 className="text-[20px] font-medium" style={{ color: colors.primaryText }}>
              {content.details.sections.requestedChanges}
            </h3>
            <div className="rounded-2xl p-5 shadow-sm text-[15px] leading-relaxed" style={{ backgroundColor: colors.cream, color: colors.primaryText + 'E6' }}>
              {request.requestedChanges}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4 text-left">
            <h3 className="text-[20px] font-medium" style={{ color: colors.primaryText }}>
              {content.details.sections.attachments}
            </h3>
            <div className="flex flex-wrap gap-3">
              {(request.attachments || []).map((file, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 rounded-2xl p-4 shadow-sm border w-full max-w-[280px]"
                  style={{ backgroundColor: colors.cream, borderColor: colors.tan }}
                >
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border relative" style={{ borderColor: '#E2E8F0' }}>
                    {file.type === 'pdf' ? (
                       <FileText className="w-8 h-8" style={{ color: colors.primaryText }} />
                    ) : (
                      <ImageIcon className="w-8 h-8" style={{ color: colors.primaryText }} />
                    )}
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-white bg-slate-900 rounded-md px-1 py-0.5 uppercase">
                      {file.type}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-semibold truncate max-w-[140px]" style={{ color: colors.primaryText }}>{file.name}</span>
                    <span className="text-[14px] font-medium" style={{ color: colors.mutedText }}>{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t" style={{ borderColor: colors.border }} />

          {/* Reply to the client */}
          <div className="space-y-4 text-left">
            <h3 className="text-[20px] font-medium" style={{ color: colors.primaryText }}>
              {content.details.sections.reply}
            </h3>
            <textarea
              placeholder="Write your response or ask for more details..."
              className="w-full h-32 rounded-2xl p-5 outline-none resize-none"
              style={{ backgroundColor: colors.bgGray, color: colors.primaryText }}
            />
          </div>

          {/* Upload files */}
          <div className="space-y-4 text-left pb-4">
            <h3 className="text-[20px] font-medium flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Upload className="w-5 h-5" />
              {content.details.sections.upload}
            </h3>
            <div className="border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center gap-4" style={{ borderColor: colors.border }}>
              <button className="flex items-center gap-2 bg-white px-8 py-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-semibold hover:bg-slate-50 transition-all border" style={{ color: colors.primaryText, borderColor: '#E2E8F0' }}>
                <Upload className="w-5 h-5" />
                {content.details.upload.btn}
              </button>
              <div className="text-center">
                <p className="text-[18px] font-semibold" style={{ color: colors.primaryText }}>
                  {content.details.upload.prompt}
                </p>
                <p className="text-[14px] font-medium" style={{ color: colors.mutedText }}>
                  {content.details.upload.limit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t grid grid-cols-2 gap-4" style={{ borderColor: colors.border }}>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ backgroundColor: colors.bgGray, color: '#334155' }}
          >
            {content.details.actions.cancel}
          </button>
          <button
            onClick={onSubmit}
            className="w-full py-3.5 rounded-xl bg-cortex-button-gradient text-white text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
          >
            {content.details.actions.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

