/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useEffect, useState } from "react";
import { getSystemLogs } from "@/services/api";
import { Eye, Loader2, FileText, User } from "lucide-react";

interface InterviewLog {
  id: number;
  user_email: string;
  user_name: string;
  position: string;
  score: number;
  title: string;
  details: any;
  created_at: string;
}

export function SystemLogsTab() {
  const [logs, setLogs] = useState<InterviewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<InterviewLog | null>(null);

  useEffect(() => {
    getSystemLogs()
      .then((res) => {
        setLogs(res.interviews);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy logs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-3 text-blue-500" size={28} />
        Đang tải System Logs...
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <FileText className="text-blue-500" size={32} />
            System Logs
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Lịch sử toàn bộ cuộc phỏng vấn trên hệ thống SpeakCV
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-5">Người dùng</th>
                <th className="px-6 py-5">Vị trí Phỏng vấn</th>
                <th className="px-6 py-5">Ngày tạo</th>
                <th className="px-6 py-5">Điểm</th>
                <th className="px-6 py-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                        {log.user_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">
                          {log.user_name || "GUEST"}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {log.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-300">
                    {log.position}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    {new Date(log.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full text-xs">
                      {log.score}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg transition-all shadow hover:shadow-blue-500/20"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Chưa có lịch sử phỏng vấn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TO DISPLAY CHAT HISTORY */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Đoạn chat: {selectedLog.user_name}
                </h3>
                <p className="text-sm border text-blue-400 border-blue-500/30 bg-blue-500/10 inline-block px-2 py-0.5 rounded-md">
                  Vị trí: {selectedLog.position}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-red-500 hover:text-white transition-colors text-slate-400 font-black relative"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black">
              {Array.isArray(selectedLog.details) &&
              selectedLog.details.length > 0 ? (
                selectedLog.details.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="space-y-4 relative pl-6 border-l-2 border-slate-800"
                  >
                    {/* AI QUESTION BLOCK */}
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md">
                        <span className="text-[10px] font-bold text-white">
                          AI
                        </span>
                      </div>
                      <div className="bg-slate-800/60 p-4 rounded-xl rounded-tl-none border border-slate-700/50">
                        <p className="text-sm font-semibold text-blue-300 mb-1">
                          AI Interviewer
                        </p>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {item.question}
                        </p>
                      </div>
                    </div>

                    {/* USER ANSWER BLOCK */}
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md">
                        <User size={12} className="text-white" />
                      </div>
                      <div className="bg-emerald-900/10 p-4 rounded-xl rounded-tl-none border border-emerald-800/30">
                        <p className="text-sm font-semibold text-emerald-400 mb-1">
                          {selectedLog.user_name}
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                          "{item.candidate_answer}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-10">
                  Không tìm thấy chi tiết đoạn chat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
