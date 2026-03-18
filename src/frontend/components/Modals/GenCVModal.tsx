/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  LayoutTemplate,
  Download,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Lightbulb,
  ChevronLeft,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { API_URL } from "@/services/api";
import { TailorJDModal } from "./index";
import {
  HINTS,
  THEME_MAP,
  genUid,
  applyAiCvData,
  serializeCvDataForBackend,
} from "./cv-builder-utils";

// HELPER COMPONENT
const EditableText = ({
  value,
  onChange,
  onFocus,
  className,
  placeholder,
  isMultiline = false,
}: any) => {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onFocus={onFocus}
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      className={`outline-none hover:ring-1 hover:ring-gray-400/50 focus:ring-2 focus:ring-blue-400 rounded transition-all cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400/70 empty:before:italic ${isMultiline ? "whitespace-pre-wrap" : "whitespace-nowrap"} ${className}`}
      data-placeholder={placeholder}
    >
      {value}
    </div>
  );
};

const AvatarDisplay = ({ src }: { src?: string }) => {
  if (src)
    return (
      <img src={src} alt="Avatar" className="w-full h-full object-cover" />
    );
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="w-full h-full p-4 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
};

// MAIN COMPONENT
export default function GenCVModal({ show, onClose, userProfile }: any) {
  const [cvData, setCvData] = useState<any>({
    full_name: "",
    position: "",
    phone: "",
    email: "",
    address: "",
    linkedin: "",
    summary: "",
    skills: "",
    avatar: "",
    experiences: [],
    educations: [],
  });

  const [theme, setTheme] = useState({
    name: "topcv",
    leftBg: "#42312B",
    rightPill: "#42312B",
  });
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Tailor JD States
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorSummary, setTailorSummary] = useState<any>(null);
  const [backupCvData, setBackupCvData] = useState<any>(null); // For discard functionality

  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && userProfile) {
      setCvData({
        full_name: userProfile.full_name || "TÊN CỦA BẠN",
        position: "Vị trí ứng tuyển",
        phone: userProfile.info?.phone || "0123 456 789",
        email: userProfile.email || "email@example.com",
        address: userProfile.info?.address || "Địa chỉ của bạn",
        linkedin: userProfile.info?.linkedin || "linkedin.com/in/...",
        avatar: userProfile.info?.avatar || "",
        summary:
          userProfile.info?.summary ||
          "- Cập nhật mục tiêu nghề nghiệp của bạn tại đây...",
        skills:
          userProfile.info?.skills || "- Kỹ năng 1\n- Kỹ năng 2\n- Kỹ năng 3",
        experiences: (userProfile.experiences?.length
          ? userProfile.experiences
          : [
              {
                company_name: "Tên công ty",
                position: "Vị trí",
                start_date: "01/2023",
                end_date: "Nay",
                description:
                  "- Nhập mô tả công việc của bạn...\n- Đạt được thành tựu...",
              },
            ]
        ).map((e: any) => ({ ...e, _uid: e._uid || genUid() })),
        educations: (userProfile.educations?.length
          ? userProfile.educations
          : [
              {
                school_name: "Tên trường",
                major: "Tên ngành học",
                start_date: "2019",
                end_date: "2023",
              },
            ]
        ).map((e: any) => ({ ...e, _uid: e._uid || genUid() })),
      });
    }
  }, [show, userProfile]);

  // Load AI-generated CV data from sessionStorage (from CV Makeover)
  useEffect(() => {
    if (!show) return;
    const raw = sessionStorage.getItem("draft_cv_data");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const aiData = parsed.data || parsed;
      const draftTheme = parsed.theme || null;

      setCvData(applyAiCvData(aiData, {
        ...cvData,
        avatar: userProfile?.info?.avatar || "",
      }));

      if (draftTheme) changeTheme(draftTheme);

      sessionStorage.removeItem("draft_cv_data");
      toast.success("Đã tải dữ liệu CV từ AI. Bạn có thể chỉnh sửa theo ý muốn!");
    } catch (err) {
      console.error("Failed to parse draft_cv_data:", err);
      sessionStorage.removeItem("draft_cv_data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // --- JD TAILORING LOGIC ---
  const handleTailorSubmit = async (jdText: string) => {
    setIsTailoring(true);
    setBackupCvData(JSON.parse(JSON.stringify(cvData)));

    try {
      const masterCvJson = serializeCvDataForBackend(cvData);

      const res = await fetch(`${API_URL}/cv/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master_cv_json: masterCvJson, jd_text: jdText }),
      });

      if (!res.ok) throw new Error("API responded with an error");

      const data = await res.json();
      setCvData(applyAiCvData(data.cv_data, cvData));
      setTailorSummary(data.tailor_summary);
      toast.success("CV đã được tối ưu! Vui lòng xem kết quả.");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi tối ưu CV. Vui lòng thử lại.");
    } finally {
      setIsTailoring(false);
    }
  };

  const applyTailoredChanges = () => {
    setShowTailorModal(false);
    setTailorSummary(null);
    setBackupCvData(null);
    toast.success("Đã áp dụng thay đổi vào CV của bạn!");
  };

  const discardTailoredChanges = () => {
    if (backupCvData) setCvData(backupCvData);
    setShowTailorModal(false);
    setTailorSummary(null);
    setBackupCvData(null);
    toast("Đã hoàn tác thay đổi.", { icon: "↩️" });
  };

  // PDF DOWNLOAD HANDLER (1-CLICK)
  const handleDownloadPDF = () => {
    setFocusedSection(null); // Remove blue border
    setIsDownloading(true);

    setTimeout(async () => {
      if (!cvRef.current) return;
      try {
        // 1. Capture the CV block at high resolution (scale: 2)
        const canvas = await html2canvas(cvRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        // 2. Convert to JPEG image
        const imgData = canvas.toDataURL("image/jpeg", 1.0);

        // 3. Create A4-sized PDF and paste the image
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        // 4. Auto-download to user's device
        const fileName = `${cvData.full_name.replace(/\s+/g, "_")}_CV.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error("Lỗi khi tạo PDF:", error);
        alert("Có lỗi xảy ra khi xuất file!");
      } finally {
        setIsDownloading(false);
      }
    }, 300); // Wait 0.3s for UI focus borders to disappear before capturing
  };

  const updateExp = (index: number, field: string, val: string) => {
    const newExps = [...cvData.experiences];
    newExps[index][field] = val;
    setCvData({ ...cvData, experiences: newExps });
  };
  const updateEdu = (index: number, field: string, val: string) => {
    const newEdus = [...cvData.educations];
    newEdus[index][field] = val;
    setCvData({ ...cvData, educations: newEdus });
  };

  const addExp = () => {
    setCvData((prev: any) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          _uid: genUid(),
          company_name: "Tên công ty mới",
          position: "Vị trí mới",
          start_date: "MM/YYYY",
          end_date: "Nay",
          description: "- Mô tả công việc...",
        },
      ],
    }));
  };

  const removeExp = (index: number) => {
    setCvData((prev: any) => ({
      ...prev,
      experiences: prev.experiences.filter((_: any, i: number) => i !== index),
    }));
  };

  const addEdu = () => {
    setCvData((prev: any) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          _uid: genUid(),
          school_name: "Tên trường mới",
          major: "Ngành học mới",
          start_date: "YYYY",
          end_date: "YYYY",
        },
      ],
    }));
  };

  const removeEdu = (index: number) => {
    setCvData((prev: any) => ({
      ...prev,
      educations: prev.educations.filter((_: any, i: number) => i !== index),
    }));
  };
  const changeTheme = (type: string) => {
    const t = THEME_MAP[type];
    if (t) setTheme(t);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Tạo CV">
      <div className="bg-slate-900 w-full max-w-7xl h-[95vh] rounded-3xl border border-slate-700 flex flex-col p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex gap-2 text-white items-center">
            <LayoutTemplate className="text-blue-500" /> Trình Soạn thảo CV
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowTailorModal(true)}
              disabled={isDownloading || isTailoring}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-white transition-all ${isDownloading || isTailoring ? "bg-slate-700 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 shadow-lg"}`}
              title="Nhân bản & tối ưu CV theo Job Description"
            >
              <Wand2 size={18} className="text-blue-200" /> Tối ưu theo JD
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-white transition-all ${isDownloading ? "bg-slate-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"}`}
            >
              <Download size={18} />{" "}
              {isDownloading ? "Đang xử lý..." : "Tải xuống PDF"}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* LEFT CONTROL COLUMN */}
          <div className="w-[25%] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {focusedSection ? (
              <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-2xl animate-in slide-in-from-left-4">
                <button
                  onClick={() => setFocusedSection(null)}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-white mb-4 transition-colors"
                >
                  <ChevronLeft size={16} /> Quay lại Chọn mẫu
                </button>
                <div className="flex items-center gap-2 text-yellow-500 font-bold mb-3">
                  <Lightbulb size={20} />{" "}
                  {HINTS[focusedSection]?.title || "Gợi ý viết CV"}
                </div>
                <ul className="space-y-3 text-sm text-blue-100">
                  {HINTS[focusedSection]?.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-500">•</span>{" "}
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 animate-in fade-in">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-3">
                  Chọn màu sắc chủ đạo
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => changeTheme("topcv")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "topcv" ? "border-blue-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#42312B]"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Nâu{" "}
                      {theme.name === "topcv" && (
                        <CheckCircle2 className="text-blue-500" size={18} />
                      )}
                    </h4>
                  </div>
                  <div
                    onClick={() => changeTheme("antuong")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "antuong" ? "border-blue-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#465345]"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Xanh Rêu (Developer){" "}
                      {theme.name === "antuong" && (
                        <CheckCircle2 className="text-blue-500" size={18} />
                      )}
                    </h4>
                  </div>
                  <div
                    onClick={() => changeTheme("thamvong")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "thamvong" ? "border-blue-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#1A1A1A]"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Đen Vàng (Tham vọng){" "}
                      {theme.name === "thamvong" && (
                        <CheckCircle2 className="text-blue-500" size={18} />
                      )}
                    </h4>
                  </div>
                  <div
                    onClick={() => changeTheme("makeover_blue")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "makeover_blue" ? "border-blue-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-indigo-700"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Xanh Chuyên nghiệp{" "}
                      {theme.name === "makeover_blue" && (
                        <CheckCircle2 className="text-blue-500" size={18} />
                      )}
                    </h4>
                  </div>
                  {/* --- New Template Themes --- */}
                  <div className="pt-2 border-t border-slate-700/50 mt-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
                      Template mới
                    </p>
                  </div>
                  <div
                    onClick={() => changeTheme("teal")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "teal" ? "border-teal-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-teal-600"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Teal Sidebar{" "}
                      {theme.name === "teal" && (
                        <CheckCircle2 className="text-teal-500" size={18} />
                      )}
                    </h4>
                  </div>
                  <div
                    onClick={() => changeTheme("brown")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "brown" ? "border-amber-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#5D4037]"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Nâu Elegant{" "}
                      {theme.name === "brown" && (
                        <CheckCircle2 className="text-amber-500" size={18} />
                      )}
                    </h4>
                  </div>
                  <div
                    onClick={() => changeTheme("blue_modern")}
                    className={`p-4 rounded-xl cursor-pointer border relative overflow-hidden transition-all ${theme.name === "blue_modern" ? "border-sky-500 bg-slate-800" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-800"></div>
                    <h4 className="font-bold text-white flex justify-between ml-2">
                      Blue Modern{" "}
                      {theme.name === "blue_modern" && (
                        <CheckCircle2 className="text-sky-500" size={18} />
                      )}
                    </h4>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl text-sm text-yellow-200 border border-yellow-500/20">
                  💡 <b>Hướng dẫn:</b> Bấm trực tiếp vào dòng chữ bên phải để
                  sửa nội dung!
                </div>
              </div>
            )}
          </div>

          {/* CV PREVIEW AND EDIT AREA (RIGHT SIDE) */}
          <div className="w-[75%] bg-slate-800 rounded-2xl border border-slate-700 overflow-auto p-8 custom-scrollbar relative flex justify-center items-start">
            {/* ZOOM WRAPPER (Display scale only) */}
            <div className="origin-top-left scale-[0.65] sm:scale-[0.72] lg:scale-[0.80] xl:scale-[0.88] transition-transform shrink-0">
              {theme.name === "teal" ? (
                <div
                  ref={cvRef}
                  className="bg-white flex flex-row min-h-[297mm] w-[210mm] shadow-2xl font-sans text-[13px] leading-relaxed overflow-hidden"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {/* LEFT SIDEBAR (Teal) */}
                  <div className="w-[35%] bg-teal-700 text-white px-6 py-8 flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-slate-200 border-[3px] border-white/30 flex items-center justify-center overflow-hidden mb-5 shadow-xl">
                      <AvatarDisplay src={cvData.avatar} />
                    </div>
                    <EditableText
                      className="text-[20px] font-extrabold text-center tracking-tight leading-tight mb-1 w-full text-white"
                      value={cvData.full_name}
                      onChange={(v: string) => setCvData({ ...cvData, full_name: v })}
                    />
                    <EditableText
                      className="text-teal-200 text-[12px] font-medium text-center tracking-wide mb-6 w-full"
                      value={cvData.position}
                      onChange={(v: string) => setCvData({ ...cvData, position: v })}
                    />
                    {/* Contact */}
                    <div className="w-full mb-6">
                      <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3 text-teal-200 border-b border-teal-500/50 pb-1.5">Liên hệ</h2>
                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center gap-2.5"><Phone size={13} className="text-teal-300 shrink-0" /><EditableText className="flex-1" value={cvData.phone} onChange={(v: string) => setCvData({ ...cvData, phone: v })} /></div>
                        <div className="flex items-center gap-2.5"><Mail size={13} className="text-teal-300 shrink-0" /><EditableText className="flex-1" value={cvData.email} onChange={(v: string) => setCvData({ ...cvData, email: v })} /></div>
                        <div className="flex items-center gap-2.5"><MapPin size={13} className="text-teal-300 shrink-0" /><EditableText className="flex-1" value={cvData.address} onChange={(v: string) => setCvData({ ...cvData, address: v })} /></div>
                      </div>
                    </div>
                    {/* Skills */}
                    <div className="w-full mb-6">
                      <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3 text-teal-200">Kỹ năng</h2>
                      <EditableText isMultiline={true} className="text-sm text-teal-100 leading-relaxed" value={cvData.skills} onFocus={() => setFocusedSection("skills")} onChange={(v: string) => setCvData({ ...cvData, skills: v })} />
                    </div>
                    {/* Education */}
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-[12px] font-bold uppercase tracking-widest text-teal-200">Học vấn</h2>
                        <button onClick={addEdu} data-html2canvas-ignore="true" className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Thêm học vấn"><Plus size={14} /></button>
                      </div>
                      <div className="space-y-3">
                        {cvData.educations.map((edu: any, i: number) => (
                          <div key={edu._uid || i} className="text-sm relative group">
                            <button onClick={() => removeEdu(i)} data-html2canvas-ignore="true" className="absolute -right-3 top-0 p-1 text-red-300 hover:bg-red-400/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={12} /></button>
                            <EditableText className="font-bold text-white text-[12px]" value={edu.major} onFocus={() => setFocusedSection("education")} onChange={(v: string) => updateEdu(i, "major", v)} placeholder="Ngành học" />
                            <EditableText className="text-teal-200 text-[11px] mt-0.5" value={edu.school_name} onFocus={() => setFocusedSection("education")} onChange={(v: string) => updateEdu(i, "school_name", v)} placeholder="Tên trường" />
                            <div className="text-teal-300/70 text-[10px] mt-0.5 flex gap-1 italic">
                              <EditableText value={edu.start_date} onChange={(v: string) => updateEdu(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                              <EditableText value={edu.end_date} onChange={(v: string) => updateEdu(i, "end_date", v)} placeholder="Kết thúc" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* RIGHT CONTENT (White) */}
                  <div className="w-[65%] px-8 py-8 text-gray-800">
                    {/* Summary */}
                    <div className="mb-6">
                      <h2 className="text-[14px] font-bold text-teal-700 uppercase tracking-wider mb-2">Giới thiệu</h2>
                      <div className="w-10 h-[2px] bg-teal-600 mb-3 rounded-full" />
                      <EditableText isMultiline={true} className="text-[12.5px] text-gray-600 leading-relaxed" value={cvData.summary} onFocus={() => setFocusedSection("summary")} onChange={(v: string) => setCvData({ ...cvData, summary: v })} />
                    </div>
                    {/* Experience */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-[14px] font-bold text-teal-700 uppercase tracking-wider">Kinh nghiệm Làm việc</h2>
                        <button onClick={addExp} data-html2canvas-ignore="true" className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors" title="Thêm"><Plus size={14} /></button>
                      </div>
                      <div className="w-10 h-[2px] bg-teal-600 mb-4 rounded-full" />
                      <div className="space-y-5">
                        {cvData.experiences.map((exp: any, i: number) => (
                          <div key={exp._uid || i} className="relative group">
                            <button onClick={() => removeExp(i)} data-html2canvas-ignore="true" className="absolute -right-5 top-0 p-1 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={14} /></button>
                            <div className="flex justify-between items-baseline mb-1">
                              <EditableText className="font-bold text-[13px] text-gray-900 w-[70%]" value={exp.position} onChange={(v: string) => updateExp(i, "position", v)} />
                              <div className="text-[10px] text-gray-400 flex gap-1">
                                <EditableText value={exp.start_date} onChange={(v: string) => updateExp(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                                <EditableText value={exp.end_date} onChange={(v: string) => updateExp(i, "end_date", v)} placeholder="Kết thúc" />
                              </div>
                            </div>
                            <EditableText className="text-[12px] text-teal-600 font-semibold mb-1" value={exp.company_name} onChange={(v: string) => updateExp(i, "company_name", v)} />
                            <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed" value={exp.description} onFocus={() => setFocusedSection("experience")} onChange={(v: string) => updateExp(i, "description", v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : theme.name === "brown" ? (
                <div
                  ref={cvRef}
                  className="bg-white w-[210mm] min-h-[297mm] shadow-2xl font-sans text-[13px] leading-relaxed overflow-hidden"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {/* Header (Dark Brown) */}
                  <div className="bg-[#5D4037] px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-[90px] h-[90px] rounded-full bg-slate-200 border-[3px] border-amber-200/30 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                        <AvatarDisplay src={cvData.avatar} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <EditableText className="text-[28px] font-extrabold text-white tracking-tight leading-tight" value={cvData.full_name} onChange={(v: string) => setCvData({ ...cvData, full_name: v })} />
                        <EditableText className="text-amber-200/80 text-[14px] font-medium mt-1 tracking-wide uppercase" value={cvData.position} onChange={(v: string) => setCvData({ ...cvData, position: v })} />
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-amber-100/70">
                          <div className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /><EditableText value={cvData.phone} onChange={(v: string) => setCvData({ ...cvData, phone: v })} /></div>
                          <div className="flex items-center gap-1.5"><Mail size={12} className="shrink-0" /><EditableText value={cvData.email} onChange={(v: string) => setCvData({ ...cvData, email: v })} /></div>
                          <div className="flex items-center gap-1.5"><MapPin size={12} className="shrink-0" /><EditableText value={cvData.address} onChange={(v: string) => setCvData({ ...cvData, address: v })} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Body: 2-Column */}
                  <div className="grid grid-cols-5 gap-0">
                    {/* Left Column (2/5) */}
                    <div className="col-span-2 px-6 py-7 bg-amber-50/40 border-r border-amber-100/50">
                      {/* Skills */}
                      <div className="mb-6">
                        <h2 className="text-[13px] font-bold text-[#5D4037] uppercase tracking-wider mb-3">Kỹ năng</h2>
                        <div className="w-8 h-[2px] bg-[#8D6E63] mb-3 rounded-full" />
                        <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed" value={cvData.skills} onFocus={() => setFocusedSection("skills")} onChange={(v: string) => setCvData({ ...cvData, skills: v })} />
                      </div>
                      {/* Summary */}
                      <div className="mb-6">
                        <h2 className="text-[13px] font-bold text-[#5D4037] uppercase tracking-wider mb-3">Giới thiệu</h2>
                        <div className="w-8 h-[2px] bg-[#8D6E63] mb-3 rounded-full" />
                        <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed" value={cvData.summary} onFocus={() => setFocusedSection("summary")} onChange={(v: string) => setCvData({ ...cvData, summary: v })} />
                      </div>
                    </div>
                    {/* Right Column (3/5) */}
                    <div className="col-span-3 px-7 py-7 text-gray-800">
                      {/* Experience */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h2 className="text-[14px] font-bold text-[#5D4037] uppercase tracking-wider">Kinh nghiệm Làm việc</h2>
                          <button onClick={addExp} data-html2canvas-ignore="true" className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors" title="Thêm"><Plus size={14} /></button>
                        </div>
                        <div className="w-10 h-[2px] bg-[#8D6E63] mb-4 rounded-full" />
                        <div className="space-y-5">
                          {cvData.experiences.map((exp: any, i: number) => (
                            <div key={exp._uid || i} className="relative group">
                              <button onClick={() => removeExp(i)} data-html2canvas-ignore="true" className="absolute -right-5 top-0 p-1 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={14} /></button>
                              <div className="flex justify-between items-baseline mb-1">
                                <EditableText className="font-bold text-[13px] text-gray-900 w-[70%]" value={exp.position} onChange={(v: string) => updateExp(i, "position", v)} />
                                <div className="text-[10px] text-gray-400 bg-amber-50 px-2 py-0.5 rounded flex gap-1">
                                  <EditableText value={exp.start_date} onChange={(v: string) => updateExp(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                                  <EditableText value={exp.end_date} onChange={(v: string) => updateExp(i, "end_date", v)} placeholder="Kết thúc" />
                                </div>
                              </div>
                              <EditableText className="text-[12px] text-[#8D6E63] font-semibold mb-1" value={exp.company_name} onChange={(v: string) => updateExp(i, "company_name", v)} />
                              <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed" value={exp.description} onFocus={() => setFocusedSection("experience")} onChange={(v: string) => updateExp(i, "description", v)} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Education */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h2 className="text-[14px] font-bold text-[#5D4037] uppercase tracking-wider">Học vấn</h2>
                          <button onClick={addEdu} data-html2canvas-ignore="true" className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors" title="Thêm"><Plus size={14} /></button>
                        </div>
                        <div className="w-10 h-[2px] bg-[#8D6E63] mb-4 rounded-full" />
                        <div className="space-y-3">
                          {cvData.educations.map((edu: any, i: number) => (
                            <div key={edu._uid || i} className="relative group">
                              <button onClick={() => removeEdu(i)} data-html2canvas-ignore="true" className="absolute -right-5 top-0 p-1 text-red-400 hover:bg-red-400/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={12} /></button>
                              <EditableText className="font-bold text-[13px] text-gray-900" value={edu.school_name} onFocus={() => setFocusedSection("education")} onChange={(v: string) => updateEdu(i, "school_name", v)} placeholder="Tên trường" />
                              <EditableText className="text-[12px] text-gray-600 mt-0.5" value={edu.major} onChange={(v: string) => updateEdu(i, "major", v)} placeholder="Ngành học" />
                              <div className="text-[10px] text-gray-400 mt-0.5 flex gap-1">
                                <EditableText value={edu.start_date} onChange={(v: string) => updateEdu(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                                <EditableText value={edu.end_date} onChange={(v: string) => updateEdu(i, "end_date", v)} placeholder="Kết thúc" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : theme.name === "blue_modern" ? (
                <div
                  ref={cvRef}
                  className="bg-white flex flex-row min-h-[297mm] w-[210mm] shadow-2xl font-sans text-[13px] leading-relaxed overflow-hidden"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {/* LEFT SIDEBAR (Blue) */}
                  <div className="w-[35%] bg-blue-800 text-white px-6 py-8 flex flex-col items-center">
                    <div className="w-[120px] h-[120px] rounded-full bg-slate-200 border-[4px] border-blue-400/30 flex items-center justify-center overflow-hidden mb-5 shadow-xl">
                      <AvatarDisplay src={cvData.avatar} />
                    </div>
                    <EditableText
                      className="text-[18px] font-extrabold text-center tracking-tight leading-tight mb-1 w-full text-white"
                      value={cvData.full_name}
                      onChange={(v: string) => setCvData({ ...cvData, full_name: v })}
                    />
                    <EditableText
                      className="text-blue-200 text-[11px] font-medium text-center tracking-wide uppercase mb-6 w-full"
                      value={cvData.position}
                      onChange={(v: string) => setCvData({ ...cvData, position: v })}
                    />
                    {/* Contact */}
                    <div className="w-full mb-6">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3 text-blue-300 border-b border-blue-600/50 pb-1.5">Liên hệ</h2>
                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center gap-2.5"><Phone size={12} className="text-blue-300 shrink-0" /><EditableText className="flex-1" value={cvData.phone} onChange={(v: string) => setCvData({ ...cvData, phone: v })} /></div>
                        <div className="flex items-center gap-2.5"><Mail size={12} className="text-blue-300 shrink-0" /><EditableText className="flex-1" value={cvData.email} onChange={(v: string) => setCvData({ ...cvData, email: v })} /></div>
                        <div className="flex items-center gap-2.5"><MapPin size={12} className="text-blue-300 shrink-0" /><EditableText className="flex-1" value={cvData.address} onChange={(v: string) => setCvData({ ...cvData, address: v })} /></div>
                      </div>
                    </div>
                    {/* Skills */}
                    <div className="w-full">
                      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3 text-blue-300">Kỹ năng</h2>
                      <EditableText isMultiline={true} className="text-[11px] text-blue-100 leading-relaxed" value={cvData.skills} onFocus={() => setFocusedSection("skills")} onChange={(v: string) => setCvData({ ...cvData, skills: v })} />
                    </div>
                  </div>
                  {/* RIGHT CONTENT (White with blue headers) */}
                  <div className="w-[65%] py-8 text-gray-800">
                    {/* Summary */}
                    <div className="mb-5 px-7">
                      <div className="bg-blue-50 px-4 py-1.5 rounded mb-3">
                        <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">Giới thiệu</h2>
                      </div>
                      <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed px-1" value={cvData.summary} onFocus={() => setFocusedSection("summary")} onChange={(v: string) => setCvData({ ...cvData, summary: v })} />
                    </div>
                    {/* Education */}
                    <div className="mb-5 px-7">
                      <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                        <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">Học vấn</h2>
                        <button onClick={addEdu} data-html2canvas-ignore="true" className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors" title="Thêm"><Plus size={14} /></button>
                      </div>
                      <div className="space-y-3 px-1">
                        {cvData.educations.map((edu: any, i: number) => (
                          <div key={edu._uid || i} className="relative group">
                            <button onClick={() => removeEdu(i)} data-html2canvas-ignore="true" className="absolute -right-5 top-0 p-1 text-red-400 hover:bg-red-400/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={12} /></button>
                            <EditableText className="font-bold text-[13px] text-gray-900" value={edu.school_name} onFocus={() => setFocusedSection("education")} onChange={(v: string) => updateEdu(i, "school_name", v)} placeholder="Tên trường" />
                            <EditableText className="text-[12px] text-gray-600 mt-0.5" value={edu.major} onChange={(v: string) => updateEdu(i, "major", v)} placeholder="Ngành học" />
                            <div className="text-[10px] text-gray-400 mt-0.5 flex gap-1">
                              <EditableText value={edu.start_date} onChange={(v: string) => updateEdu(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                              <EditableText value={edu.end_date} onChange={(v: string) => updateEdu(i, "end_date", v)} placeholder="Kết thúc" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Experience */}
                    <div className="mb-5 px-7">
                      <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                        <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">Kinh nghiệm Làm việc</h2>
                        <button onClick={addExp} data-html2canvas-ignore="true" className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors" title="Thêm"><Plus size={14} /></button>
                      </div>
                      <div className="space-y-5 px-1">
                        {cvData.experiences.map((exp: any, i: number) => (
                          <div key={exp._uid || i} className="relative group">
                            <button onClick={() => removeExp(i)} data-html2canvas-ignore="true" className="absolute -right-5 top-0 p-1 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa"><Trash2 size={14} /></button>
                            <div className="flex justify-between items-baseline mb-1">
                              <EditableText className="font-bold text-[13px] text-gray-900 w-[70%]" value={exp.position} onChange={(v: string) => updateExp(i, "position", v)} />
                              <div className="text-[10px] text-gray-400 flex gap-1">
                                <EditableText value={exp.start_date} onChange={(v: string) => updateExp(i, "start_date", v)} placeholder="Bắt đầu" />{" "}-{" "}
                                <EditableText value={exp.end_date} onChange={(v: string) => updateExp(i, "end_date", v)} placeholder="Kết thúc" />
                              </div>
                            </div>
                            <EditableText className="text-[12px] text-blue-600 font-semibold mb-1" value={exp.company_name} onChange={(v: string) => updateExp(i, "company_name", v)} />
                            <EditableText isMultiline={true} className="text-[12px] text-gray-600 leading-relaxed" value={exp.description} onFocus={() => setFocusedSection("experience")} onChange={(v: string) => updateExp(i, "description", v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* === LEGACY EDITABLE TEMPLATE (all legacy themes) === */
                <div
                  ref={cvRef}
                  className="bg-white flex flex-row min-h-[297mm] w-[210mm] shadow-2xl font-sans text-[13px] leading-relaxed overflow-hidden"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {/* --- LEFT COLUMN --- */}
                  <div
                    className="w-[38%] text-white pt-10 pb-8 px-6 flex flex-col items-center"
                    style={{ backgroundColor: theme.leftBg }}
                  >
                    <div
                      className="w-36 h-36 rounded-full bg-slate-200 border-4 flex items-center justify-center overflow-hidden mb-6 shadow-md"
                      style={{
                        borderColor:
                          theme.rightPill === "#F39C12"
                            ? "#F39C12"
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <AvatarDisplay src={cvData.avatar} />
                    </div>
                    <EditableText
                      className={`text-2xl font-bold text-center uppercase tracking-wide leading-tight mb-1 w-full text-center ${theme.name === "thamvong" ? "text-[#F39C12]" : "text-white"}`}
                      value={cvData.full_name}
                      onChange={(v: string) =>
                        setCvData({ ...cvData, full_name: v })
                      }
                    />
                    <EditableText
                      className="text-[14px] font-medium text-center text-gray-300 uppercase tracking-wider mb-8 w-full text-center"
                      value={cvData.position}
                      onChange={(v: string) =>
                        setCvData({ ...cvData, position: v })
                      }
                    />

                    <div className="w-full space-y-3 mb-8 text-[12px]">
                      <div className="flex items-start gap-3">
                        <Phone
                          size={14}
                          className={`mt-0.5 shrink-0 ${theme.name === "thamvong" ? "text-[#F39C12]" : ""}`}
                        />
                        <EditableText
                          className="flex-1"
                          value={cvData.phone}
                          onChange={(v: string) =>
                            setCvData({ ...cvData, phone: v })
                          }
                        />
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail
                          size={14}
                          className={`mt-0.5 shrink-0 ${theme.name === "thamvong" ? "text-[#F39C12]" : ""}`}
                        />
                        <EditableText
                          className="flex-1"
                          value={cvData.email}
                          onChange={(v: string) =>
                            setCvData({ ...cvData, email: v })
                          }
                        />
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={14}
                          className={`mt-0.5 shrink-0 ${theme.name === "thamvong" ? "text-[#F39C12]" : ""}`}
                        />
                        <EditableText
                          className="flex-1"
                          value={cvData.address}
                          onChange={(v: string) =>
                            setCvData({ ...cvData, address: v })
                          }
                        />
                      </div>
                    </div>

                    <div className="w-full mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="px-4 py-1.5 rounded-full inline-block font-bold text-sm uppercase"
                          style={{
                            backgroundColor:
                              theme.name === "thamvong"
                                ? "transparent"
                                : "rgba(255,255,255,0.15)",
                            borderBottom:
                              theme.name === "thamvong"
                                ? "1px solid #444"
                                : "none",
                            color:
                              theme.name === "thamvong" ? "#F39C12" : "white",
                            paddingLeft:
                              theme.name === "thamvong" ? "0" : "1rem",
                          }}
                        >
                          Học vấn
                        </div>
                        <button
                          onClick={addEdu}
                          data-html2canvas-ignore="true"
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                          title="Thêm học vấn"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {cvData.educations.map((edu: any, i: number) => (
                          <div
                            key={edu._uid || i}
                            className="text-sm relative group"
                          >
                            <button
                              onClick={() => removeEdu(i)}
                              data-html2canvas-ignore="true"
                              className="absolute -right-4 top-0 p-1 text-red-400 hover:bg-red-400/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Xóa học vấn này"
                            >
                              <Trash2 size={14} />
                            </button>
                            <EditableText
                              className={`font-bold ${theme.name === "thamvong" ? "text-white" : "text-gray-100"}`}
                              value={edu.major}
                              onFocus={() => setFocusedSection("education")}
                              onChange={(v: string) => updateEdu(i, "major", v)}
                              placeholder="Ngành học"
                            />
                            <EditableText
                              className={`mt-0.5 ${theme.name === "thamvong" ? "text-[#F39C12]" : "text-gray-300"}`}
                              value={edu.school_name}
                              onFocus={() => setFocusedSection("education")}
                              onChange={(v: string) =>
                                updateEdu(i, "school_name", v)
                              }
                              placeholder="Tên trường học"
                            />
                            <div className="text-gray-400 text-xs mt-1 flex gap-1 italic">
                              <EditableText
                                value={edu.start_date}
                                onChange={(v: string) =>
                                  updateEdu(i, "start_date", v)
                                }
                                placeholder="Bắt đầu"
                              />{" "}
                              -{" "}
                              <EditableText
                                value={edu.end_date}
                                onChange={(v: string) =>
                                  updateEdu(i, "end_date", v)
                                }
                                placeholder="Kết thúc"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full mb-8">
                      <div
                        className="px-4 py-1.5 rounded-full inline-block font-bold mb-4 text-sm uppercase"
                        style={{
                          backgroundColor:
                            theme.name === "thamvong"
                              ? "transparent"
                              : "rgba(255,255,255,0.15)",
                          borderBottom:
                            theme.name === "thamvong"
                              ? "1px solid #444"
                              : "none",
                          color:
                            theme.name === "thamvong" ? "#F39C12" : "white",
                          paddingLeft: theme.name === "thamvong" ? "0" : "1rem",
                        }}
                      >
                        Kỹ năng
                      </div>
                      <EditableText
                        isMultiline={true}
                        className="text-sm text-gray-200 leading-relaxed"
                        value={cvData.skills}
                        onFocus={() => setFocusedSection("skills")}
                        onChange={(v: string) =>
                          setCvData({ ...cvData, skills: v })
                        }
                      />
                    </div>
                  </div>

                  {/* --- RIGHT COLUMN --- */}
                  <div className="w-[62%] bg-white pt-10 pb-8 px-8 text-gray-800">
                    <div className="mb-8">
                      <div
                        className="text-white px-5 py-1.5 rounded-full inline-block font-bold mb-4 text-[13px] uppercase"
                        style={{
                          backgroundColor: theme.rightPill,
                          color: theme.name === "thamvong" ? "#000" : "#fff",
                        }}
                      >
                        Mục tiêu nghề nghiệp
                      </div>
                      <EditableText
                        isMultiline={true}
                        className="text-justify text-gray-700 leading-relaxed"
                        value={cvData.summary}
                        onFocus={() => setFocusedSection("summary")}
                        onChange={(v: string) =>
                          setCvData({ ...cvData, summary: v })
                        }
                      />
                    </div>

                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="text-white px-5 py-1.5 rounded-full inline-block font-bold text-[13px] uppercase"
                          style={{
                            backgroundColor: theme.rightPill,
                            color: theme.name === "thamvong" ? "#000" : "#fff",
                          }}
                        >
                          Kinh nghiệm làm việc
                        </div>
                        <button
                          onClick={addExp}
                          data-html2canvas-ignore="true"
                          className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                          title="Thêm kinh nghiệm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="space-y-6">
                        {cvData.experiences.map((exp: any, i: number) => (
                          <div key={exp._uid || i} className="relative group">
                            <button
                              onClick={() => removeExp(i)}
                              data-html2canvas-ignore="true"
                              className="absolute -right-6 top-0 p-1.5 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Xóa kinh nghiệm này"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="flex justify-between items-baseline mb-1">
                              <EditableText
                                className="font-bold text-[15px] text-gray-900 w-[70%]"
                                value={exp.position}
                                onChange={(v: string) =>
                                  updateExp(i, "position", v)
                                }
                              />
                              <div className="text-xs font-bold text-gray-500 uppercase flex gap-1">
                                <EditableText
                                  value={exp.start_date}
                                  onChange={(v: string) =>
                                    updateExp(i, "start_date", v)
                                  }
                                  placeholder="Bắt đầu"
                                />{" "}
                                -{" "}
                                <EditableText
                                  value={exp.end_date}
                                  onChange={(v: string) =>
                                    updateExp(i, "end_date", v)
                                  }
                                  placeholder="Kết thúc"
                                />
                              </div>
                            </div>
                            <EditableText
                              className={`text-sm font-semibold mb-2 uppercase ${theme.name === "thamvong" ? "text-[#F39C12]" : "text-gray-600"}`}
                              value={exp.company_name}
                              onChange={(v: string) =>
                                updateExp(i, "company_name", v)
                              }
                            />
                            <EditableText
                              isMultiline={true}
                              className="text-sm text-gray-700 leading-relaxed pl-1"
                              value={exp.description}
                              onFocus={() => setFocusedSection("experience")}
                              onChange={(v: string) =>
                                updateExp(i, "description", v)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TAILOR JD MODAL */}
      <TailorJDModal
        show={showTailorModal}
        onClose={discardTailoredChanges} // If closed without applying, discard
        onSubmit={handleTailorSubmit}
        tailorSummary={tailorSummary}
        isLoading={isTailoring}
        onApplyChanges={applyTailoredChanges}
        onDiscardChanges={discardTailoredChanges}
      />
    </div>
  );
}
