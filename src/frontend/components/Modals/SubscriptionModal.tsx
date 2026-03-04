/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { X, Crown, Zap, Sparkles } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useRouter } from "next/navigation";

interface SubscriptionModalProps {
  show: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function SubscriptionModal({
  show,
  onClose,
  onUpgrade,
}: SubscriptionModalProps) {
  const { plan, tokens } = useSubscription();
  const router = useRouter();

  if (!show) return null;

  const isPro = plan === "pro";
  const maxTokens = isPro ? 2000 : 100;
  const percentage = Math.min((tokens / maxTokens) * 100, 100);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 p-8 relative animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isPro
                ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                : "bg-slate-800"
            }`}
          >
            {isPro ? (
              <Crown className="text-yellow-400" size={32} />
            ) : (
              <Zap className="text-slate-400" size={32} />
            )}
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Gói cước của tôi
          </h2>
        </div>

        {/* Plan badge */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`px-6 py-2 rounded-full font-black text-sm ${
              isPro
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {isPro ? "👑 PRO" : "⚡ FREE"} • {isPro ? "Nâng cao" : "Cơ bản"}
          </div>
        </div>

        {/* Token info */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm font-medium">
              Token còn lại
            </span>
            <span
              className={`font-black text-lg ${
                isPro ? "text-cyan-400" : "text-slate-300"
              }`}
            >
              {tokens.toLocaleString()}
              <span className="text-slate-600 text-sm font-medium">
                {" "}
                / {maxTokens.toLocaleString()}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isPro
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : "bg-gradient-to-r from-slate-500 to-slate-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Plan details */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 mb-6">
          <h3 className="text-white font-bold text-sm mb-4">
            Quyền lợi hiện tại
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Phỏng vấn</span>
              <span
                className={`font-bold ${isPro ? "text-emerald-400" : "text-slate-300"}`}
              >
                {isPro ? "Không giới hạn" : "5 lượt / ngày"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tạo CV</span>
              <span
                className={`font-bold ${isPro ? "text-emerald-400" : "text-slate-300"}`}
              >
                {isPro ? "Chuyên nghiệp" : "Cơ bản"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Hỗ trợ</span>
              <span
                className={`font-bold ${isPro ? "text-cyan-400" : "text-slate-300"}`}
              >
                {isPro ? "Ưu tiên 24/7" : "Cộng đồng"}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        {!isPro && (
          <button
            onClick={() => {
              onClose();
              if (onUpgrade) {
                onUpgrade();
              } else {
                router.push("/#pricing");
              }
            }}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Nâng cấp lên Pro
          </button>
        )}

        {isPro && (
          <div className="text-center text-sm text-slate-500">
            Cảm ơn bạn đã sử dụng gói Pro!
          </div>
        )}
      </div>
    </div>
  );
}
