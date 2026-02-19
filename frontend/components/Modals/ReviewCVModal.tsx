import { useState } from "react";
import { X, Check, Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { reviewCV } from "@/services/api";

export default function ReviewCVModal({ show, onClose }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [com, setCom] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Kiểm tra loại file (chỉ nhận PDF hoặc Ảnh)
      if (
        !selectedFile.type.includes("pdf") &&
        !selectedFile.type.includes("image")
      ) {
        setError("Vui lòng chỉ tải lên file PDF hoặc Ảnh (JPG/PNG).");
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
    }
  };

  const handleReview = async () => {
    if (!file) return setError("Bạn chưa chọn file CV!");

    setLoading(true);
    setRes("");
    setError("");

    try {
      const d = await reviewCV(file, com); // Gọi API
      if (d && d.review) {
        setRes(d.review);
      } else {
        setError("Không nhận được phản hồi từ Server.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối hoặc file quá lớn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-700 flex flex-col p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex gap-2 text-white items-center">
            <Check className="text-blue-500" /> Review & Chấm điểm CV
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!res ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-full max-w-md space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Công ty bạn muốn ứng tuyển (Để AI check độ phù hợp)
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="VD: VNG, FPT Software..."
                  value={com}
                  onChange={(e) => setCom(e.target.value)}
                />
              </div>

              {/* Vùng Upload File */}
              <div className="relative w-full max-w-md h-64 border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer bg-slate-900">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf, .jpg, .jpeg, .png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {file ? (
                  <div className="flex flex-col items-center text-blue-400">
                    <FileText size={48} className="mb-2" />
                    <p className="font-bold text-lg text-white max-w-[200px] truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-blue-400 mt-2">
                      Bấm để đổi file khác
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload
                      size={40}
                      className="text-slate-500 group-hover:text-blue-500 group-hover:scale-110 transition-transform mb-4"
                    />
                    <p className="text-slate-300 font-medium">
                      Kéo thả hoặc bấm để tải CV
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Hỗ trợ PDF, JPG, PNG (Max 5MB)
                    </p>
                  </>
                )}
              </div>

              {/* Thông báo lỗi */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                onClick={handleReview}
                disabled={loading}
                className="w-full max-w-md py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Check />}
                {loading ? "Đang phân tích..." : "Bắt đầu Review"}
              </button>
            </div>
          ) : (
            // Kết quả Review
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto bg-slate-950 p-8 rounded-2xl border border-slate-800 custom-scrollbar shadow-inner">
                <div
                  className="prose prose-invert max-w-none prose-headings:text-blue-400 prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: res }}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setRes("");
                    setFile(null);
                  }}
                  className="text-slate-400 hover:text-white underline text-sm"
                >
                  Review CV khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
