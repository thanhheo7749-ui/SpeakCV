"use client";
import { useRouter } from "next/navigation";
import {
  Activity,
  Users,
  Briefcase,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  FileClock,
  LayoutDashboard,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl z-10">
      <div className="mb-10 flex items-center gap-2">
        <ShieldCheck className="text-red-500" size={32} />
        <h1 className="text-2xl font-black italic text-white tracking-tight">
          Speak<span className="text-blue-500">CV</span>
        </h1>
      </div>

      <div className="flex-1 space-y-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "overview"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <LayoutDashboard size={20} /> Tổng quan
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "users"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <Users size={20} /> Người dùng
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "logs"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <FileClock size={20} /> System Logs
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <CreditCard size={20} /> Giao Dịch Credit
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "config"
              ? "bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <Activity size={20} /> AI Config
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "templates"
              ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-900/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
          }`}
        >
          <Briefcase size={20} /> Thư viện JD
        </button>
      </div>

      <button
        onClick={() => router.push("/interview")}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-xl font-bold transition-colors mt-auto"
      >
        <ArrowLeft size={18} /> Về Trang Phỏng Vấn
      </button>
    </div>
  );
}
