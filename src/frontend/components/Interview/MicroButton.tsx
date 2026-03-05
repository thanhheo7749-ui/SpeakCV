/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { AudioWave } from "./AudioWave";
import { StopCircle } from "lucide-react";

interface MicroButtonProps {
  status: string;
  onClick: () => void;
  langLabel: string;
}

export const MicroButton = ({
  status,
  onClick,
  langLabel,
}: MicroButtonProps) => {
  const isActive = status === "Đang xử lý" || status === "AI đang nói";
  const isListening = status === "Đang nghe";

  return (
    <div className="relative group z-10">
      {/* Glow background effect */}
      <div
        className={`absolute -inset-8 rounded-full blur-3xl transition-opacity duration-500 ${isListening ? "opacity-100 bg-red-500/20" : isActive ? "opacity-100 bg-yellow-500/20" : "opacity-20 bg-blue-500/20"}`}
      ></div>

      <button
        onClick={onClick}
        className={`w-52 h-52 rounded-full bg-slate-900/80 backdrop-blur-sm border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl relative z-10 hover:scale-105 active:scale-95 
          ${isListening ? "border-red-500 shadow-red-900/40" : isActive ? "border-yellow-500 shadow-yellow-900/40" : "border-slate-700 hover:border-blue-500 shadow-blue-900/20"}
        `}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors ${isListening ? "text-red-400 animate-pulse" : "text-blue-400"}`}
        >
          {isActive ? "BẤM ĐỂ DỪNG" : status}
        </span>

        {isActive ? (
          <StopCircle className="animate-pulse text-yellow-500" size={56} />
        ) : isListening ? (
          <AudioWave state="listening" />
        ) : (
          <AudioWave state="idle" />
        )}
      </button>

      {/* Language label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${langLabel === "English" ? "border-orange-500 text-orange-400 bg-orange-500/10" : "border-emerald-500 text-emerald-400 bg-emerald-500/10"}`}
        >
          Mic: {langLabel}
        </span>
      </div>
    </div>
  );
};
