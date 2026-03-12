/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState, useRef, useCallback } from "react";
import {
  X,
  Sparkles,
  Code2,
  Copy,
  Check,
  Loader2,
  Wand2,
  ArrowRight,
  FileText,
  TrendingUp,
  Palette,
  Rocket,
  Upload,
  FileUp,
  Printer,
  Pencil,
} from "lucide-react";
import { uploadMakeoverCV } from "@/services/api";
import toast from "react-hot-toast";
import CVProTemplate, { type CVData } from "./CVProTemplate";
import { useReactToPrint } from "react-to-print";

type TemplateStyle = "tech" | "business" | "creative" | "fresher";

const TEMPLATES = [
  {
    key: "tech" as TemplateStyle,
    label: "Chuẩn IT / Tech",
    emoji: "💻",
    desc: "Tech Stack → Projects → Experience\nAgile/Scrum & hiệu năng",
    activeColor: "text-emerald-400",
    activeBg: "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    iconActiveBg: "bg-emerald-500/20 shadow-lg shadow-emerald-500/10",
    checkBg: "bg-emerald-500",
    gradient: "from-emerald-500/5 to-teal-500/10",
    icon: Code2,
  },
  {
    key: "business" as TemplateStyle,
    label: "Kinh tế / Marketing",
    emoji: "📈",
    desc: "KPI → Doanh thu → Chiến lược\nNhấn mạnh con số & kết quả",
    activeColor: "text-amber-400",
    activeBg: "border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    iconActiveBg: "bg-amber-500/20 shadow-lg shadow-amber-500/10",
    checkBg: "bg-amber-500",
    gradient: "from-amber-500/5 to-orange-500/10",
    icon: TrendingUp,
  },
  {
    key: "creative" as TemplateStyle,
    label: "Sáng tạo / Thiết kế",
    emoji: "🎨",
    desc: "Creative Profile → Projects\nDesign Thinking & UX-first",
    activeColor: "text-pink-400",
    activeBg: "border-pink-500 bg-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    iconActiveBg: "bg-pink-500/20 shadow-lg shadow-pink-500/10",
    checkBg: "bg-pink-500",
    gradient: "from-pink-500/5 to-rose-500/10",
    icon: Palette,
  },
  {
    key: "fresher" as TemplateStyle,
    label: "Sinh viên / Fresher",
    emoji: "🚀",
    desc: "Mục tiêu → Học vấn → Dự án\nNổi bật thái độ & tiềm năng",
    activeColor: "text-sky-400",
    activeBg: "border-sky-500 bg-sky-500/10 shadow-[0_0_30px_rgba(14,165,233,0.15)]",
    iconActiveBg: "bg-sky-500/20 shadow-lg shadow-sky-500/10",
    checkBg: "bg-sky-500",
    gradient: "from-sky-500/5 to-cyan-500/10",
    icon: Rocket,
  },
];

const TEMPLATE_LABELS: Record<TemplateStyle, string> = {
  tech: "Chuẩn IT / Tech",
  business: "Kinh tế / Marketing",
  creative: "Sáng tạo / Thiết kế",
  fresher: "Sinh viên / Fresher",
};

interface CVMakeoverProps {
  show: boolean;
  onClose: () => void;
  userAvatar?: string;
  onEditManually?: () => void;
}

export default function CVMakeover({ show, onClose, userAvatar, onEditManually }: CVMakeoverProps) {
  const [template, setTemplate] = useState<TemplateStyle>("tech");
  const [file, setFile] = useState<File | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvTemplateRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: cvTemplateRef,
    documentTitle: "SpeakCV_Revamped",
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: white !important;
        }
        #cv-pro-template {
          transform: none !important;
          width: 100% !important;
          min-height: auto !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          overflow: visible !important;
        }
      }
    `,
  });

  const validateFile = (f: File): boolean => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
      toast.error("Chỉ hỗ trợ file PDF hoặc Word (DOCX)!");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Tối đa 10MB.");
      return false;
    }
    return true;
  };

  const handleFileSelect = (f: File) => {
    if (validateFile(f)) {
      setFile(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
    if (e.target) e.target.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, []);

  const handleMakeover = async () => {
    if (!file) {
      toast.error("Vui lòng upload file CV!");
      return;
    }

    setLoading(true);
    setCvData(null);
    setShowResult(false);

    try {
      const data = await uploadMakeoverCV(file, template);
      setCvData(data.cv_data || null);
      setExtractedText(data.extracted_text || "Không thể trích xuất nội dung CV gốc.");
      setShowResult(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Chỉnh sửa CV thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(cvData, null, 2));
      setCopied(true);
      toast.success("Đã copy dữ liệu CV!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể copy. Vui lòng thử lại.");
    }
  };

  const handleEditManually = () => {
    if (!cvData) return;
    sessionStorage.setItem('draft_cv_data', JSON.stringify({ data: cvData, theme: 'makeover_blue' }));
    toast.success("Đang chuyển sang trình soạn thảo CV...");
    onEditManually?.();
  };

  const handleReset = () => {
    setCvData(null);
    setShowResult(false);
    setFile(null);
    setExtractedText("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-7xl h-[90vh] rounded-3xl border border-slate-700/50 flex flex-col shadow-2xl shadow-purple-500/5 overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Wand2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chỉnh sửa CV (CV Makeover)</h2>
              <p className="text-xs text-slate-500">Upload CV → Chọn ngành → AI viết lại chuyên nghiệp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PDF Export Button */}
            {showResult && cvData && (
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 active:scale-95"
              >
                <Printer size={16} />
                📥 Tải CV (PDF)
              </button>
            )}
            {/* Edit Manually Button */}
            {showResult && cvData && (
              <button
                onClick={handleEditManually}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30 active:scale-95"
              >
                <Pencil size={16} />
                ✏️ Chỉnh sửa thủ công
              </button>
            )}
            {/* Copy Button */}
            {showResult && cvData && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Đã copy!" : "Copy JSON"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="text-slate-400 hover:text-white" size={20} />
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!showResult ? (
            /* === INPUT PHASE === */
            <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto w-full space-y-7">
                {/* Template Selection Cards */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">
                    1. Chọn ngành nghề
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TEMPLATES.map((t) => {
                      const isActive = template === t.key;
                      const Icon = t.icon;
                      return (
                        <div
                          key={t.key}
                          onClick={() => setTemplate(t.key)}
                          className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 group relative overflow-hidden ${
                            isActive
                              ? t.activeBg
                              : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`} />
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative z-10 transition-all ${
                            isActive ? t.iconActiveBg : "bg-slate-800"
                          }`}>
                            <Icon className={isActive ? t.activeColor : "text-slate-500"} size={24} />
                          </div>
                          <h3 className={`font-bold text-sm relative z-10 ${isActive ? t.activeColor : "text-slate-300"}`}>
                            {t.emoji} {t.label}
                          </h3>
                          <p className="text-[10px] mt-1.5 text-slate-500 relative z-10 leading-relaxed whitespace-pre-line">
                            {t.desc}
                          </p>
                          {isActive && (
                            <div className={`absolute top-2 right-2 w-5 h-5 ${t.checkBg} rounded-full flex items-center justify-center`}>
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Upload — Drag & Drop Area */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    2. Upload file CV của bạn
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 group ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10 scale-[1.01] shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                        : file
                        ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-400"
                        : "border-slate-700 bg-slate-950 hover:border-purple-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center py-10 px-6">
                      {file ? (
                        <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                            <FileText size={32} className="text-emerald-400" />
                          </div>
                          <p className="font-bold text-lg text-white max-w-[300px] truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-purple-400 mt-3 hover:text-purple-300 transition-colors">
                            Bấm để đổi file khác
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                            isDragging
                              ? "bg-purple-500/20 scale-110"
                              : "bg-slate-800 group-hover:bg-purple-500/10 group-hover:scale-105"
                          }`}>
                            {isDragging ? (
                              <FileUp size={32} className="text-purple-400 animate-bounce" />
                            ) : (
                              <Upload size={32} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                            )}
                          </div>
                          <p className={`font-bold text-lg transition-colors ${
                            isDragging ? "text-purple-300" : "text-slate-300"
                          }`}>
                            {isDragging ? "Thả file vào đây!" : "Kéo thả hoặc bấm để tải CV"}
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            Hỗ trợ PDF, DOCX (Tối đa 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleMakeover}
                  disabled={loading || !file}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex justify-center items-center gap-3 shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      <span>AI đang chỉnh sửa CV của bạn...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
                      <span>Chỉnh sửa CV Ngay</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* === RESULT PHASE — Split Screen === */
            <div className="flex-1 flex min-h-0">
              {/* LEFT PANEL — AI Analysis + Original CV Text */}
              <div className="w-[35%] border-r border-slate-800 flex flex-col min-h-0 bg-slate-950/80">
                <div className="px-5 py-3 border-b border-slate-800 shrink-0 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-300">CV Gốc & Nhận Xét</span>
                  <span className="text-xs text-slate-600 ml-auto truncate max-w-[150px]">{file?.name}</span>
                </div>
                <div className="flex-1 overflow-auto p-5 custom-scrollbar space-y-4">
                  {/* === AI ANALYSIS FEEDBACK CARD === */}
                  {cvData?.analysis_feedback && (
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-3 duration-300">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🤖</span>
                        <h3 className="text-sm font-bold text-white tracking-wide">AI Nhận Xét</h3>
                      </div>

                      {/* Score Badge */}
                      {cvData.analysis_feedback.overall_score != null && (
                        <div className="flex items-center gap-4">
                          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-[3px] ${
                            cvData.analysis_feedback.overall_score >= 80
                              ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                              : cvData.analysis_feedback.overall_score >= 60
                              ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                              : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                          }`}>
                            <span className={`text-xl font-extrabold ${
                              cvData.analysis_feedback.overall_score >= 80
                                ? 'text-emerald-400'
                                : cvData.analysis_feedback.overall_score >= 60
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}>
                              {cvData.analysis_feedback.overall_score}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Điểm tổng quan</p>
                            <p className={`text-sm font-bold ${
                              cvData.analysis_feedback.overall_score >= 80
                                ? 'text-emerald-400'
                                : cvData.analysis_feedback.overall_score >= 60
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}>
                              {cvData.analysis_feedback.overall_score >= 80 ? 'Tốt' : cvData.analysis_feedback.overall_score >= 60 ? 'Khá' : 'Cần cải thiện'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Strengths */}
                      {cvData.analysis_feedback.strengths && cvData.analysis_feedback.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Điểm mạnh</p>
                          <ul className="space-y-1.5">
                            {cvData.analysis_feedback.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                                <span className="text-emerald-400 mt-0.5 shrink-0">✅</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {cvData.analysis_feedback.weaknesses && cvData.analysis_feedback.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">Cần cải thiện</p>
                          <ul className="space-y-1.5">
                            {cvData.analysis_feedback.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                                <span className="text-amber-400 mt-0.5 shrink-0">⚠️</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === ORIGINAL CV TEXT === */}
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-2">Nội dung CV gốc</p>
                    <pre className="text-[12px] text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">
                      {extractedText}
                    </pre>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL — CV Pro Template */}
              <div className="w-[65%] flex flex-col min-h-0">
                <div className="px-5 py-3 border-b border-slate-800 shrink-0 flex items-center gap-2 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <Sparkles size={16} className="text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">CV Chuyên Nghiệp</span>
                  <span className="text-xs text-purple-500/60 ml-auto">✨ {TEMPLATE_LABELS[template]}</span>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar bg-slate-800/30 p-6 flex justify-center">
                  <div className="transform origin-top scale-[0.62] xl:scale-[0.70] 2xl:scale-[0.78]">
                    {cvData && (
                      <CVProTemplate
                        ref={cvTemplateRef}
                        cvData={cvData}
                        avatarUrl={userAvatar}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== FOOTER (Result Phase) ===== */}
        {showResult && (
          <div className="px-8 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
            >
              ← Chỉnh sửa CV khác
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Sparkles size={12} />
              Powered by AI • {TEMPLATE_LABELS[template]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
