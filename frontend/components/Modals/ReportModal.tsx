import { X, Award, Loader2 } from "lucide-react";

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  result: string;
  onRetry: () => void;
}

export default function ReportModal({
  show,
  onClose,
  result,
  onRetry,
}: ReportModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white flex gap-3">
            <Award className="text-pink-500" /> KẾT QUẢ
          </h2>
          <button onClick={onClose}>
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-pink-500" size={48} />
              <p className="text-slate-400">AI đang chấm điểm...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: result }} />
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={onRetry}
                  className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl font-bold hover:bg-slate-700"
                >
                  Phỏng vấn lại
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-pink-600 rounded-xl font-bold hover:bg-pink-500"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
