/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyStats } from "@/services/api";
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Target,
  ArrowLeft,
  Flame,
  Award,
  Clock,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load Recharts to reduce initial bundle size
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

interface StatsData {
  total_interviews: number;
  avg_score: number;
  best_score: number;
  latest_score: number;
  score_trend: number;
  history: {
    id: number;
    score: number;
    position: string;
    title: string;
    date: string;
    full_date: string;
    interview_type: string;
  }[];
  position_stats: {
    position: string;
    count: number;
    avg_score: number;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    getMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={40} />
      </div>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/interview")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" /> Dashboard
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Chào, {user} 👋
          </h2>
          <p className="text-slate-400 mt-1">
            Đây là thống kê hành trình luyện phỏng vấn của bạn
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="text-blue-400" size={22} />}
            label="Tổng buổi"
            value={stats?.total_interviews || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="text-emerald-400" size={22} />}
            label="Điểm TB"
            value={stats?.avg_score || 0}
            suffix="/10"
            color="emerald"
          />
          <StatCard
            icon={<Trophy className="text-yellow-400" size={22} />}
            label="Điểm cao nhất"
            value={stats?.best_score || 0}
            suffix="/10"
            color="yellow"
          />
          <StatCard
            icon={<Flame className="text-orange-400" size={22} />}
            label="Xu hướng"
            value={`${(stats?.score_trend || 0) > 0 ? "+" : ""}${stats?.score_trend || 0}%`}
            color="orange"
            isText
          />
        </div>

        {/* Score Chart */}
        {stats && stats.history.length > 0 ? (
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Biểu đồ Điểm theo Thời gian
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}/10`, "Điểm"]}
                    labelFormatter={(label: any) => `Ngày: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#60a5fa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-12 text-center">
            <Award size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">
              Chưa có dữ liệu
            </h3>
            <p className="text-slate-500 mt-2">
              Hãy hoàn thành buổi phỏng vấn đầu tiên để xem thống kê!
            </p>
            <button
              onClick={() => router.push("/interview")}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
            >
              Bắt đầu phỏng vấn
            </button>
          </div>
        )}

        {/* Position Stats */}
        {stats && stats.position_stats.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-purple-400" />
              Thống kê theo Vị trí
            </h3>
            <div className="space-y-3">
              {stats.position_stats.map((ps, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">
                        {ps.count}
                      </span>
                    </div>
                    <span className="font-semibold text-white text-sm">
                      {ps.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-xs">
                      {ps.count} buổi
                    </span>
                    <span
                      className={`font-bold text-sm ${scoreColor(ps.avg_score)}`}
                    >
                      {ps.avg_score}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent History */}
        {stats && stats.history.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              Lịch sử Gần đây
            </h3>
            <div className="space-y-2">
              {stats.history
                .slice()
                .reverse()
                .slice(0, 10)
                .map((h, i) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/20 hover:border-slate-600/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          h.interview_type === "pressure"
                            ? "bg-orange-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {h.title}
                        </p>
                        <p className="text-xs text-slate-500">{h.date}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${scoreColor(h.score)}`}
                    >
                      {h.score}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  isText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/60 transition-colors">
      <div className="flex items-center gap-2 mb-3">{icon}
        <span className="text-xs font-bold text-slate-500 uppercase">
          {label}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-white">
        {value}
        {suffix && (
          <span className="text-sm font-normal text-slate-500">{suffix}</span>
        )}
      </p>
    </div>
  );
}
