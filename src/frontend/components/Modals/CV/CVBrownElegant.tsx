/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { forwardRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  GraduationCap,
  User,
  Wrench,
} from "lucide-react";
import type { CVData } from "./CVProTemplate";

interface CVBrownElegantProps {
  cvData: CVData;
  avatarUrl?: string;
}

const CVBrownElegant = forwardRef<HTMLDivElement, CVBrownElegantProps>(
  ({ cvData, avatarUrl }, ref) => {
    const info = cvData.personal_info || {};
    const skills = cvData.skills || [];
    const experience = cvData.experience || [];
    const education = cvData.education || [];

    return (
      <div
        ref={ref}
        id="cv-brown-elegant"
        className="bg-white w-[794px] min-h-[1123px] text-gray-800 shadow-[0_8px_60px_rgba(0,0,0,0.3)] rounded-sm print:block print:overflow-visible print:shadow-none print:rounded-none print:w-full print:min-h-0"
        style={{
          fontFamily:
            "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* ===== HEADER (Dark Brown) ===== */}
        <div className="bg-[#5D4037] px-10 py-8 print:bg-[#5D4037]">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            {avatarUrl && (
              <div className="shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-[90px] h-[90px] rounded-full border-[3px] border-amber-200/30 shadow-xl object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">
                {info.name || "Ứng viên"}
              </h1>
              {info.title && (
                <p className="text-amber-200/80 text-[14px] font-medium mt-1 tracking-wide uppercase">
                  {info.title}
                </p>
              )}
              {/* Contact row */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {info.email && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-100/70">
                    <Mail size={12} className="shrink-0" />
                    <span>{info.email}</span>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-100/70">
                    <Phone size={12} className="shrink-0" />
                    <span>{info.phone}</span>
                  </div>
                )}
                {info.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-100/70">
                    <MapPin size={12} className="shrink-0" />
                    <span>{info.location}</span>
                  </div>
                )}
                {info.linkedin && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-100/70">
                    <Linkedin size={12} className="shrink-0" />
                    <span>{info.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== BODY: 2-Column Layout ===== */}
        <div className="grid grid-cols-5 gap-0">
          {/* === LEFT COLUMN (2/5) === */}
          <div className="col-span-2 px-6 py-7 bg-amber-50/40 border-r border-amber-100/50">
            {/* Skills */}
            {skills.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={14} className="text-[#5D4037]" />
                  <h2 className="text-[13px] font-bold text-[#5D4037] uppercase tracking-wider">
                    Kỹ năng
                  </h2>
                </div>
                <div className="w-8 h-[2px] bg-[#8D6E63] mb-3 rounded-full" />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-[#5D4037]/10 text-[#5D4037] px-2.5 py-1 rounded-md font-medium border border-[#8D6E63]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Summary / Intro */}
            {info.summary && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} className="text-[#5D4037]" />
                  <h2 className="text-[13px] font-bold text-[#5D4037] uppercase tracking-wider">
                    Giới thiệu
                  </h2>
                </div>
                <div className="w-8 h-[2px] bg-[#8D6E63] mb-3 rounded-full" />
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  {info.summary}
                </p>
              </section>
            )}
          </div>

          {/* === RIGHT COLUMN (3/5) === */}
          <div className="col-span-3 px-7 py-7">
            {/* Experience */}
            {experience.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={15} className="text-[#5D4037]" />
                  <h2 className="text-[14px] font-bold text-[#5D4037] uppercase tracking-wider">
                    Kinh nghiệm Làm việc
                  </h2>
                </div>
                <div className="w-10 h-[2px] bg-[#8D6E63] mb-4 rounded-full" />
                <div className="space-y-5">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-900">
                            {exp.role}
                          </h3>
                          <p className="text-[12px] text-[#8D6E63] font-semibold">
                            {exp.company}
                          </p>
                        </div>
                        {exp.period && (
                          <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5 font-medium bg-amber-50 px-2 py-0.5 rounded">
                            {exp.period}
                          </span>
                        )}
                      </div>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((ach, j) => (
                            <li
                              key={j}
                              className="text-[12px] text-gray-600 leading-relaxed flex items-start gap-2"
                            >
                              <span className="text-[#8D6E63] mt-1.5 shrink-0">
                                •
                              </span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={15} className="text-[#5D4037]" />
                  <h2 className="text-[14px] font-bold text-[#5D4037] uppercase tracking-wider">
                    Học vấn
                  </h2>
                </div>
                <div className="w-10 h-[2px] bg-[#8D6E63] mb-4 rounded-full" />
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-900">
                            {edu.school}
                          </h3>
                          <p className="text-[12px] text-gray-600 mt-0.5">
                            {edu.degree}
                          </p>
                        </div>
                        {edu.period && (
                          <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5 font-medium">
                            {edu.period}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-10 py-3 border-t border-amber-100 bg-amber-50/30">
          <p className="text-center text-[9px] text-gray-400 tracking-widest uppercase">
            Generated by SpeakCV • AI-Powered CV Makeover
          </p>
        </div>
      </div>
    );
  },
);

CVBrownElegant.displayName = "CVBrownElegant";

export default CVBrownElegant;
