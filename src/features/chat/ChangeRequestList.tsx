import { X, ArrowLeft, Settings2, Check } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useChat } from "./context/ChatContext";
import { UserAttachment } from "../../services/chat-service";

interface ChangeRequestListProps {
  onClose: () => void;
  onBack: () => void;
  onViewRequest: (requestId: string) => void;
  onChatWithUs: () => void;
}

export const ChangeRequestList = ({ onClose, onBack, onViewRequest, onChatWithUs }: ChangeRequestListProps) => {
  const { config, chatService, role } = useChat();
  const { changeRequests, colors, content, statusFilters, style } = config;

  const [filterStatus, setFilterStatus] = useState<string>(statusFilters.all);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [apiRequests, setApiRequests] = useState(changeRequests);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = role === "user" 
          ? await chatService.getUserChangeRequests()
          : await chatService.getDeveloperChangeRequests();
        if (res && res.results) {
          const formatted = res.results.map((req) => {
            const mappedStatus = 
              req.status === "in_progress" ? "In progress" : 
              req.status === "completed" ? "Completed" : 
              req.status === "rejected" ? "Rejected" : "Opened";
            
            return {
              id: req.id.toString(),
              userName: `User ${req.user_id}`,
              module: req.module_id.toString(),
              purchasedDate: new Date(req.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
              status: mappedStatus,
              statusColor: req.status === "completed" ? "#00642F" : 
                           req.status === "rejected" ? "#D9534F" : "#9C6F46",
              requestedChanges: req.change_details,
              attachments: req.user_attachments.map((a: UserAttachment) => ({
                name: a.title || (a.item ? a.item.split('/').pop() : `Attachment ${a.id || ''}`),
                size: "N/A",
                type: a.item?.toLowerCase().endsWith(".pdf") ? "pdf" : "image"
              }))
            };
          });
          if (formatted.length > 0) {
            setApiRequests(formatted);
          } else {
            // Fallback to mock data from config for testing
            setApiRequests(config.changeRequests || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch change requests, using fallback:", err);
        setApiRequests(config.changeRequests || []);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [chatService, role, config.changeRequests]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === statusFilters.all) return apiRequests;
    return apiRequests.filter(r => r.status === filterStatus || config.dataMapping.status[r.status] === filterStatus);
  }, [apiRequests, filterStatus, statusFilters.all, config.dataMapping.status]);

  const statuses = useMemo(() => [statusFilters.all, ...new Set(apiRequests.map(r => config.dataMapping.status[r.status] || r.status))], [apiRequests, statusFilters.all, config.dataMapping.status]);

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
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

      <div className="px-6 mt-2 mb-6 flex items-center justify-between text-left shrink-0">
        <h2 className="text-[22px] font-medium" style={{ color: colors.primaryText }}>
          {content.changeRequests.title}
        </h2>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-all border ${isFilterOpen ? 'bg-slate-100 border-slate-300' : 'border-slate-200'}`}
            style={{ color: isFilterOpen ? colors.primaryText : colors.secondaryText }}
          >
            <Settings2 className="w-5 h-5" />
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-[60] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-2 flex flex-col gap-1">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setIsFilterOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status 
                        ? "bg-cortex-cream/30 text-cortex-black" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {status}
                    {filterStatus === status && <Check className="w-4 h-4 text-cortex-black" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Cards */}
      <div className="flex-1 px-5 pb-8 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col gap-4 items-center w-full px-1 overflow-y-auto pb-4 custom-scrollbar">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                <p>Loading requests...</p>
             </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div 
                key={request.id}
                className="w-full max-w-[368px] rounded-[12px] bg-cortex-gray px-5 py-4 flex flex-col gap-3 shadow-sm text-left border border-black/5"
              >
                <div className="space-y-0.5">
                  <h3 className="text-[19px] font-bold" style={{ color: colors.primaryText }}>{request.userName}</h3>
                  <div className="space-y-0 text-[15px] font-semibold" style={{ color: colors.pureBlack }}>
                    <p>
                      <span style={{ color: colors.primaryText }}>{content.details.labels.module}: </span>
                      {config.dataMapping.modules[request.module] || request.module}
                    </p>
                    <p>
                      <span style={{ color: colors.primaryText }}>{content.details.labels.purchased}: </span>
                      {request.purchasedDate}
                    </p>
                    <p>
                      <span style={{ color: colors.primaryText }}>{content.details.labels.status}: </span>
                      <span style={{ color: request.statusColor }}>{config.dataMapping.status[request.status] || request.status}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onViewRequest(request.id)}
                  className="w-full py-2.5 rounded-[10px] text-base font-bold hover:brightness-95 transition-all shadow-sm"
                  style={{ backgroundColor: colors.cream, color: colors.black }}
                >
                  {content.changeRequests.viewBtn}
                </button>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
              <p>{statusFilters.noResults} "{filterStatus}"</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 shrink-0 px-1 border-t border-slate-100">
          <button
            onClick={onChatWithUs}
            className="w-full py-3.5 px-4 rounded-[14px] text-white text-[18px] hover:text-cortex-cream font-semibold transition-all shadow-md active:scale-[0.99]"
            style={{ background: style.gradients.button }}
          >
            {content.welcome.chatBtn}
          </button>
        </div>
      </div>
      
      {/* Overlay to close filter when clicking outside */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 z-[55]" 
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};



