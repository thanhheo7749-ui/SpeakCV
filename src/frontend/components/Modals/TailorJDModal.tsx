/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState } from "react";
import { X, Wand2, Loader2, CheckCircle, Target, AlertTriangle } from "lucide-react";

interface TailorJDModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (jdText: string) => Promise<void>;
  tailorSummary?: any;
  isLoading: boolean;
  onApplyChanges: () => void;
  onDiscardChanges: () => void;
}

export default function TailorJDModal({
  show,
  onClose,
  onSubmit,
  tailorSummary,
  isLoading,
  onApplyChanges,
  onDiscardChanges,
}: TailorJDModalProps) {
  const [jdText, setJdText] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    if (!jdText.trim()) return;
    onSubmit(jdText);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-blue-400" size={22} />
            Tối ưu CV theo Job Description
          </h3>
          <button
            onClick={isLoading ? undefined : onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {tailorSummary ? (
            // RESULTS VIEW
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle className="text-emerald-500" size={32} />
                </div>
                <h4 className="text-2xl font-bold text-white">Tối ưu hoàn tất!</h4>
                <p className="text-emerald-400 font-medium mt-1 text-lg">
                  Độ phù hợp: {tailorSummary.overall_score || 0}%
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl">
                  <h5 className="font-bold text-emerald-400 flex items-center gap-2 mb-3">
                    <CheckCircle size={16} /> Các cải thiện đã áp dụng
                  </h5>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tailorSummary.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                    {!tailorSummary.strengths?.length && (
                      <li className="text-slate-500 italic">Không có cải thiện đáng kể nào được thực hiện.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl">
                  <h5 className="font-bold text-amber-400 flex items-center gap-2 mb-3">
                    <Target size={16} /> Từ khóa còn thiếu (Gợi ý)
                  </h5>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tailorSummary.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                    {!tailorSummary.weaknesses?.length && (
                      <li className="text-slate-500 italic">CV đã chứa hầu hết các từ khóa quan trọng của JD!</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/50 flex gap-3 text-sm text-blue-200">
                <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div>
                  Thay đổi đã được hiển thị tạm thời trên CV của bạn. Hãy kiểm tra lại bản xem trước ở phía sau.
                  Bạn có muốn áp dụng các thay đổi này không?
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onDiscardChanges}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Hủy thay đổi
                </button>
                <button
                  onClick={onApplyChanges}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={18} /> Áp dụng vào CV
                </button>
              </div>
            </div>
          ) : (
            // INPUT VIEW
            <div className="space-y-5">
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-sm text-blue-200">
                <p className="flex items-start gap-2">
                  <Wand2 className="text-blue-400 shrink-0 mt-0.5" size={18} />
                  <span>
                    Dán nội dung <strong>Job Description (JD)</strong> vào bên dưới.
                    AI sẽ phân tích CV hiện tại của bạn và sắp xếp lại kinh nghiệm, tinh chỉnh từ khóa để tăng tỉ lệ vượt qua bộ lọc ATS của nhà tuyển dụng.
                  </span>
                </p>
                <p className="mt-2 text-xs text-blue-300/70 ml-6">
                  * CV Copilot tuân thủ quy tắc Không Bịa Đặt (No Hallucination) - AI sẽ chỉ cấu trúc lại và tối ưu 
                  những kỹ năng/kinh nghiệm bạn thực sự có trong CV gốc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Nội dung Job Description (JD)
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={isLoading}
                  placeholder="Dán nội dung JD (Yêu cầu công việc, kỹ năng, trách nhiệm) vào đây..."
                  className="w-full h-48 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none disabled:opacity-50"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Hỗ trợ Text tiếng Việt & tiếng Anh</span>
                  <span className={jdText.length > 5000 ? "text-red-400" : ""}>
                    {jdText.length} / 5000 ký tự
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !jdText.trim() || jdText.length > 6000}
                  className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang tối ưu CV...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} /> Tối ưu ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
