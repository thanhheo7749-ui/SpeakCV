/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useRouter } from "next/navigation";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

interface PricingSectionProps {
  onUpgrade: () => void;
}

export default function PricingSection({ onUpgrade }: PricingSectionProps) {
  const router = useRouter();
  const { plan } = useSubscription();

  const freeBenefits = [
    "100 lượt tương tác miễn phí",
    "5 lượt phỏng vấn / ngày",
    "Phỏng vấn AI cơ bản",
    "Chấm điểm tự động",
    "Hỗ trợ cộng đồng",
  ];

  const proBenefits = [
    "10.000 lượt tương tác mỗi ngày",
    "Phỏng vấn không giới hạn",
    "Truy cập mọi tính năng VIP",
    "Tạo CV chuyên nghiệp",
    "Chấm điểm CV nâng cao",
    "Ưu tiên hỗ trợ 24/7",
  ];

  return (
    <section
      id="pricing"
      className="py-24 bg-slate-950 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm font-medium text-cyan-400 mb-6">
            <Sparkles size={16} /> Bảng giá đơn giản, minh bạch
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
            Chọn gói phù hợp với bạn
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Bắt đầu miễn phí, nâng cấp khi cần. Không ràng buộc, hủy bất cứ lúc
            nào.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 hover:border-slate-600/80 transition-all duration-500 hover:-translate-y-1 group shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-slate-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Free</h3>
                <p className="text-slate-500 text-sm font-medium">Cơ bản</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-black text-white">0đ</span>
              <span className="text-slate-500 text-sm font-medium ml-2">
                / mãi mãi
              </span>
            </div>

            <ul className="space-y-4 mb-10">
              {freeBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-slate-400" />
                  </div>
                  <span className="text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push("/register")}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-[0.98]"
            >
              {plan === "free" ? "Đang sử dụng" : "Đăng ký miễn phí"}
            </button>
          </div>

          {/* PRO Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 hover:-translate-y-1 transition-all duration-500 group shadow-2xl">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="absolute inset-[1px] rounded-[1.45rem] bg-slate-900/95 backdrop-blur-xl" />

            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/30">
                🔥 Phổ biến nhất
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Crown className="text-yellow-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Pro</h3>
                  <p className="text-cyan-400 text-sm font-medium">Nâng cao</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  99.000đ
                </span>
                <span className="text-slate-500 text-sm font-medium ml-2">
                  / tháng
                </span>
              </div>

              <ul className="space-y-4 mb-10">
                {proBenefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">{b}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onUpgrade}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {plan === "pro" ? (
                  "Đang sử dụng Pro ✓"
                ) : (
                  <>
                    <Sparkles size={16} /> Nâng cấp ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
