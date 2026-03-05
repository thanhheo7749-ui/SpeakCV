/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useEffect, useState } from "react";
import { getSystemConfig, updateSystemConfig } from "@/services/api";
import { Save, Settings2, Loader2, Cpu } from "lucide-react";
import toast from "react-hot-toast";

export function PromptConfigTab() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSystemConfig()
      .then((res) => {
        setSystemPrompt(res.system_prompt);
        setTemperature(res.temperature);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy cấu hình:", err);
        toast.error("Không thể tải cấu hình hệ thống");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemConfig(systemPrompt, temperature);
      toast.success("Cập nhật cấu hình AI thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật cấu hình");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-3 text-blue-500" size={28} />
        Đang tải System Configuration...
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Cpu className="text-purple-500" size={32} />
            AI Prompt Configuration
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Tùy chỉnh kỹ thuật Prompt Engineering cho AI Interviewer
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Lưu Cấu Hình
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative space-y-8">
        {/* SYSTEM PROMPT BLOCK */}
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-slate-200 mb-3">
            <Settings2 size={20} className="text-purple-400" />
            System Prompt (Chỉ thị cho AI)
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Đoạn text này sẽ được nối với Vị trí Công việc và Chế độ Phỏng vấn
            trước khi gửi đến Model AI (GPT-4o-mini).
          </p>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-80 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl p-5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm leading-relaxed"
            placeholder="Nhập System Prompt cơ bản của AI..."
          />
        </div>

        {/* TEMPERATURE BLOCK */}
        <div className="pt-4 border-t border-slate-800/80">
          <label className="flex items-center justify-between text-lg font-bold text-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🌡️</span> Temperature (Độ sáng
              tạo)
            </div>
            <span className="text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg">
              {temperature.toFixed(1)}
            </span>
          </label>
          <p className="text-xs text-slate-500 mb-6">
            0.0: Câu trả lời rập khuôn, chính xác | 1.0: Câu trả lời tự do, sáng
            tạo. Mức khuyên dùng cho AI Phỏng vấn là 0.5 - 0.7.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-bold">0.0</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all hover:accent-purple-400"
            />
            <span className="text-slate-400 font-bold">1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
