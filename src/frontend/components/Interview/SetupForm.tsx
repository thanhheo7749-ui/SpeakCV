/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { Briefcase, Play } from "lucide-react";
import toast from "react-hot-toast";

interface SetupFormProps {
  config: any;
  setConfig: (c: any) => void;
  onStart: () => void;
}

export function SetupForm({ config, setConfig, onStart }: SetupFormProps) {
  const handleStart = () => {
    if (config.interviewType === "timed" && !config.position.trim()) {
      toast.error("Vui lòng nhập Vị trí ứng tuyển để AI biết bề hỏi nhé!");
      return;
    }
    onStart();
  };

  return (
    <div className="mt-8 bg-slate-900/80 p-8 rounded-3xl border border-slate-700 w-full max-w-2xl shadow-2xl animate-in zoom-in flex flex-col gap-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
          <Briefcase className="text-blue-400" /> Thiết Lập Bối Cảnh
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Cung cấp thông tin để AI đưa ra câu hỏi sát thực tế nhất
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
            Vị trí ứng tuyển *
          </label>
          <input
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-red-500 outline-none"
            placeholder="VD: Frontend Dev..."
            value={config.position}
            onChange={(e) => setConfig({ ...config, position: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
            Tên Công ty
          </label>
          <input
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-red-500 outline-none"
            placeholder="VD: FPT..."
            value={config.company}
            onChange={(e) => setConfig({ ...config, company: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
          Mô tả công việc (JD)
        </label>
        <textarea
          className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white h-24 focus:border-red-500 outline-none custom-scrollbar"
          placeholder="Dán nội dung JD vào đây..."
          value={config.jd}
          onChange={(e) => setConfig({ ...config, jd: e.target.value })}
        />
      </div>
      <button
        id="tour-step-start"
        onClick={handleStart}
        className="mt-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-xl text-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <Play fill="currentColor" size={20} /> VÀO PHỎNG VẤN NGAY!
      </button>
    </div>
  );
}
