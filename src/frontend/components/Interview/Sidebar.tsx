/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
  LogOut,
  LogIn,
  Sparkles,
  FileText,
  ShieldCheck,
  PlusCircle,
  Calendar,
  Settings,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  CreditCard,
} from "lucide-react";

import { renameInterview, deleteInterview } from "@/services/api";
import toast from "react-hot-toast";

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
}: SidebarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleRename = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      await renameInterview(id, editTitle);
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
    } catch {
      toast.error("Lỗi khi đổi tên!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch sử này?")) return;
    try {
      await deleteInterview(id);
      const newHistories = interviewHistories.filter((h) => h.id !== id);
      setInterviewHistories(newHistories);
      toast.success("Xóa thành công!");
      if (currentHistoryId === id) {
        handleRetry();
      }
    } catch {
      toast.error("Lỗi khi xóa!");
    }
  };

  return (
    <nav className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl transition-all relative">
      {/* 1. KHU VỰC AVATAR & MENU USER */}
      <div className="p-4 border-b border-slate-800 relative z-50">
        {user ? (
          <div>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shrink-0 border border-slate-600">
                {myProfileData?.avatar ? (
                  <img
                    src={myProfileData.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-white" size={20} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white font-bold text-sm truncate">
                  {myProfileData?.full_name || user}
                </p>
              </div>
              {showUserMenu ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </div>

            {/* Dropdown User */}
            {showUserMenu && (
              <div className="absolute top-[105%] left-4 right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 animate-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg flex items-center gap-3"
                >
                  <User size={16} /> Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    if (onOpenSubscription) onOpenSubscription();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-cyan-400 rounded-lg flex items-center gap-3"
                >
                  <CreditCard size={16} /> Gói cước của tôi
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg flex items-center gap-3 mt-1"
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

      {/* 2. COMBO BOX CÔNG CỤ */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={() => setShowToolsMenu(!showToolsMenu)}
          className="w-full flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-xl text-white font-bold transition-colors"
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
          <div className="mt-2 space-y-1 bg-slate-950/50 p-2 border border-slate-800 rounded-xl animate-in fade-in">
            <button
              onClick={() => toggleModal("cv", true)}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-yellow-400 rounded-lg flex items-center gap-3"
            >
              <Sparkles size={16} /> Tạo CV (Demo)
            </button>
            <button
              onClick={() => toggleModal("review", true)}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-purple-400 rounded-lg flex items-center gap-3"
            >
              <FileText size={16} /> Chấm điểm CV
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-slate-800 rounded-lg flex items-center gap-3"
              >
                <ShieldCheck size={16} /> Trang Quản Trị
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. KHU VỰC HIỂN THỊ LỊCH SỬ PHỎNG VẤN */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900 pb-2 z-10 border-b border-slate-800/50">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Lịch sử Luyện tập
          </h3>
          <button
            onClick={handleRetry}
            className="text-blue-400 hover:text-white p-1 bg-blue-500/10 rounded-md hover:bg-blue-500/20 transition-colors"
            title="Bắt đầu bài phỏng vấn mới"
          >
            <PlusCircle size={16} />
          </button>
        </div>

        {user ? (
          interviewHistories.length > 0 ? (
            <div className="space-y-3 pb-10">
              {interviewHistories.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 bg-slate-950 border rounded-xl transition-all group relative ${currentHistoryId === h.id ? "border-blue-500 bg-slate-800/80" : "border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50"}`}
                >
                  <div
                    className="flex justify-between items-start mb-2"
                    onClick={() => handleLoadOldInterview(h)}
                  >
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
                        className="w-full bg-slate-900 text-white text-sm px-2 py-1 rounded outline-none border border-blue-500 cursor-text mr-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className="flex flex-col text-left flex-1 overflow-hidden"
                        title={h.title || h.position}
                      >
                        {/* Main Title: Big and bold */}
                        <span className="font-bold text-[15px] truncate w-full text-white cursor-pointer group-hover:text-blue-400 transition-colors">
                          {h.title || h.position || "Phỏng vấn mới"}
                        </span>

                        {/* Subtitle: Small and gray, showing mode and date */}
                        <div className="flex items-center text-[10px] text-slate-400 mt-1 cursor-pointer">
                          <span className="truncate max-w-[100px] mr-1.5 font-medium border-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded-sm">
                            Chế độ: {h.mode || "Tự do"}
                          </span>
                          <span>
                            •{" "}
                            {new Date(h.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${h.score >= 8 ? "bg-emerald-500/20 text-emerald-400" : h.score >= 5 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {h.score}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === h.id ? null : h.id);
                        }}
                        className="text-slate-500 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>

                  {openMenuId === h.id && (
                    <div
                      className="absolute right-2 top-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 w-32"
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
                        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Edit2 size={12} /> Đổi tên
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(h.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Trash2 size={12} /> Xóa
                      </button>
                    </div>
                  )}

                  <div
                    className="flex justify-end items-center cursor-pointer mt-1"
                    onClick={() => handleLoadOldInterview(h)}
                  >
                    <p className="text-[10px] uppercase font-bold text-blue-500/80 group-hover:opacity-100 opacity-0 transition-opacity relative z-10">
                      {currentHistoryId === h.id
                        ? "Đang mở 🟢"
                        : "Tiếp tục ngay 🚀"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-600 text-sm mt-10 italic">
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

      {/* 4. CÀI ĐẶT & CHẤM DỨT (Dưới cùng) */}
      <div className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/90 backdrop-blur-md">
        <button
          onClick={() => toggleModal("settings", true)}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-bold text-sm"
        >
          <Settings size={18} /> Cài đặt
        </button>
        <button
          onClick={() => handleOpenReport(false)}
          disabled={isGeneratingReport}
          className={`w-12 flex flex-shrink-0 items-center justify-center p-3 rounded-xl transition-all ${isGeneratingReport ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"}`}
          title="Kết thúc & Chấm điểm"
        >
          {isGeneratingReport ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
          ) : (
            <Flag size={18} />
          )}
        </button>
      </div>
    </nav>
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
