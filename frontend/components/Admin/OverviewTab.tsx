"use client";
import { Users, Mic, Cpu } from "lucide-react";

export function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-white mb-8">
        Bảng Điều Khiển Hệ Thống
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Tổng User */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl flex items-center gap-6 shadow-xl hover:border-blue-500/50 transition-colors">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="text-blue-400" size={32} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
              Tổng Ứng Viên
            </p>
            <h3 className="text-4xl font-black text-white">
              {stats?.total_users || 0}
            </h3>
          </div>
        </div>

        {/* Card 2: Lượt Phỏng vấn */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl flex items-center gap-6 shadow-xl hover:border-emerald-500/50 transition-colors">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Mic className="text-emerald-400" size={32} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
              Lượt Phỏng Vấn
            </p>
            <h3 className="text-4xl font-black text-white">
              {stats?.total_interviews || 0}
            </h3>
          </div>
        </div>

        {/* Card 3: Thống kê Token AI */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl flex items-center gap-6 shadow-xl hover:border-purple-500/50 transition-colors">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Cpu className="text-purple-400" size={32} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
              Token AI Đã Đốt
            </p>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              {(stats?.total_tokens || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
