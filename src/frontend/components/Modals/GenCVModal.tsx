/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 1. SMART HINTS DATA
const HINTS: any = {
  summary: {
    title: "Gợi ý viết Mục tiêu nghề nghiệp",
    tips: [
      "Nêu rõ số năm kinh nghiệm và chuyên môn cốt lõi của bạn.",
      "Mục tiêu ngắn hạn: Mong muốn học hỏi, đóng góp gì cho công ty trong 1-2 năm tới.",
      "Mục tiêu dài hạn: Định hướng trở thành chuyên gia, quản lý trong 3-5 năm.",
      "Tránh viết chung chung kiểu 'Muốn tìm môi trường năng động'.",
    ],
  },
  experience: {
    title: "Gợi ý viết Kinh nghiệm làm việc",
    tips: [
      "Bắt đầu bằng các động từ mạnh: Quản lý, Thiết kế, Phân tích, Tối ưu...",
      "Sử dụng công thức: Làm [Công việc] bằng [Công cụ] dẫn đến [Kết quả/Số liệu].",
      "Ví dụ: 'Tối ưu hóa chiến dịch quảng cáo Facebook, giúp giảm 20% chi phí chuyển đổi (CPA)'.",
      "Nên gạch đầu dòng (Sử dụng dấu - ở đầu câu) để dễ đọc.",
    ],
  },
  skills: {
    title: "Gợi ý viết Kỹ năng",
    tips: [
      "Chỉ liệt kê các kỹ năng liên quan trực tiếp đến vị trí ứng tuyển.",
      "Nên chia thành Kỹ năng cứng (ví dụ: ReactJS, Figma, SQL) và Kỹ năng mềm (Teamwork, Thuyết trình).",
      "Tránh dùng các thanh đo lường (ví dụ: 80%, 4/5 sao) vì nó rất cảm tính.",
    ],
  },
  education: {
    title: "Gợi ý viết Học vấn",
    tips: [
      "Ghi rõ tên trường, chuyên ngành và thời gian theo học.",
      "Có thể bổ sung điểm GPA (nếu cao, vd: 3.2/4.0) hoặc các giải thưởng, học bổng nổi bật.",
    ],
  },
};

// 2. HELPER COMPONENT
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

// 3. MAIN COMPONENT
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
        experiences: userProfile.experiences?.length
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
            ],
        educations: userProfile.educations?.length
          ? userProfile.educations
          : [
              {
                school_name: "Tên trường",
                major: "Tên ngành học",
                start_date: "2019",
                end_date: "2023",
              },
            ],
      });
    }
  }, [show, userProfile]);

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
  const changeTheme = (type: string) => {
    if (type === "topcv")
      setTheme({ name: "topcv", leftBg: "#42312B", rightPill: "#42312B" });
    if (type === "antuong")
      setTheme({ name: "antuong", leftBg: "#465345", rightPill: "#465345" });
    if (type === "thamvong")
      setTheme({ name: "thamvong", leftBg: "#1A1A1A", rightPill: "#F39C12" });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-7xl h-[95vh] rounded-3xl border border-slate-700 flex flex-col p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex gap-2 text-white items-center">
            <LayoutTemplate className="text-blue-500" /> Trình Soạn thảo CV
          </h2>
          <div className="flex gap-4">
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
                </div>
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl text-sm text-yellow-200 border border-yellow-500/20">
                  💡 <b>Hướng dẫn:</b> Bấm trực tiếp vào dòng chữ bên phải để
                  sửa nội dung!
                </div>
              </div>
            )}
          </div>

          {/* CV PREVIEW AND EDIT AREA (RIGHT SIDE) */}
          <div className="w-[75%] bg-slate-800 rounded-2xl border border-slate-700 overflow-auto p-8 custom-scrollbar relative flex justify-center">
            {/* ZOOM WRAPPER (Display scale only) */}
            <div className="origin-top scale-[0.80] sm:scale-[0.9] lg:scale-[0.95] transition-transform">
              <div
                ref={cvRef}
                className="bg-white flex flex-row min-h-[297mm] w-[210mm] shadow-2xl font-sans text-[13px] leading-relaxed"
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
                    <div
                      className="px-4 py-1.5 rounded-full inline-block font-bold mb-4 text-sm uppercase"
                      style={{
                        backgroundColor:
                          theme.name === "thamvong"
                            ? "transparent"
                            : "rgba(255,255,255,0.15)",
                        borderBottom:
                          theme.name === "thamvong" ? "1px solid #444" : "none",
                        color: theme.name === "thamvong" ? "#F39C12" : "white",
                        paddingLeft: theme.name === "thamvong" ? "0" : "1rem",
                      }}
                    >
                      Học vấn
                    </div>
                    <div className="space-y-4">
                      {cvData.educations.map((edu: any, i: number) => (
                        <div key={i} className="text-sm">
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
                          theme.name === "thamvong" ? "1px solid #444" : "none",
                        color: theme.name === "thamvong" ? "#F39C12" : "white",
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
                    <div
                      className="text-white px-5 py-1.5 rounded-full inline-block font-bold mb-4 text-[13px] uppercase"
                      style={{
                        backgroundColor: theme.rightPill,
                        color: theme.name === "thamvong" ? "#000" : "#fff",
                      }}
                    >
                      Kinh nghiệm làm việc
                    </div>
                    <div className="space-y-6">
                      {cvData.experiences.map((exp: any, i: number) => (
                        <div key={i}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
