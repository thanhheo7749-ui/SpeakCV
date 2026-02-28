import { RefreshCcw, Eraser, Send } from "lucide-react";

interface ChatBoxProps {
  userText: string;
  tempText: string;
  aiText: string;
  status: string;
  onUserTextChange: (text: string) => void;
  onSend: () => void;
  onClear: () => void;
  onRefresh: () => void;
}

export const ChatBox = ({
  userText,
  tempText,
  aiText,
  status,
  onUserTextChange,
  onSend,
  onClear,
  onRefresh,
}: ChatBoxProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl h-72 z-10">
      {/* Ô của User */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 backdrop-blur-md shadow-xl flex flex-col hover:border-blue-500/20 transition-colors relative">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
            Ứng viên (Bạn)
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClear}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400"
              title="Xóa"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white"
              title="Làm mới Mic"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-950/30 rounded-xl border border-slate-700/50 overflow-hidden focus-within:border-blue-500/50 transition-colors">
          <textarea
            className="w-full h-full bg-transparent p-4 outline-none resize-none text-slate-300 text-lg leading-relaxed custom-scrollbar placeholder:text-slate-700"
            placeholder="Nói hoặc gõ câu trả lời..."
            value={userText + (tempText ? " " + tempText : "")}
            onChange={(e) => onUserTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={(!userText && !tempText) || status === "Đang xử lý"}
            className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Ô của AI */}
      <div className="bg-gradient-to-br from-slate-900/80 to-blue-950/20 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
          AI Phản hồi
        </span>
        <p className="text-xl text-slate-200 leading-relaxed overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap">
          {aiText}
        </p>
      </div>
    </div>
  );
};
