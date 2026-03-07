"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Home, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  useEffect(() => {
    const rspCode = searchParams.get("vnp_ResponseCode");
    if (rspCode) {
      if (rspCode === "00") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } else {
      // If there's no code, maybe it's direct access
      setStatus("failed");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white">Đang xử lý kết quả...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 p-8 shadow-2xl text-center">
        {status === "success" ? (
          <div className="animate-in fade-in zoom-in duration-500 text-center">
            {/* Success animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="text-white" size={48} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Thanh toán thành công! 🎉
            </h2>
            <p className="text-slate-400 text-sm mb-2 leading-relaxed">
              Tài khoản của bạn đã được nâng cấp lên{" "}
              <span className="text-cyan-400 font-bold">Pro</span>
            </p>
            <p className="text-slate-500 text-xs mb-8">
              10.000 token đã được cộng vào tài khoản của bạn. Vui lòng đăng
              nhập lại hoặc tải lại trang để thấy cập nhật.
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-cyan-500 hover:opacity-90 text-white transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Home size={16} /> Quay về trang chủ
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 text-center">
            {/* Failed animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="text-white" size={48} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Giao dịch thất bại!
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Thanh toán đã bị hủy hoặc có lỗi xảy ra trong quá trình xử lý. Xin
              vui lòng thử lại sau.
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white transition-all shadow-lg shadow-red-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Home size={16} /> Quay về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
