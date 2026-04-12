import { X, Upload, Check, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useChat } from "./context/ChatContext";

interface CreateChangeRequestProps {
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (data: { tags: string[]; details: string; files: File[] }) => Promise<void> | void;
}

export const CreateChangeRequest = ({ onClose, onCancel, onSubmit }: CreateChangeRequestProps) => {
  const { config } = useChat();
  const { style, colors, content, modificationTags } = config;
  const { detailsModal } = style;
  
  const [selectedTags, setSelectedTags] = useState<string[]>(modificationTags.slice(0, 4));
  const [details, setDetails] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white w-full shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 text-left"
        style={{ 
          maxWidth: `min(${detailsModal.width}, calc(100vw - 24px))`, 
          maxHeight: `min(${detailsModal.height}, calc(100vh - 24px))`,
          borderRadius: detailsModal.borderRadius 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: colors.border }}>
          <h2 className="text-[20px] sm:text-[24px] font-medium truncate pr-4" style={{ color: colors.primaryText }}>
            {content.details.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-all shadow-sm"
            style={{ color: colors.primaryText }}
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7 font-light" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0 custom-scrollbar">
          {/* Modification Tags */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] sm:text-[20px] font-medium" style={{ color: colors.primaryText }}>
                {content.details.sections.modifyPrompt}
              </h3>
              <button className="text-[15px] sm:text-[17px] font-medium opacity-50 hover:opacity-100 transition-opacity" style={{ color: colors.primaryText }}>
                {content.details.sections.seeAll}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {modificationTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[13px] sm:text-[15px] font-medium transition-all ${
                      isSelected 
                        ? "shadow-sm" 
                        : "border border-transparent"
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? colors.cream : colors.bgGray,
                      color: isSelected ? colors.primaryText : colors.black,
                      border: isSelected ? `1.5px solid ${colors.tan}` : "1.5px solid transparent"
                    }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-[17px] sm:text-[20px] font-medium" style={{ color: colors.primaryText }}>
              {content.details.sections.requestedChanges}
            </h3>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={content.details.placeholders.changes}
              className="w-full h-32 sm:h-40 rounded-2xl p-4 sm:p-6 outline-none resize-none text-[15px] sm:text-[16px] font-medium"
              style={{ 
                backgroundColor: colors.bgGray, 
                color: colors.wordsGray,
                caretColor: colors.primaryText 
              }}
            />
          </div>


          {/* Upload files */}
          <div className="space-y-3 sm:space-y-4 pb-2">
            <h3 className="text-[17px] sm:text-[20px] font-medium flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              {content.details.sections.upload}
            </h3>
            <div 
              className="border-2 border-dashed rounded-[20px] sm:rounded-[24px] p-6 sm:p-10 flex flex-col items-center justify-center gap-3 sm:gap-4 border-slate-200" 
              style={{ borderColor: colors.border }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
              />
              <button 
                onClick={triggerUpload}
                className="flex items-center gap-2 bg-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-bold text-[16px] sm:text-[18px] hover:bg-slate-50 transition-all border border-slate-100" 
                style={{ color: colors.primaryText }}
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                {content.details.upload.btn}
              </button>
              <div className="text-center">
                <p className="text-[15px] sm:text-[18px] font-semibold" style={{ color: colors.primaryText }}>
                  {content.details.upload.prompt}
                </p>
                <p className="text-[12px] sm:text-[14px] font-medium opacity-50" style={{ color: colors.primaryText }}>
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
        <div className="px-6 py-5 border-t grid grid-cols-2 gap-4 shrink-0" style={{ borderColor: colors.border }}>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl font-bold text-[16px] sm:text-[18px] hover:brightness-95 transition-all shadow-md active:scale-[0.98]"
            style={{ backgroundColor: colors.bgGray, color: '#2B3D55' }}
          >
            {content.details.actions.cancel}
          </button>
          <button
            onClick={async () => {
              try {
                setIsSubmitting(true);
                await onSubmit({ tags: selectedTags, details, files: selectedFiles });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-white text-[16px] sm:text-[18px] font-bold hover:brightness-95 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: style.gradients.button }}
          >
            {isSubmitting ? "Submitting..." : content.details.actions.submit}
          </button>
        </div>
      </div>
    </div>
  );
};


