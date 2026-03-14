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
  FolderKanban,
  User,
  Wrench,
} from "lucide-react";
import type { CVData } from "./CVProTemplate";

interface CVBlueModernProps {
  cvData: CVData;
  avatarUrl?: string;
}

const CVBlueModern = forwardRef<HTMLDivElement, CVBlueModernProps>(
  ({ cvData, avatarUrl }, ref) => {
    const info = cvData.personal_info || {};
    const skills = cvData.skills || [];
    const experience = cvData.experience || [];
    const education = cvData.education || [];
    const projects = cvData.projects || [];

    return (
      <div
        ref={ref}
        id="cv-blue-modern"
        className="bg-white w-[794px] min-h-[1123px] flex text-gray-800 shadow-[0_8px_60px_rgba(0,0,0,0.3)] rounded-sm print:block print:overflow-visible print:shadow-none print:rounded-none print:w-full print:min-h-0"
        style={{
          fontFamily:
            "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* ===== LEFT SIDEBAR (Blue) ===== */}
        <div className="w-[35%] bg-blue-800 text-white px-6 py-8 flex flex-col items-center print:bg-blue-800">
          {/* Large Avatar */}
          <div className="mb-5">
            <img
              src={
                avatarUrl ||
                "https://ui-avatars.com/api/?name=User&background=1e40af&color=fff"
              }
              alt="Avatar"
              className="w-[120px] h-[120px] rounded-full border-[4px] border-blue-400/30 shadow-xl object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=User&background=1e40af&color=fff";
              }}
            />
          </div>

          {/* Name & Title */}
          <h1 className="text-[18px] font-extrabold text-center tracking-tight leading-tight mb-1">
            {info.name || "Ứng viên"}
          </h1>
          {info.title && (
            <p className="text-blue-200 text-[11px] font-medium text-center tracking-wide uppercase mb-6">
              {info.title}
            </p>
          )}

          {/* Contact */}
          <section className="w-full mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3 text-blue-300 border-b border-blue-600/50 pb-1.5">
              Liên hệ
            </h2>
            <div className="space-y-2.5">
              {info.email && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Mail size={12} className="text-blue-300 shrink-0" />
                  <span className="break-all">{info.email}</span>
                </div>
              )}
              {info.phone && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Phone size={12} className="text-blue-300 shrink-0" />
                  <span>{info.phone}</span>
                </div>
              )}
              {info.location && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <MapPin size={12} className="text-blue-300 shrink-0" />
                  <span>{info.location}</span>
                </div>
              )}
              {info.linkedin && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Linkedin size={12} className="text-blue-300 shrink-0" />
                  <span className="break-all">{info.linkedin}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={12} className="text-blue-300" />
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
                  Kỹ năng
                </h2>
              </div>
              <div className="space-y-1.5">
                {skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-[11px] text-blue-100">{skill}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== RIGHT CONTENT (White with Blue section headers) ===== */}
        <div className="w-[65%] py-8 flex flex-col">
          {/* Summary */}
          {info.summary && (
            <section className="mb-5 px-7">
              <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                <User size={14} className="text-blue-700" />
                <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">
                  Giới thiệu
                </h2>
              </div>
              <p className="text-[12px] text-gray-600 leading-relaxed px-1">
                {info.summary}
              </p>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="mb-5 px-7">
              <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                <GraduationCap size={14} className="text-blue-700" />
                <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">
                  Học vấn
                </h2>
              </div>
              <div className="space-y-3 px-1">
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

          {/* Experience */}
          {experience.length > 0 && (
            <section className="mb-5 px-7">
              <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                <Briefcase size={14} className="text-blue-700" />
                <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">
                  Kinh nghiệm Làm việc
                </h2>
              </div>
              <div className="space-y-5 px-1">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[13px] font-bold text-gray-900">
                          {exp.role}
                        </h3>
                        <p className="text-[12px] text-blue-600 font-semibold">
                          {exp.company}
                        </p>
                      </div>
                      {exp.period && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5 font-medium">
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
                            <span className="text-blue-500 mt-1.5 shrink-0">
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

          {/* Projects */}
          {projects.length > 0 && (
            <section className="mb-5 px-7">
              <div className="bg-blue-50 px-4 py-1.5 rounded mb-3 flex items-center gap-2">
                <FolderKanban size={14} className="text-blue-700" />
                <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">
                  Dự án Nổi bật
                </h2>
              </div>
              <div className="space-y-4 px-1">
                {projects.map((proj, i) => (
                  <div key={i}>
                    <h3 className="text-[13px] font-bold text-gray-900">
                      {proj.name}
                    </h3>
                    {proj.description && (
                      <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((tech, j) => (
                          <span
                            key={j}
                            className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="mt-auto px-7 pt-3 border-t border-gray-100">
            <p className="text-center text-[9px] text-gray-400 tracking-widest uppercase">
              Generated by SpeakCV • AI-Powered CV Makeover
            </p>
          </div>
        </div>
      </div>
    );
  },
);

CVBlueModern.displayName = "CVBlueModern";

export default CVBlueModern;
