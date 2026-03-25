import { X, FileText, Image as ImageIcon, Upload, Check, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useChat } from "./context/ChatContext";

interface ChangeRequestDetailsProps {
  requestId: string;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (data: { reply: string; files: File[] }) => void;
}

export const ChangeRequestDetails = ({ requestId, onClose, onCancel, onSubmit }: ChangeRequestDetailsProps) => {
  const { config } = useChat();
  const { changeRequests, style, colors, content } = config;
  const request = changeRequests.find((r) => r.id === requestId) || changeRequests[0];
  const { detailsModal } = style;

  const [reply, setReply] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

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

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 min-h-0 custom-scrollbar">
          {/* Info */}
          <div className="space-y-0.5 text-left">
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.client}: </span>
              {request.userName}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.module}: </span>
              {config.dataMapping.modules[request.module] || request.module}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.purchased}: </span>
              {request.purchasedDate}
            </p>
            <p className="text-[17px] font-semibold" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.status}: </span>
              <span style={{ color: request.statusColor }}>{config.dataMapping.status[request.status] || request.status}</span>
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
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your response or ask for more details..."
              className="w-full h-32 rounded-2xl p-5 outline-none resize-none"
              style={{ backgroundColor: colors.bgGray, color: colors.wordsGray }}
            />
          </div>

          {/* Upload files */}
          <div className="space-y-4 text-left pb-4">
            <h3 className="text-[20px] font-medium flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Upload className="w-5 h-5" />
              {content.details.sections.upload}
            </h3>
            <div className="border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center gap-4" style={{ borderColor: colors.border }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
              />
              <button 
                onClick={triggerUpload}
                className="flex items-center gap-2 bg-white px-8 py-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-semibold hover:bg-slate-50 transition-all border" 
                style={{ color: colors.primaryText, borderColor: '#E2E8F0' }}
              >
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

            {/* File List */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 truncate pr-2">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-medium truncate" style={{ color: colors.primaryText }}>
                        {file.name}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t grid grid-cols-2 gap-6" style={{ borderColor: colors.border }}>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ backgroundColor: colors.bgGray, color: colors.primaryText }}
          >
            {content.details.actions.cancel}
          </button>
          <button
            onClick={() => onSubmit({ reply, files: selectedFiles })}
            className="w-full py-3.5 rounded-xl text-white text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ background: style.gradients.button }}
          >
            {content.details.actions.submit}
          </button>
        </div>
      </div>
    </div>
  );
};


