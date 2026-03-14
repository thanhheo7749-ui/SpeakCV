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
  Wrench,
} from "lucide-react";
import type { CVData } from "./CVProTemplate";

interface CVTealSidebarProps {
  cvData: CVData;
  avatarUrl?: string;
}

const CVTealSidebar = forwardRef<HTMLDivElement, CVTealSidebarProps>(
  ({ cvData, avatarUrl }, ref) => {
    const info = cvData.personal_info || {};
    const skills = cvData.skills || [];
    const experience = cvData.experience || [];
    const education = cvData.education || [];
    const projects = cvData.projects || [];

    return (
      <div
        ref={ref}
        id="cv-teal-sidebar"
        className="bg-white w-[794px] min-h-[1123px] flex text-gray-800 shadow-[0_8px_60px_rgba(0,0,0,0.3)] rounded-sm print:block print:overflow-visible print:shadow-none print:rounded-none print:w-full print:min-h-0"
        style={{
          fontFamily:
            "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* ===== LEFT SIDEBAR (Teal) ===== */}
        <div className="w-[35%] bg-teal-700 text-white px-6 py-8 flex flex-col items-center print:bg-teal-700">
          {/* Avatar */}
          <div className="mb-6">
            <img
              src={
                avatarUrl ||
                "https://ui-avatars.com/api/?name=User&background=0d9488&color=fff"
              }
              alt="Avatar"
              className="w-[110px] h-[110px] rounded-full border-[3px] border-white/30 shadow-xl object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=User&background=0d9488&color=fff";
              }}
            />
          </div>

          {/* Name & Title */}
          <h1 className="text-[20px] font-extrabold text-center tracking-tight leading-tight mb-1">
            {info.name || "Ứng viên"}
          </h1>
          {info.title && (
            <p className="text-teal-200 text-[12px] font-medium text-center tracking-wide mb-6">
              {info.title}
            </p>
          )}

          {/* Contact */}
          <section className="w-full mb-6">
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3 text-teal-200 border-b border-teal-500/50 pb-1.5">
              Liên hệ
            </h2>
            <div className="space-y-2.5">
              {info.email && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Mail size={13} className="text-teal-300 shrink-0" />
                  <span className="break-all">{info.email}</span>
                </div>
              )}
              {info.phone && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Phone size={13} className="text-teal-300 shrink-0" />
                  <span>{info.phone}</span>
                </div>
              )}
              {info.location && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <MapPin size={13} className="text-teal-300 shrink-0" />
                  <span>{info.location}</span>
                </div>
              )}
              {info.linkedin && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Linkedin size={13} className="text-teal-300 shrink-0" />
                  <span className="break-all">{info.linkedin}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section className="w-full mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={13} className="text-teal-300" />
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-teal-200">
                  Kỹ năng
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-teal-600/60 text-white px-2.5 py-1 rounded-md font-medium border border-teal-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={13} className="text-teal-300" />
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-teal-200">
                  Học vấn
                </h2>
              </div>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="text-[12px] font-bold text-white">
                      {edu.school}
                    </h3>
                    <p className="text-[11px] text-teal-200 mt-0.5">
                      {edu.degree}
                    </p>
                    {edu.period && (
                      <p className="text-[10px] text-teal-300/70 italic mt-0.5">
                        {edu.period}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== RIGHT CONTENT (White) ===== */}
        <div className="w-[65%] px-8 py-8">
          {/* Summary */}
          {info.summary && (
            <section className="mb-6">
              <h2 className="text-[14px] font-bold text-teal-700 uppercase tracking-wider mb-2">
                Giới thiệu
              </h2>
              <div className="w-10 h-[2px] bg-teal-600 mb-3 rounded-full" />
              <p className="text-[12.5px] text-gray-600 leading-relaxed">
                {info.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={15} className="text-teal-700" />
                <h2 className="text-[14px] font-bold text-teal-700 uppercase tracking-wider">
                  Kinh nghiệm Làm việc
                </h2>
              </div>
              <div className="w-10 h-[2px] bg-teal-600 mb-4 rounded-full" />
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[13px] font-bold text-gray-900">
                          {exp.role}
                        </h3>
                        <p className="text-[12px] text-teal-600 font-semibold">
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
                            <span className="text-teal-500 mt-1.5 shrink-0">
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
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban size={15} className="text-teal-700" />
                <h2 className="text-[14px] font-bold text-teal-700 uppercase tracking-wider">
                  Dự án Nổi bật
                </h2>
              </div>
              <div className="w-10 h-[2px] bg-teal-600 mb-4 rounded-full" />
              <div className="space-y-4">
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
                            className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium border border-teal-100"
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
        </div>
      </div>
    );
  },
);

CVTealSidebar.displayName = "CVTealSidebar";

export default CVTealSidebar;
