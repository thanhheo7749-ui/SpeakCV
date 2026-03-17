/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Flag,
  PlusCircle,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  User,
  Sparkles,
  LogOut,
  LogIn,
  MoreHorizontal,
  MoreVertical,
  Edit2,
  Edit3,
  Trash2,
  Check,
  Briefcase,
  Sun,
  Moon,
  CreditCard,
  ShieldCheck,
  FileText,
  Wand2,
  Calendar,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

import { renameInterview, deleteInterview } from "@/services/api";
import toast from "react-hot-toast";
import { useSubscription } from "@/context/SubscriptionContext";

interface SidebarProps {
  user: any;
  myProfileData: any;
  isAdmin: boolean;
  interviewHistories: any[];
  logout: () => void;
  toggleModal: (key: string, val: boolean) => void;
  handleLoadOldInterview: (h: any) => void;
  handleRetry: () => void;
  handleOpenReport: (isAutoFinish?: boolean) => void;
  setInterviewHistories: (val: any) => void;
  currentHistoryId?: number | null;
  handleNewChat: () => void;
  isGeneratingReport?: boolean;
  onOpenSubscription?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  user,
  myProfileData,
  isAdmin,
  interviewHistories,
  logout,
  toggleModal,
  handleLoadOldInterview,
  handleRetry,
  handleOpenReport,
  setInterviewHistories,
  currentHistoryId,
  isGeneratingReport,
  onOpenSubscription,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { tokens, plan } = useSubscription();
  const { theme, toggleTheme } = useTheme();

  const handleRename = async (id: number) => {
    if (!editTitle.trim()) return;
    // Optimistic: update UI immediately
    const previousHistories = [...interviewHistories];
    const newHistories = interviewHistories.map((h) =>
      h.id === id
        ? {
            ...h,
            title: editTitle,
            position: editTitle.replace("Phỏng vấn ", ""),
          }
        : h,
    );
    setInterviewHistories(newHistories);
    setEditingId(null);
    toast.success("Đổi tên thành công!");

    try {
      await renameInterview(id, editTitle);
    } catch {
      // Rollback on failure
      setInterviewHistories(previousHistories);
      toast.error("Lỗi khi đổi tên! Đã khôi phục lại.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch sử này?")) return;
    // Optimistic: remove item immediately
    const previousHistories = [...interviewHistories];
    const newHistories = interviewHistories.filter((h) => h.id !== id);
    setInterviewHistories(newHistories);
    toast.success("Xóa thành công!");
    if (currentHistoryId === id) {
      handleRetry();
    }

    try {
      await deleteInterview(id);
    } catch {
      // Rollback on failure
      setInterviewHistories(previousHistories);
      toast.error("Lỗi khi xóa! Đã khôi phục lại.");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <nav
        className={`w-72 bg-theme-primary border-r border-theme-border flex flex-col z-40 shadow-2xl transition-transform duration-300 absolute inset-y-0 left-0 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button on Mobile */}
        <div
          className={`md:hidden absolute top-1/2 -right-4 -translate-y-1/2 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <button
            onClick={onClose}
            className="p-1.5 bg-theme-surface border-y border-r border-l-0 border-theme-border rounded-r-xl text-theme-text-secondary hover:text-theme-text transition-colors shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* 1. AVATAR & USER MENU SECTION */}
        <div className="p-4 border-b border-theme-border relative z-50">
          {user ? (
            <div>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 cursor-pointer hover:bg-theme-surface p-2 rounded-xl transition-colors border border-transparent hover:border-theme-border"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shrink-0 border border-slate-600">
                  {myProfileData?.info?.avatar || myProfileData?.avatar ? (
                    <img
                      src={myProfileData?.info?.avatar || myProfileData?.avatar}
                      alt={`Ảnh đại diện của ${myProfileData?.full_name || "người dùng"}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const name = encodeURIComponent(
                          myProfileData?.full_name || "User",
                        );
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
                      }}
                    />
                  ) : (
                    <User className="text-white" size={20} />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-theme-text font-bold text-sm truncate">
                    {myProfileData?.full_name || user}
                  </p>
                  <div className="flex text-[11px] items-center gap-1 mt-0.5 font-medium text-theme-text-secondary">
                    <Sparkles size={10} className="text-yellow-400" />
                    <span>
                      Lượt tương tác:{" "}
                      <span className="text-yellow-400 font-bold">
                        {tokens}
                      </span>{" "}
                      {plan === "pro" && "(Pro)"}
                    </span>
                  </div>
                </div>
                {showUserMenu ? (
                  <ChevronUp size={16} className="text-theme-text-secondary" />
                ) : (
                  <ChevronDown size={16} className="text-theme-text-secondary" />
                )}
              </div>

              {/* Dropdown User */}
              {showUserMenu && (
                <div className="absolute top-[105%] left-4 right-4 bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-2 animate-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-border hover:text-theme-accent rounded-lg flex items-center gap-3"
                  >
                    <User size={16} /> Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSubscription) onOpenSubscription();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-border hover:text-cyan-400 rounded-lg flex items-center gap-3"
                  >
                    <CreditCard size={16} /> Gói cước của tôi
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        router.push("/admin");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-theme-border rounded-lg flex items-center gap-3"
                    >
                      <ShieldCheck size={16} /> Trang Quản Trị
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-theme-border rounded-lg flex items-center gap-3 mt-1"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <LogIn size={18} /> Đăng nhập / Đăng ký
            </button>
          )}
        </div>

        {/* 2. TOOLS COMBO BOX */}
        <div className="p-4 border-b border-theme-border">
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="w-full flex items-center justify-between p-3 bg-theme-primary border border-theme-border hover:border-theme-text-secondary rounded-xl text-theme-text font-bold transition-colors"
          >
            <span className="flex items-center gap-2 text-sm">
              <Briefcase size={18} className="text-yellow-500" /> Công cụ
            </span>
            {showToolsMenu ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>

          {showToolsMenu && (
            <div className="mt-2 space-y-1 bg-theme-primary/50 p-2 border border-theme-border rounded-xl animate-in fade-in">
              <button
                onClick={() => toggleModal("cv", true)}
                className="w-full text-left px-3 py-2.5 text-sm text-theme-text-secondary hover:bg-theme-surface hover:text-yellow-400 rounded-lg flex items-center gap-3"
              >
                <Sparkles size={16} /> Tạo CV (Demo)
              </button>
              <button
                id="tour-step-cv"
                onClick={() => toggleModal("review", true)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-purple-400 rounded-lg flex items-center gap-3"
              >
                <FileText size={16} /> Chấm điểm CV
              </button>
              <button
                onClick={() => toggleModal("makeover", true)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-pink-400 rounded-lg flex items-center gap-3"
              >
                <Wand2 size={16} /> Chỉnh sửa CV
              </button>
              {user && (
                <>
                  <div className="border-t border-theme-border/50 my-1" />
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-blue-400 rounded-lg flex items-center gap-3"
                  >
                    <BarChart3 size={16} /> Thống kê cá nhân
                  </button>
                  <button
                    onClick={() => router.push("/questions")}
                    className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded-lg flex items-center gap-3"
                  >
                    <HelpCircle size={16} /> Ngân hàng câu hỏi
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. INTERVIEW HISTORY SECTION */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="flex justify-between items-center sticky top-0 bg-theme-primary px-4 pt-4 pb-3 z-10 border-b border-theme-border/50">
            <h3 className="text-xs font-black text-theme-muted uppercase tracking-widest">
              Lịch sử Luyện tập
            </h3>
            <button
              onClick={handleRetry}
              className="text-blue-400 hover:text-white p-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="Bắt đầu bài phỏng vấn mới"
            >
              <PlusCircle size={16} />
            </button>
          </div>

          {user ? (
            interviewHistories.length > 0 ? (
              <div className="space-y-1 px-4 pt-3 pb-10">
                {(() => {
                  // Group histories by date category
                  const groups: { label: string; items: any[] }[] = [];
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const yesterday = new Date(today.getTime() - 86400000);
                  const weekAgo = new Date(today.getTime() - 7 * 86400000);

                  const todayItems: any[] = [];
                  const yesterdayItems: any[] = [];
                  const weekItems: any[] = [];
                  const olderItems: any[] = [];

                  interviewHistories.forEach((h: any) => {
                    const d = new Date(h.created_at);
                    if (d >= today) todayItems.push(h);
                    else if (d >= yesterday) yesterdayItems.push(h);
                    else if (d >= weekAgo) weekItems.push(h);
                    else olderItems.push(h);
                  });

                  if (todayItems.length) groups.push({ label: "Hôm nay", items: todayItems });
                  if (yesterdayItems.length) groups.push({ label: "Hôm qua", items: yesterdayItems });
                  if (weekItems.length) groups.push({ label: "Tuần trước", items: weekItems });
                  if (olderItems.length) groups.push({ label: "Cũ hơn", items: olderItems });

                  return groups.map((group) => (
                    <div key={group.label} className="mb-3">
                      <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest px-1 py-2">
                        {group.label}
                      </p>
                      <div className="space-y-2">
                        {group.items.map((h: any, i: number) => (
                  <div
                    key={h.id || i}
                    onClick={() => handleLoadOldInterview(h)}
                    className={`p-3 bg-theme-primary border rounded-xl transition-all group relative cursor-pointer ${
                      currentHistoryId === h.id
                        ? "border-blue-500 bg-theme-surface/80 ring-1 ring-blue-500/30"
                        : "border-theme-border/40 hover:border-blue-500/50 hover:bg-theme-surface/50"
                    }`}
                  >
                    {/* Top row: Title + Score + Menu */}
                    <div className="flex items-start gap-2">
                      {editingId === h.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(h.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(h.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="flex-1 bg-theme-secondary text-theme-text text-sm px-2 py-1 rounded outline-none border border-blue-500 cursor-text"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="font-bold text-sm truncate flex-1 text-theme-text group-hover:text-blue-400 transition-colors leading-snug"
                          title={h.title || h.position}
                        >
                          {h.title || h.position || "Phỏng vấn mới"}
                        </span>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[11px] font-black px-1.5 py-0.5 rounded-md leading-none ${
                            h.score >= 8
                              ? "bg-emerald-500/20 text-emerald-400"
                              : h.score >= 5
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {h.score}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === h.id ? null : h.id);
                          }}
                          className="text-theme-muted hover:text-theme-text p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom row: Mode badge + Date + Action */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-theme-text-secondary">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] truncate max-w-[90px] transition-all duration-300 ${
                            h.interview_type === "timed"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-theme-surface/80 text-theme-text-secondary border border-theme-border/50"
                          }`}
                        >
                          {h.interview_type === "timed" ? "⚡ Áp lực" : "Tự do"}
                        </span>
                        <span className="text-theme-muted">•</span>
                        <span>
                          {new Date(h.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold transition-opacity ${
                          currentHistoryId === h.id
                            ? "text-emerald-400 opacity-100"
                            : "text-blue-400 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {currentHistoryId === h.id ? "Đang mở ●" : "Tiếp tục →"}
                      </span>
                    </div>

                    {/* Context menu */}
                    {openMenuId === h.id && (
                      <div
                        className="absolute right-2 top-10 bg-theme-surface border border-theme-border rounded-lg shadow-xl z-50 py-1 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditTitle(
                              h.title || h.position || "Phỏng vấn tự do",
                            );
                            setEditingId(h.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-theme-text hover:bg-theme-border flex items-center gap-2"
                        >
                          <Edit2 size={12} /> Đổi tên
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(h.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-theme-border flex items-center gap-2"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center text-theme-muted text-sm mt-10 italic">
                Chưa có lịch sử nào.
                <br />
                Hãy bắt đầu bài test đầu tiên!
              </div>
            )
          ) : (
            <div className="text-center text-slate-600 text-sm mt-10">
              <LockIcon className="mx-auto mb-2 opacity-50" size={24} />
              Đăng nhập để lưu lịch sử
            </div>
          )}
        </div>

        {/* 4. SETTINGS & END SESSION (Bottom) */}
        <div className="p-4 border-t border-theme-border flex gap-2 bg-theme-primary/90 backdrop-blur-md">
          <button
            onClick={() => toggleModal("settings", true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-theme-surface hover:bg-theme-border text-theme-text-secondary hover:text-theme-text rounded-xl transition-colors font-bold text-sm"
            aria-label="Cài đặt"
          >
            <Settings size={18} /> Cài đặt
          </button>

          <button
            onClick={() => handleOpenReport(false)}
            disabled={isGeneratingReport}
            className={`w-12 flex flex-shrink-0 items-center justify-center p-3 rounded-xl transition-all ${isGeneratingReport ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"}`}
            title="Kết thúc & Chấm điểm"
            aria-label="Kết thúc và chấm điểm"
          >
            {isGeneratingReport ? (
              <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
            ) : (
              <Flag size={18} />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

const LockIcon = ({ size, className }: any) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
