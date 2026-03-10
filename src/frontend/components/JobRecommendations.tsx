import React, { useEffect, useState } from "react";
import {
  Loader2,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Percent,
} from "lucide-react";
import { matchJobs } from "@/services/api";
import Image from "next/image";

interface JobInfo {
  company: string;
  role: string;
  match_percentage: number;
  reason: string;
  logo_url?: string;
  salary?: string;
}

interface Props {
  file: File;
}

export default function JobRecommendations({ file }: Props) {
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await matchJobs(file);
        if (Array.isArray(result)) {
          setJobs(result);
        } else {
          setError("Invalid format received from server.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load job recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [file]);

  if (loading) {
    return (
      <div className="w-full mt-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
          <div>
            <div className="h-6 w-64 bg-slate-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-40 bg-slate-800/50 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800/70 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-16 bg-slate-800 rounded-xl"></div>
              <div className="h-20 bg-slate-800/60 rounded-xl"></div>
              <div className="h-12 bg-slate-800 rounded-xl mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-900/10 border border-red-500/20 rounded-2xl p-6 mt-6 flex flex-col items-center">
        <p className="text-red-400 text-sm mb-2">
          Đã có lỗi xảy ra khi gợi ý việc làm.
        </p>
        <p className="text-slate-500 text-xs">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Briefcase size={20} className="text-white" />
            </span>
            Top Công Việc Phù Hợp Cho Bạn
          </h3>
          <p className="text-slate-400 text-sm mt-1 ml-11">
            Gợi ý độc quyền dựa trên phân tích chuyên sâu nội dung CV bằng AI.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job, idx) => (
          <div
            key={idx}
            className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 flex flex-col"
          >
            <div className="flex gap-4 mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                {job.logo_url ? (
                  <img
                    src={job.logo_url}
                    alt={job.company}
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : (
                  <Building className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {job.role}
                </h4>
                <div className="flex items-center text-slate-400 text-sm mt-1 gap-2">
                  <Building size={14} className="text-slate-500" />
                  <span className="line-clamp-1">{job.company}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center text-emerald-400 text-sm mt-1 gap-1.5 font-medium">
                    <DollarSign size={14} />
                    {job.salary}
                  </div>
                )}
              </div>
            </div>

            {/* Match Percentage Bar */}
            <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mức độ phù hợp
                </span>
                <span className="text-sm font-bold text-green-400 flex items-center">
                  {job.match_percentage}{" "}
                  <Percent size={12} className="ml-1 opacity-70" />
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${job.match_percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                <span className="font-semibold text-slate-500 block mb-1 text-xs">
                  Phân tích từ AI:
                </span>
                "{job.reason}"
              </p>
            </div>

            <a
              href="#"
              className="mt-5 w-full block text-center py-3 bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-white font-medium rounded-xl transition-all duration-300 transform group-hover:-translate-y-0.5"
              onClick={(e) => {
                e.preventDefault();
                alert("Tính năng ứng tuyển đang được phát triển!");
              }}
            >
              🚀 Ứng tuyển ngay
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
