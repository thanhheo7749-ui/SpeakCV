/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import React, { useState, useEffect } from "react";
import { Play, Settings, X, Clock, HelpCircle } from "lucide-react";

interface ResumeConfigModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (config: any) => void;
  initialConfig: any;
}

export function ResumeConfigModal({
  show,
  onClose,
  onConfirm,
  initialConfig,
}: ResumeConfigModalProps) {
  const [interviewType, setInterviewType] = useState("free");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [timeLimit, setTimeLimit] = useState(120);

  useEffect(() => {
    if (show && initialConfig) {
      setInterviewType(initialConfig.interview_type || "free");
      setQuestionLimit(initialConfig.question_limit || 5);
      setTimeLimit(initialConfig.time_limit || 120);
    }
  }, [show, initialConfig]);

  if (!show) return null;

  const handleConfirm = () => {
    onConfirm({
      interviewType,
      questionLimit,
      timeLimit,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <Settings className="text-blue-400" size={24} />
              Tiếp tục Phỏng vấn
            </h3>
            <p className="text-sm text-amber-400 font-medium bg-amber-500/10 inline-block px-2 py-1 rounded-md mt-2">
              ⚠️ Bạn đang tiếp tục một phiên phỏng vấn cũ. Bạn có thể giữ nguyên
              tính năng hoặc thay đổi cài đặt bên dưới.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white transition-colors text-slate-400 font-black rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* SELECT INTERVIEW MODE */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300">
              Chế độ Phỏng vấn mới
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setInterviewType("free")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  interviewType === "free"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                }`}
              >
                <div className="font-bold text-white mb-1">Tự do</div>
                <div className="text-xs text-slate-400">
                  Trao đổi thoải mái, không giới hạn thời gian
                </div>
              </button>

              <button
                onClick={() => setInterviewType("timed")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  interviewType === "timed"
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                }`}
              >
                <div className="font-bold text-white mb-1 text-amber-500">
                  Áp lực (Có tính giờ)
                </div>
                <div className="text-xs text-slate-400">
                  Mô phỏng phỏng vấn thực tế với áp lực thời gian
                </div>
              </button>
            </div>
          </div>

          {/* TIMED MODE CONFIGURATION */}
          {interviewType === "timed" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-amber-500" />
                  Tổng số câu hỏi
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 transition-colors appearance-none font-bold cursor-pointer"
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(Number(e.target.value))}
                >
                  <option value={3}>3 câu</option>
                  <option value={5}>5 câu</option>
                  <option value={7}>7 câu</option>
                  <option value={10}>10 câu</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" />
                  Thời gian trả lời (mỗi câu)
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 transition-colors appearance-none font-bold cursor-pointer"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                >
                  <option value={60}>1 phút</option>
                  <option value={120}>2 phút (Mặc định)</option>
                  <option value={180}>3 phút</option>
                  <option value={300}>5 phút</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-500/30"
          >
            <Play size={18} />
            Bắt đầu Phỏng vấn
          </button>
        </div>
      </div>
    </div>
  );
}
