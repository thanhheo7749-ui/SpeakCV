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

// --- TypeScript interfaces matching backend JSON schema ---
export interface CVPersonalInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary?: string;
}

export interface CVExperienceItem {
  company?: string;
  role?: string;
  period?: string;
  achievements?: string[];
}

export interface CVEducationItem {
  school?: string;
  degree?: string;
  period?: string;
}

export interface CVProjectItem {
  name?: string;
  description?: string;
  technologies?: string[];
}

export interface CVData {
  personal_info?: CVPersonalInfo;
  skills?: string[];
  experience?: CVExperienceItem[];
  education?: CVEducationItem[];
  projects?: CVProjectItem[];
}

interface CVProTemplateProps {
  cvData: CVData;
  avatarUrl?: string;
}

const CVProTemplate = forwardRef<HTMLDivElement, CVProTemplateProps>(
  ({ cvData, avatarUrl }, ref) => {
    const info = cvData.personal_info || {};
    const skills = cvData.skills || [];
    const experience = cvData.experience || [];
    const education = cvData.education || [];
    const projects = cvData.projects || [];

    return (
      <div
        ref={ref}
        id="cv-pro-template"
        className="bg-white w-[794px] min-h-[1123px] text-gray-800 shadow-[0_8px_60px_rgba(0,0,0,0.3)] rounded-sm print:block print:overflow-visible print:shadow-none print:rounded-none print:w-full print:min-h-0"
        style={{
          fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 px-10 py-8">
          <div className="flex items-center gap-7">
            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"}
                alt="Avatar"
                className="w-[100px] h-[100px] rounded-full border-[3px] border-white/40 shadow-xl object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=User&background=random";
                }}
              />
            </div>
            {/* Name & Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">
                {info.name || "Ứng viên"}
              </h1>
              {info.title && (
                <p className="text-blue-200 text-base font-medium mt-1 tracking-wide">
                  {info.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== BODY: 2-Column Layout ===== */}
        <div className="grid grid-cols-3 gap-0">
          {/* === MAIN COLUMN (2/3) === */}
          <div className="col-span-2 px-8 py-7 border-r border-gray-100">
            {/* Summary */}
            {info.summary && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-blue-700" />
                  <h2 className="text-[15px] font-bold text-blue-800 uppercase tracking-wider">
                    Giới thiệu
                  </h2>
                </div>
                <div className="w-12 h-[2px] bg-blue-600 mb-3 rounded-full" />
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {info.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={16} className="text-blue-700" />
                  <h2 className="text-[15px] font-bold text-blue-800 uppercase tracking-wider">
                    Kinh nghiệm Làm việc
                  </h2>
                </div>
                <div className="w-12 h-[2px] bg-blue-600 mb-4 rounded-full" />
                <div className="space-y-5">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-[14px] font-bold text-gray-900">
                            {exp.role}
                          </h3>
                          <p className="text-[13px] text-blue-700 font-semibold">
                            {exp.company}
                          </p>
                        </div>
                        {exp.period && (
                          <span className="text-[11px] text-gray-400 whitespace-nowrap mt-0.5 font-medium">
                            {exp.period}
                          </span>
                        )}
                      </div>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((ach, j) => (
                            <li
                              key={j}
                              className="text-[12.5px] text-gray-600 leading-relaxed flex items-start gap-2"
                            >
                              <span className="text-blue-500 mt-1.5 shrink-0">•</span>
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
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban size={16} className="text-blue-700" />
                  <h2 className="text-[15px] font-bold text-blue-800 uppercase tracking-wider">
                    Dự án Nổi bật
                  </h2>
                </div>
                <div className="w-12 h-[2px] bg-blue-600 mb-4 rounded-full" />
                <div className="space-y-4">
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <h3 className="text-[14px] font-bold text-gray-900">
                        {proj.name}
                      </h3>
                      {proj.description && (
                        <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.technologies.map((tech, j) => (
                            <span
                              key={j}
                              className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100"
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

            {/* Education */}
            {education.length > 0 && (
              <section className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={16} className="text-blue-700" />
                  <h2 className="text-[15px] font-bold text-blue-800 uppercase tracking-wider">
                    Học vấn
                  </h2>
                </div>
                <div className="w-12 h-[2px] bg-blue-600 mb-4 rounded-full" />
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-[14px] font-bold text-gray-900">
                            {edu.school}
                          </h3>
                          <p className="text-[12.5px] text-gray-600 mt-0.5">
                            {edu.degree}
                          </p>
                        </div>
                        {edu.period && (
                          <span className="text-[11px] text-gray-400 whitespace-nowrap mt-0.5 font-medium">
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

          {/* === SIDEBAR COLUMN (1/3) === */}
          <div className="col-span-1 bg-slate-50/80 px-6 py-7">
            {/* Contact Info */}
            <section className="mb-7">
              <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider mb-3">
                Liên hệ
              </h2>
              <div className="w-8 h-[2px] bg-blue-600 mb-3 rounded-full" />
              <div className="space-y-2.5">
                {info.email && (
                  <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                    <Mail size={14} className="text-blue-600 shrink-0" />
                    <span className="break-all">{info.email}</span>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                    <Phone size={14} className="text-blue-600 shrink-0" />
                    <span>{info.phone}</span>
                  </div>
                )}
                {info.location && (
                  <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                    <MapPin size={14} className="text-blue-600 shrink-0" />
                    <span>{info.location}</span>
                  </div>
                )}
                {info.linkedin && (
                  <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                    <Linkedin size={14} className="text-blue-600 shrink-0" />
                    <span className="break-all">{info.linkedin}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={14} className="text-blue-700" />
                  <h2 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider">
                    Kỹ năng
                  </h2>
                </div>
                <div className="w-8 h-[2px] bg-blue-600 mb-3 rounded-full" />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-white text-gray-700 px-2.5 py-1 rounded-md font-medium border border-gray-200 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-10 py-3 border-t border-gray-100 bg-slate-50/50">
          <p className="text-center text-[9px] text-gray-400 tracking-widest uppercase">
            Generated by SpeakCV • AI-Powered CV Makeover
          </p>
        </div>
      </div>
    );
  }
);

CVProTemplate.displayName = "CVProTemplate";

export default CVProTemplate;
