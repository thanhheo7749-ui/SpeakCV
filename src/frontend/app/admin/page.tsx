/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminDashboard } from "@/services/api";
import { ShieldAlert, ArrowLeft } from "lucide-react";

// Import các file con vừa tạo
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
import { OverviewTab } from "@/components/Admin/OverviewTab";
import { UsersTab } from "@/components/Admin/UsersTab";
import { TemplatesTab } from "@/components/Admin/TemplatesTab";
import { SystemLogsTab } from "@/components/Admin/SystemLogsTab";
import { PromptConfigTab } from "@/components/Admin/PromptConfigTab";
import { TransactionsTab } from "@/components/Admin/TransactionsTab";
import { SupportTab } from "@/components/Admin/SupportTab";

export default function AdminPage() {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    getAdminDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError("Khu vực cấm! Bạn không có quyền truy cập trang Quản trị.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-bold animate-pulse">
        Đang tải dữ liệu hệ thống...
      </div>
    );

  if (error)
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6">
        <ShieldAlert size={80} className="text-red-500 animate-bounce" />
        <h1 className="text-2xl font-bold text-red-400">{error}</h1>
        <button
          onClick={() => router.push("/interview")}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
        >
          <ArrowLeft size={18} className="inline mr-2" /> Quay lại
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans">
      {/* SIDEBAR Component */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* NỘI DUNG Component */}
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {activeTab === "overview" && <OverviewTab stats={data?.stats} />}
        {activeTab === "users" && <UsersTab users={data?.users} />}
        {activeTab === "logs" && <SystemLogsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "config" && <PromptConfigTab />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "support" && <SupportTab />}
      </div>
    </div>
  );
}
