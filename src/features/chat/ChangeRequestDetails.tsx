import { X, FileText, Image as ImageIcon, Upload, Check, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "./context/ChatContext";
import { UserAttachment } from "../../services/chat-service";

interface MappedRequest {
  id: string;
  userName: string;
  module: string;
  purchasedDate: string;
  status: string;
  statusColor: string;
  requestedChanges: string;
  attachments: { id: number; name: string; size: string; type: string; url?: string }[];
}

interface ChangeRequestDetailsProps {
  requestId: string;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (data: { reply: string; files: File[] }) => void;
}

export const ChangeRequestDetails = ({ requestId, onClose, onCancel, onSubmit }: ChangeRequestDetailsProps) => {
  const { config, chatService, role } = useChat();
  const { style, colors, content } = config;
  const { detailsModal } = style;

  const [request, setRequest] = useState<MappedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("opened");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = role === "user" 
          ? await chatService.getUserChangeRequestDetails(Number(requestId))
          : await chatService.getDeveloperChangeRequestDetails(Number(requestId));
        if (res) {
          const mappedStatus = 
              res.status === "in_progress" ? "In progress" : 
              res.status === "completed" ? "Completed" : 
              res.status === "rejected" ? "Rejected" : "Opened";

          setRequest({
            id: res.id.toString(),
            userName: `User ${res.user_id}`,
            module: res.module_id.toString(),
            purchasedDate: new Date(res.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
            status: mappedStatus,
            statusColor: res.status === "completed" ? "#00642F" : 
                         res.status === "rejected" ? "#D9534F" : "#9C6F46",
            requestedChanges: res.change_details,
            attachments: res.user_attachments.map((a: UserAttachment) => ({
              id: a.id,
              name: a.title || (a.item ? a.item.split('/').pop() : `Attachment ${a.id || ''}`),
              size: "N/A",
              type: a.item?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
              url: a.item
            }))
          });
          setReply(res.reply || "");
          setStatus(res.status || "opened");
        }
      } catch (err) {
        console.error("Failed to fetch change request details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [requestId, chatService, role]);

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

  const handleRemoveExistingAttachment = async (attachmentId: number) => {
    if (!window.confirm("Delete this attachment?")) return;
    
    try {
      setIsSubmitting(true);
      await chatService.deleteUserAttachment(attachmentId);
      // Update local state
      setRequest(prev => prev ? {
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== attachmentId)
      } : null);
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Upload any attachments first
      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map(file =>
            role === "user"
              ? chatService.uploadUserAttachment(Number(requestId), file.name, file)
              : chatService.uploadDeveloperAttachment(Number(requestId), file.name, file)
          )
        );
      }

      if (role === "user") {
        await chatService.updateUserChangeRequest(Number(requestId), {
          status,
          reply
        });
      } else {
        await chatService.updateDeveloperChangeRequest(Number(requestId), {
          status,
          reply
        });
      }
      
      // Fallback to parents UI close
      onSubmit({ reply, files: selectedFiles });
    } catch (err) {
      console.error("Failed to update change request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this change request?")) return;
    
    try {
      setIsSubmitting(true);
      await chatService.deleteUserChangeRequest(Number(requestId));
      onClose(); // Close after deletion
    } catch (err) {
      console.error("Failed to delete change request:", err);
    } finally {
      setIsSubmitting(false);
    }
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
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <p>Loading details...</p>
             </div>
          ) : !request ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <p>Details could not be loaded.</p>
             </div>
          ) : (
            <>
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
            <p className="text-[17px] font-semibold flex items-center gap-2" style={{ color: colors.pureBlack }}>
              <span style={{ color: colors.primaryText }}>{content.details.labels.status}: </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`bg-transparent border outline-none font-semibold rounded-md px-2 py-1 ${role === "user" ? "opacity-90 cursor-default" : "cursor-pointer"}`}
                style={{ color: request.statusColor, borderColor: colors.border }}
                disabled={role === "user"}
              >
                <option value="opened">Opened</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
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
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[16px] font-semibold truncate" style={{ color: colors.primaryText }}>{file.name}</span>
                    <span className="text-[14px] font-medium" style={{ color: colors.mutedText }}>{file.size}</span>
                  </div>
                  {role === "user" && (
                    <button 
                      onClick={() => handleRemoveExistingAttachment(file.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t" style={{ borderColor: colors.border }} />

          {/* Reply section with dynamic title */}
          <div className="space-y-4 text-left">
            <h3 className="text-[20px] font-medium" style={{ color: colors.primaryText }}>
              {role === "user" ? "Add comments or details" : content.details.sections.reply}
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
        </>
      )}
      </div>

        {/* Footer Buttons */}
        <div className={`p-6 border-t grid ${role === "user" ? "grid-cols-3" : "grid-cols-2"} gap-4`} style={{ borderColor: colors.border }}>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ backgroundColor: colors.bgGray, color: colors.primaryText }}
          >
            {content.details.actions.cancel}
          </button>
          
          {role === "user" && (
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-red-500 text-white text-[18px] font-bold hover:bg-red-600 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              Delete
            </button>
          )}

          <button
            onClick={handleApiSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-white text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
            style={{ background: style.gradients.button }}
          >
            {isSubmitting ? "Wait..." : (role === "user" ? "Update" : content.details.actions.submit)}
          </button>
        </div>
      </div>
    </div>
  );
};


