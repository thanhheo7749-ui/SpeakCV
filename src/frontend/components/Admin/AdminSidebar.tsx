/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

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
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/support/active-chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const count = data.reduce(
            (acc: number, chat: any) => acc + chat.unread_count,
            0,
          );
          setUnreadCount(count);
        }
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 shadow-2xl z-40 transition-transform duration-300 absolute inset-y-0 left-0 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button on Mobile */}
        <div
          className={`md:hidden absolute top-1/2 -right-4 -translate-y-1/2 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 border-y border-r border-l-0 border-slate-700 rounded-r-xl text-slate-300 hover:text-white transition-colors shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="mb-10 mt-2 flex items-center gap-2">
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

          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === "support"
                ? "bg-pink-500/20 border border-pink-500/30 text-pink-400 shadow-lg shadow-pink-900/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={20} /> Live Support
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm shadow-red-500/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => router.push("/interview")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-xl font-bold transition-colors mt-auto"
        >
          <ArrowLeft size={18} /> Về Trang Phỏng Vấn
        </button>
      </div>
    </>
  );
}
