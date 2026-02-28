import { X, History, Trophy, Calendar, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { getHistory } from "@/services/api";

export default function HistoryModal({ show, onClose }: any) {
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setLoading(true);
      getHistory()
        .then((data) => {
          setHistories(data.histories || []);
        })
        .finally(() => setLoading(false));
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <History className="text-blue-400" /> Lịch sử luyện tập
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-center text-slate-400 mt-10 animate-pulse">
              Đang tải dữ liệu...
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center text-slate-500 mt-20 border border-dashed border-slate-700 p-10 rounded-2xl">
              Bạn chưa có bài phỏng vấn nào. Hãy bắt đầu luyện tập ngay nhé!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {histories.map((h: any, i: number) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-slate-600 transition-all flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2 text-[15px]">
                        <Briefcase size={16} className="text-blue-400" />{" "}
                        {h.position || "Vị trí tự do"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={12} />{" "}
                        {new Date(h.created_at).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(h.created_at).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg font-black text-lg ${h.score >= 8 ? "bg-emerald-500/20 text-emerald-400" : h.score >= 5 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {h.score}/10
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {h.overall_feedback}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>
                      Đã trả lời: {h.details ? h.details.length : 0} câu
                    </span>
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      (Tính năng xem chi tiết đang cập nhật)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
