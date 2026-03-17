/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getQuestions, submitQuestion } from "@/services/api";
import {
  ArrowLeft,
  Building2,
  Search,
  SendHorizonal,
  HelpCircle,
  Flame,
  Zap,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id: number;
  company_name: string;
  position: string;
  question_text: string;
  difficulty: string;
  created_at: string;
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string; icon: any }> = {
  easy: { label: "Dễ", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", icon: Zap },
  medium: { label: "Trung bình", color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30", icon: Flame },
  hard: { label: "Khó", color: "text-red-400 bg-red-500/15 border-red-500/30", icon: Flame },
};

export default function QuestionsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompany, setSearchCompany] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit form state
  const [formCompany, setFormCompany] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("medium");

  const fetchQuestions = (company?: string) => {
    setLoading(true);
    getQuestions(company || undefined)
      .then((data) => setQuestions(data.questions || []))
      .catch(() => toast.error("Không tải được câu hỏi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSearch = () => {
    fetchQuestions(searchCompany.trim() || undefined);
  };

  const handleSubmit = async () => {
    if (!formCompany.trim() || !formQuestion.trim()) {
      toast.error("Vui lòng điền tên công ty và câu hỏi");
      return;
    }
    setSubmitting(true);
    try {
      await submitQuestion({
        company_name: formCompany.trim(),
        position: formPosition.trim(),
        question_text: formQuestion.trim(),
        difficulty: formDifficulty,
      });
      toast.success("Gửi thành công! Câu hỏi đang chờ duyệt.");
      setFormCompany("");
      setFormPosition("");
      setFormQuestion("");
      setFormDifficulty("medium");
      setShowSubmitForm(false);
    } catch (err: any) {
      toast.error(err.message || "Gửi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Group questions by company
  const companyGroups = questions.reduce(
    (acc, q) => {
      if (!acc[q.company_name]) acc[q.company_name] = [];
      acc[q.company_name].push(q);
      return acc;
    },
    {} as Record<string, Question[]>
  );

  const filteredQuestions = filterDifficulty
    ? questions.filter((q) => q.difficulty === filterDifficulty)
    : questions;

  const companies = Object.keys(companyGroups).sort();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/interview")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-emerald-400" /> Ngân hàng Câu hỏi
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            📋 Câu hỏi phỏng vấn theo Công ty
          </h2>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            Khám phá câu hỏi thực tế từ cộng đồng. Biết trước câu hỏi =
            tự tin gấp 10 lần!
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm theo tên công ty (VD: FPT, Shopee, VNG...)"
              className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} /> Tìm
          </button>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="">Tất cả độ khó</option>
            <option value="easy">🟢 Dễ</option>
            <option value="medium">🟡 Trung bình</option>
            <option value="hard">🔴 Khó</option>
          </select>
        </div>

        {/* Submit Button */}
        {token && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <SendHorizonal size={16} />
            {showSubmitForm ? "Đóng form" : "Gửi câu hỏi bạn đã gặp"}
          </button>
        )}

        {/* Submit Form */}
        {showSubmitForm && (
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SendHorizonal size={18} className="text-emerald-400" />
              Chia sẻ câu hỏi phỏng vấn thực tế
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Tên công ty *"
                className="px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
              />
              <input
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                placeholder="Vị trí ứng tuyển"
                className="px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
              />
            </div>
            <textarea
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder="Câu hỏi bạn đã được hỏi *"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm resize-none"
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Độ khó:</span>
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFormDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    formDifficulty === d
                      ? DIFFICULTY_MAP[d].color
                      : "text-slate-500 bg-slate-800/50 border-slate-700/30"
                  }`}
                >
                  {DIFFICULTY_MAP[d].label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {submitting ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-400" size={36} />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-slate-500 mt-2">
              {searchCompany
                ? `Không tìm thấy câu hỏi cho "${searchCompany}"`
                : "Hãy là người đầu tiên chia sẻ câu hỏi phỏng vấn!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Company Stats */}
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => {
                    setSearchCompany(company);
                    fetchQuestions(company);
                  }}
                  className="px-4 py-2 bg-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 rounded-full text-sm font-semibold text-slate-300 hover:text-blue-400 transition-all flex items-center gap-2"
                >
                  <Building2 size={14} />
                  {company}
                  <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {companyGroups[company]?.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Question Cards */}
            <div className="space-y-3">
              {filteredQuestions.map((q) => {
                const diff = DIFFICULTY_MAP[q.difficulty] || DIFFICULTY_MAP.medium;
                const DiffIcon = diff.icon;
                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm leading-relaxed">
                          {q.question_text}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                            <Building2 size={12} /> {q.company_name}
                          </span>
                          {q.position && (
                            <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg">
                              {q.position}
                            </span>
                          )}
                          <span
                            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${diff.color}`}
                          >
                            <DiffIcon size={12} /> {diff.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA for non-logged in users */}
        {!token && (
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-8 text-center">
            <p className="text-slate-400 mb-4">
              Đăng nhập để chia sẻ câu hỏi bạn đã gặp trong phỏng vấn thực tế
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
