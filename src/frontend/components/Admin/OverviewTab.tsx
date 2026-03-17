/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { lazy, Suspense } from "react";
import {
  Users,
  Mic,
  Cpu,
  Crown,
  HelpCircle,
  TrendingUp,
  Trophy,
  Clock,
  BarChart3,
} from "lucide-react";

const LazyBarChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.BarChart }))
);
const LazyBar = lazy(() =>
  import("recharts").then((m) => ({ default: m.Bar }))
);
const LazyXAxis = lazy(() =>
  import("recharts").then((m) => ({ default: m.XAxis }))
);
const LazyYAxis = lazy(() =>
  import("recharts").then((m) => ({ default: m.YAxis }))
);
const LazyTooltip = lazy(() =>
  import("recharts").then((m) => ({ default: m.Tooltip }))
);
const LazyResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({ default: m.ResponsiveContainer }))
);
const LazyCartesianGrid = lazy(() =>
  import("recharts").then((m) => ({ default: m.CartesianGrid }))
);

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor, borderColor }: StatCardProps) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border ${borderColor} p-6 rounded-2xl flex items-center gap-5 shadow-xl hover:scale-[1.02] transition-transform`}>
      <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={color} size={28} />
      </div>
      <div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
    </div>
  );
}

export function OverviewTab({ stats }: { stats: any }) {
  const interviewsByDay = stats?.interviews_by_day || [];
  const topUsers = stats?.top_users || [];
  const recentInterviews = stats?.recent_interviews || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
      <h2 className="text-3xl font-bold text-white">
        Bảng Điều Khiển Hệ Thống
      </h2>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Users} label="Tổng Ứng Viên"
          value={stats?.total_users || 0}
          color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-slate-700 hover:border-blue-500/50"
        />
        <StatCard
          icon={Mic} label="Lượt Phỏng Vấn"
          value={stats?.total_interviews || 0}
          color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="border-slate-700 hover:border-emerald-500/50"
        />
        <StatCard
          icon={Cpu} label="AI Tương Tác"
          value={(stats?.total_tokens || 0).toLocaleString()}
          color="text-purple-400" bgColor="bg-purple-500/10" borderColor="border-slate-700 hover:border-purple-500/50"
        />
        <StatCard
          icon={Crown} label="Thành viên Pro"
          value={stats?.pro_users || 0}
          color="text-yellow-400" bgColor="bg-yellow-500/10" borderColor="border-slate-700 hover:border-yellow-500/50"
        />
        <StatCard
          icon={HelpCircle} label="Câu hỏi chờ duyệt"
          value={stats?.pending_questions || 0}
          color="text-orange-400" bgColor="bg-orange-500/10" borderColor="border-slate-700 hover:border-orange-500/50"
        />
      </div>

      {/* Interview Chart */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-blue-400" />
          Lượt phỏng vấn 7 ngày gần đây
        </h3>
        <div className="h-64">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-500">Đang tải biểu đồ...</div>}>
            <LazyResponsiveContainer width="100%" height="100%">
              <LazyBarChart data={interviewsByDay} barSize={36}>
                <LazyCartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <LazyXAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} />
                <LazyYAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} allowDecimals={false} />
                <LazyTooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "12px", color: "#e2e8f0" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value: any) => [`${value} lượt`, "Phỏng vấn"]}
                />
                <LazyBar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </LazyBarChart>
            </LazyResponsiveContainer>
          </Suspense>
        </div>
      </div>

      {/* Two Column: Top Users + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
            <Trophy size={20} className="text-yellow-400" />
            Top Ứng Viên Tích Cực
          </h3>
          {topUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {topUsers.map((u: any, i: number) => (
                <div key={u.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    i === 1 ? "bg-slate-400/20 text-slate-300" :
                    i === 2 ? "bg-amber-700/20 text-amber-500" :
                    "bg-slate-700/50 text-slate-400"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{u.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-blue-400 font-bold text-sm">{u.interview_count}</span>
                    <span className="text-slate-500 text-xs ml-1">PV</span>
                  </div>
                  {u.plan === "pro" && (
                    <Crown size={14} className="text-yellow-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
            <Clock size={20} className="text-emerald-400" />
            Hoạt Động Gần Đây
          </h3>
          {recentInterviews.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {recentInterviews.map((iv: any) => (
                <div key={iv.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{iv.user_name}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">
                        {iv.position || iv.title || "Phỏng vấn"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {iv.score != null && (
                        <span className={`font-bold text-sm ${
                          iv.score >= 8 ? "text-emerald-400" :
                          iv.score >= 5 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {iv.score}/10
                        </span>
                      )}
                      {iv.created_at && (
                        <p className="text-slate-600 text-[10px] mt-0.5">
                          {new Date(iv.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
