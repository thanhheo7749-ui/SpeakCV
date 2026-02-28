/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { Target, Clock } from "lucide-react";

interface TimerDisplayProps {
  questionCount: number;
  questionLimit: number;
  timeLeft: number;
}

export function TimerDisplay({
  questionCount,
  questionLimit,
  timeLeft,
}: TimerDisplayProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 30)
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (timeLeft > 10)
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/50 bg-red-500/20 animate-pulse";
  };

  return (
    <div className="mt-4 flex gap-4 items-center animate-in slide-in-from-top-4">
      <div className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-bold flex items-center gap-2 text-slate-300 shadow-lg">
        <Target size={16} className="text-blue-400" /> Câu:{" "}
        <span className="text-white">
          {questionCount}/{questionLimit}
        </span>
      </div>
      <div
        className={`px-5 py-2 border rounded-full text-base font-bold flex items-center gap-2 shadow-lg transition-colors ${getTimerColor()}`}
      >
        <Clock size={18} /> {formatTime(timeLeft)}
      </div>
    </div>
  );
}
