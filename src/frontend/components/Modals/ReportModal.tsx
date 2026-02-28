import {
  X,
  Trophy,
  Target,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Mic,
} from "lucide-react";
import { useState } from "react";

// Thêm prop `hasHistory` vào đây
export default function ReportModal({
  show,
  onClose,
  result,
  onRetry,
  hasHistory,
}: any) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!show) return null;

  // 1. TRƯỜNG HỢP: CHƯA CÓ LỊCH SỬ PHỎNG VẤN NÀO
  if (!hasHistory) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-slate-900 w-full max-w-lg p-10 rounded-3xl border border-slate-700 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <Mic size={40} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Bạn chưa bắt đầu phỏng vấn
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Hệ thống cần thu thập lịch sử trò chuyện để có thể đưa ra đánh giá.
            Hãy ra ngoài, bật Mic lên và trò chuyện với AI một vài câu nhé!
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold text-white w-full transition-all active:scale-95"
          >
            Quay lại Phỏng vấn
          </button>
        </div>
      </div>
    );
  }

  // 2. TRƯỜNG HỢP: ĐÃ CÓ LỊCH SỬ (VẼ BÁO CÁO NHƯ BÌNH THƯỜNG)
  const report =
    typeof result === "object" && result !== null
      ? result
      : {
          score: 0,
          overall_feedback: "Đang phân tích dữ liệu...",
          details: [],
        };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400 border-emerald-400";
    if (score >= 5) return "text-yellow-400 border-yellow-400";
    return "text-red-400 border-red-400";
  };
  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-emerald-500/10";
    if (score >= 5) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-black flex gap-3 text-white items-center tracking-wide">
            <Trophy className="text-yellow-500" size={28} />
            BÁO CÁO PHÂN TÍCH PHỎNG VẤN
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div
              className={`w-full md:w-1/3 rounded-3xl border-2 flex flex-col items-center justify-center p-8 ${getScoreColor(report.score)} ${getScoreBg(report.score)}`}
            >
              <p className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-2 border-b border-current/20 pb-2">
                Điểm đánh giá
              </p>
              <div className="text-7xl font-black my-2 tracking-tighter">
                {report.score}
                <span className="text-3xl text-current/50">/10</span>
              </div>
              <p className="text-sm font-medium mt-2 opacity-80 text-center">
                {report.score >= 8
                  ? "Xuất sắc! Bạn đã sẵn sàng."
                  : report.score >= 5
                    ? "Khá ổn, cần cải thiện thêm."
                    : "Cần luyện tập nhiều hơn."}
              </p>
            </div>

            <div className="w-full md:w-2/3 bg-slate-800/50 rounded-3xl border border-slate-700 p-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-5">
                <Target size={150} />
              </div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-blue-400" size={20} /> Đánh giá tổng
                quan từ AI HR
              </h3>
              <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-line relative z-10">
                {report.overall_feedback}
              </p>
            </div>
          </div>

          {/* CHI TIẾT CÂU HỎI */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
              <MessageCircle className="text-purple-400" size={24} /> Phân Tích
              Chi Tiết Từng Câu Hỏi
            </h3>
            {report.details && report.details.length > 0 ? (
              <div className="space-y-4">
                {report.details.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden"
                  >
                    <div
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/80"
                    >
                      <div className="flex gap-4 items-center">
                        <span className="bg-blue-600/20 text-blue-400 font-black text-lg w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-white text-[15px] line-clamp-2 pr-4">
                          {item.question}
                        </h4>
                      </div>
                      <div className="text-slate-500">
                        {expandedIndex === index ? (
                          <ChevronUp size={24} />
                        ) : (
                          <ChevronDown size={24} />
                        )}
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <div className="p-6 pt-2 bg-slate-900 border-t border-slate-800 space-y-6">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                            Bạn đã trả lời:
                          </p>
                          <div className="bg-slate-950 p-4 rounded-xl text-slate-300 text-sm italic border-l-4 border-slate-600 leading-relaxed">
                            "{item.candidate_answer}"
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl">
                            <p className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                              <AlertCircle size={16} /> Phân tích & Nhận xét
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {item.evaluation}
                            </p>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
                            <p className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                              <CheckCircle2 size={16} /> Gợi ý câu trả lời mẫu
                            </p>
                            <p className="text-sm text-emerald-100/80 leading-relaxed font-medium">
                              {item.ideal_answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8 border border-dashed border-slate-700 rounded-2xl">
                Đang chờ AI phân tích dữ liệu...
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors"
          >
            Tiếp tục phỏng vấn
          </button>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <RotateCcw size={18} /> Phỏng Vấn Lại Từ Đầu
          </button>
        </div>
      </div>
    </div>
  );
}
