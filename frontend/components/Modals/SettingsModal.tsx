import { X, Settings } from "lucide-react";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  voice: string;
  setVoice: (v: string) => void;
  mode: string;
  setMode: (m: string) => void;
  jd: string;
  setJd: (j: string) => void;
}

export default function SettingsModal({
  show,
  onClose,
  voice,
  setVoice,
  mode,
  setMode,
  jd,
  setJd,
}: SettingsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-700 p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex gap-2 items-center text-white">
            <Settings className="text-emerald-500" /> Cấu hình
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Chọn Chế độ phỏng vấn */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
              Chế độ phỏng vấn
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "general", name: "Phỏng vấn Chung" },
                { id: "behavioral", name: "Hành vi (STAR)" },
                { id: "technical", name: "Kỹ thuật / Code" },
                { id: "english", name: "Luyện Tiếng Anh" },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-4 border rounded-xl cursor-pointer font-bold transition-all duration-200 text-sm flex items-center justify-center text-center
                            ${
                              mode === m.id
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                            }`}
                >
                  {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Chọn Giọng đọc */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
              Giọng AI
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setVoice("en-US-AndrewMultilingualNeural")}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 text-sm flex flex-col items-center gap-1
                        ${
                          voice.includes("Andrew")
                            ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                            : "border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                        }`}
              >
                <span className="font-bold">Andrew (Việt Kiều)</span>
                <span className="text-[10px] opacity-70">
                  Giọng Nam trầm ấm
                </span>
              </div>

              <div
                onClick={() => setVoice("vi-VN-NamMinhNeural")}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 text-sm flex flex-col items-center gap-1
                        ${
                          voice.includes("NamMinh")
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                        }`}
              >
                <span className="font-bold">Nam Minh</span>
                <span className="text-[10px] opacity-70">
                  Giọng Bắc truyền thống
                </span>
              </div>
            </div>
          </div>

          {/* 3. Nhập JD */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
              Mô tả công việc (JD)
            </label>
            <textarea
              className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 rounded-xl p-4 text-white text-sm outline-none transition-colors placeholder:text-slate-600 custom-scrollbar"
              rows={4}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste nội dung JD vào đây để AI phỏng vấn sát thực tế hơn..."
            />
          </div>

          {/* Nút Lưu */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
