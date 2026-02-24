import { X, Settings2, Sliders, Clock, Target } from "lucide-react";

export default function SettingsModal({
  show,
  onClose,
  voice,
  setVoice,
  mode,
  setMode,
  jd,
  setJd,
  interviewType,
  setInterviewType,
  questionLimit,
  setQuestionLimit,
  timeLimit,
  setTimeLimit,
}: any) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Settings2 className="text-blue-400" /> Cài đặt Phỏng vấn
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* CÀI ĐẶT LUẬT CHƠI (CHẾ ĐỘ) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Target size={16} /> Hình thức Phỏng vấn
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setInterviewType("free")}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all ${interviewType === "free" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
              >
                Tự do (Không áp lực)
              </button>
              <button
                onClick={() => setInterviewType("timed")}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all ${interviewType === "timed" ? "bg-red-600/20 border-red-500 text-red-400" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
              >
                Áp lực (Tính giờ)
              </button>
            </div>

            {/* Chỉ hiện khi chọn chế độ Tính giờ */}
            {interviewType === "timed" && (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5 animate-in slide-in-from-top-2">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Giới hạn số câu hỏi
                    </label>
                    <span className="text-yellow-400 font-bold">
                      {questionLimit} câu
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={questionLimit}
                    onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                      <Clock size={14} /> Thời gian trả lời / câu
                    </label>
                    <span className="text-red-400 font-bold">
                      {timeLimit} giây
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* CÁC CÀI ĐẶT CŨ CỦA BẠN (GIỮ NGUYÊN) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} /> Cấu hình AI
            </h3>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Ngôn ngữ & Giọng đọc
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                <option value="en-US-AndrewMultilingualNeural">
                  Tiếng Anh (Andrew - Nam)
                </option>
                <option value="vi-VN-HoaiMyNeural">
                  Tiếng Việt (Hoài My - Nữ)
                </option>
                <option value="vi-VN-NamMinhNeural">
                  Tiếng Việt (Nam Minh - Nam)
                </option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Phong cách hỏi
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="general">Thân thiện, tổng quan</option>
                <option value="technical">Kỹ thuật, chuyên sâu</option>
                <option value="behavioral">Tình huống (Behavioral)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Mô tả công việc (JD)
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white h-24 outline-none focus:border-blue-500 custom-scrollbar"
                placeholder="Dán nội dung JD vào đây để AI hỏi sát thực tế..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-white font-bold transition-all"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
}
