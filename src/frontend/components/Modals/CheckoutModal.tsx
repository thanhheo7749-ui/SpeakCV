/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Crown,
  Check,
  ArrowRight,
  CreditCard,
  Phone,
  User,
  CheckCircle2,
  Home,
  Sparkles,
} from "lucide-react";

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  show,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!show) return null;

  const handleClose = () => {
    setStep(1);
    setFormData({ name: "", phone: "" });
    setIsProcessing(false);
    onClose();
  };

  const handlePayment = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setIsProcessing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/payment/create-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi tạo URL thanh toán");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Chuyển hướng sang VNPAY
      } else {
        setIsProcessing(false);
        alert("Không nhận được URL thanh toán từ server.");
      }
    } catch (error) {
      console.error("Payment setup error:", error);
      setIsProcessing(false);
      alert(
        "Đã xảy ra lỗi khi kết nối với cổng thanh toán. Vui lòng thử lại sau.",
      );
    }
  };

  const handleGoHome = () => {
    handleClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
              s <= step
                ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {s < step ? <Check size={14} /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-12 h-[2px] rounded-full transition-all duration-500 ${
                s < step ? "bg-blue-500" : "bg-slate-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 p-8 relative animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
        >
          <X size={20} />
        </button>

        <StepIndicator />

        {/* STEP 1: Confirm Plan */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-yellow-400" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Nâng cấp lên Pro
              </h2>
              <p className="text-slate-400 text-sm">
                Xác nhận thông tin gói cước trước khi thanh toán
              </p>
            </div>

            {/* Plan details */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Gói cước
                </span>
                <span className="text-white font-bold flex items-center gap-2">
                  <Crown size={14} className="text-yellow-400" /> Pro
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Token hàng ngày
                </span>
                <span className="text-cyan-400 font-bold">10.000 token</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Phỏng vấn
                </span>
                <span className="text-emerald-400 font-bold">
                  Không giới hạn
                </span>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    99.000đ
                  </span>
                </div>
                <p className="text-slate-500 text-xs text-right mt-1">
                  / tháng • Hủy bất cứ lúc nào
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Payment Info */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-purple-400" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Thông tin thanh toán
              </h2>
              <p className="text-slate-400 text-sm">
                Điền thông tin để hoàn tất đăng ký gói Pro
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <User size={12} /> Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Phone size={12} /> Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0912 345 678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Payment summary */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Crown size={18} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Gói Pro</p>
                  <p className="text-slate-500 text-xs">10.000 token / tháng</p>
                </div>
              </div>
              <span className="text-cyan-400 font-black">99.000đ</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={
                !formData.name.trim() || !formData.phone.trim() || isProcessing
              }
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                !formData.name.trim() || !formData.phone.trim() || isProcessing
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-blue-500/30 active:scale-[0.98]"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý thanh toán...
                </>
              ) : (
                <>
                  <CreditCard size={16} /> Thanh toán 99.000đ
                </>
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors font-medium"
            >
              ← Quay lại
            </button>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
            {/* Success animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
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
              10.000 token đã được cộng vào tài khoản của bạn
            </p>

            {/* Upgrade summary */}
            <div className="bg-slate-950 rounded-2xl border border-emerald-500/30 p-6 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown size={18} className="text-yellow-400" />
                <span className="text-white font-bold">
                  Gói Pro đã được kích hoạt
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">Token</p>
                  <p className="text-cyan-400 font-black text-lg">10.000</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">Phỏng vấn</p>
                  <p className="text-emerald-400 font-black text-lg">∞</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoHome}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-cyan-500 hover:opacity-90 text-white transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Home size={16} /> Quay về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
