/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 */

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HelpCircle,
  CheckCircle2,
  Trash2,
  Loader2,
  Building2,
  Flame,
  Zap,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface PendingQuestion {
  id: number;
  company_name: string;
  position: string;
  question_text: string;
  difficulty: string;
  submitted_by: number | null;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const DIFF_STYLE: Record<string, { label: string; cls: string }> = {
  easy: { label: "Dễ", cls: "text-emerald-400 bg-emerald-500/15" },
  medium: { label: "TB", cls: "text-yellow-400 bg-yellow-500/15" },
  hard: { label: "Khó", cls: "text-red-400 bg-red-500/15" },
};

export function QuestionsTab() {
  const { token } = useAuth();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/questions/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setQuestions(await res.json().then((d) => d.questions || []));
    } catch {
      toast.error("Lỗi tải danh sách");
    }
    setLoading(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/questions`);
      if (res.ok) setQuestions(await res.json().then((d) => d.questions || []));
    } catch {
      toast.error("Lỗi tải danh sách");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "pending") fetchPending();
    else fetchAll();
  }, [tab]);

  const approve = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/questions/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Đã duyệt!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch {
      toast.error("Lỗi duyệt câu hỏi");
    }
    setActionLoading(null);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa câu hỏi này?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Đã xóa!");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch {
      toast.error("Lỗi xóa câu hỏi");
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="text-emerald-400" size={28} /> Quản lý Câu hỏi
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "pending"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "all"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            Đã duyệt
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-400" size={32} />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <CheckCircle2 size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold">
            {tab === "pending"
              ? "Không có câu hỏi nào cần duyệt 🎉"
              : "Chưa có câu hỏi nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.medium;
            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-white font-semibold text-sm leading-relaxed">
                      {q.question_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                        <Building2 size={12} /> {q.company_name}
                      </span>
                      {q.position && (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
                          {q.position}
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${diff.cls}`}
                      >
                        {diff.label}
                      </span>
                      {q.created_at && (
                        <span className="text-xs text-slate-600">
                          {new Date(q.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {tab === "pending" && (
                      <button
                        onClick={() => approve(q.id)}
                        disabled={actionLoading === q.id}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
                        title="Duyệt"
                      >
                        {actionLoading === q.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => remove(q.id)}
                      disabled={actionLoading === q.id}
                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
