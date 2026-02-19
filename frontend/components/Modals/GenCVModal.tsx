import { useState } from "react";
import {
  X,
  PenTool,
  Loader2,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";
import { generateCV } from "@/services/api";

const TEMPLATES = [
  {
    id: "type1",
    name: "Type 1 (Hiện đại)",
    color: "from-red-500 to-red-700",
    desc: "Tối ưu cho Developer, nổi bật kỹ năng.",
  },
  {
    id: "type 2",
    name: "Harvard (Cổ điển)",
    color: "from-slate-700 to-black",
    desc: "Chuyên nghiệp, gọn gàng, chuẩn ATS.",
  },
  {
    id: "creative",
    name: "Sáng tạo (Designer)",
    color: "from-purple-500 to-pink-500",
    desc: "Màu sắc, bố cục phá cách.",
  },
];

export default function GenCVModal({ show, onClose, userProfile }: any) {
  const [pos, setPos] = useState("");
  const [com, setCom] = useState("");
  const [template, setTemplate] = useState("type1");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState("");

  const handleGen = async () => {
    if (!pos) return alert("Vui lòng nhập vị trí ứng tuyển!");
    setLoading(true);
    setRes(""); // Reset kết quả cũ

    try {
      const d = await generateCV(userProfile, pos, com, template);
      if (d && d.content) {
        setRes(d.content);
      } else {
        alert("Không nhận được nội dung từ AI. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi tạo CV:", error);
      alert("Có lỗi xảy ra khi tạo CV. Vui lòng kiểm tra Console.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between mb-4 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex gap-2 text-white items-center">
            <PenTool className="text-yellow-500" /> Tạo CV Thông Minh
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
          {/* Cột trái: Form nhập liệu & Chọn mẫu */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {/* 1. Nhập thông tin */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Thông tin cơ bản
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                placeholder="Vị trí (VD: ReactJS Developer)"
              />
              <input
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-yellow-500 outline-none transition-all"
                value={com}
                onChange={(e) => setCom(e.target.value)}
                placeholder="Công ty mục tiêu (Tùy chọn)"
              />
            </div>

            {/* 2. Chọn Template */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex gap-2 items-center">
                <LayoutTemplate size={14} /> Chọn mẫu CV
              </label>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`relative p-4 rounded-xl bordercursor-pointer transition-all duration-200 group overflow-hidden
                                ${template === t.id ? "border-yellow-500 ring-1 ring-yellow-500 bg-slate-800" : "border-slate-700 hover:border-slate-500 bg-slate-950"}
                                border
                            `}
                  >
                    <div
                      className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${t.color}`}
                    ></div>
                    <div className="pl-3">
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
                    </div>
                    {template === t.id && (
                      <CheckCircle2
                        className="absolute top-3 right-3 text-yellow-500"
                        size={18}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nút Tạo */}
            <button
              onClick={handleGen}
              disabled={loading}
              className="mt-auto py-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <PenTool size={20} />
              )}
              {loading ? "AI đang viết..." : "Tạo CV Ngay"}
            </button>
          </div>

          {/* Cột phải: Kết quả */}
          <div className="w-full md:w-2/3 bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col relative">
            {res ? (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white text-slate-900">
                {/* Render HTML trả về từ AI */}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: res }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 p-8 text-center opacity-60">
                <LayoutTemplate size={64} strokeWidth={1} />
                <p>
                  Chọn mẫu và nhập thông tin để AI tạo CV chuyên nghiệp cho bạn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
