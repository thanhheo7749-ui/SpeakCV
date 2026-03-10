/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState } from "react";
import {
  Users,
  Activity,
  Zap,
  Trash2,
  Eye,
  Search,
  Coins,
  PlusCircle,
  Edit,
  X,
  Save,
  Crown,
  Clock,
  FileText,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteUser,
  addUserCredits,
  createUserAsAdmin,
  updateUserAsAdmin,
  getUserDetail,
} from "@/services/api";

export function UsersTab({ users }: { users: any[] }) {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Credit popup control state
  const [creditModalUser, setCreditModalUser] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(100);

  // Add/Edit User Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    credits: 100,
    plan: "free",
  });

  // User Detail Modal state
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailInterviews, setDetailInterviews] = useState<any[]>([]);
  const [detailTransactions, setDetailTransactions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"interviews" | "transactions">(
    "interviews",
  );

  // Filter user list by Name or Email
  const filteredUsers = users?.filter(
    (u: any) =>
      (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  // Handle delete button click
  const handleDelete = async (userId: number, userName: string) => {
    if (
      !window.confirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${userName}" không? Mọi dữ liệu phỏng vấn của người này sẽ bị mất!`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success(`Đã xóa tài khoản ${userName} thành công!`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa!");
    }
  };

  // Execute when "Confirm" button is clicked in the credit popup
  const submitAddCredits = async () => {
    if (!creditModalUser) return;

    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast.error("Vui lòng nhập một con số hợp lệ (lớn hơn 0)!");
      return;
    }

    try {
      await addUserCredits(creditModalUser.id, creditAmount);
      toast.success(
        `Đã nạp thành công ${creditAmount} Credit cho ${creditModalUser.name}!`,
      );
      setCreditModalUser(null); // Close popup
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi nạp Credit!");
    }
  };

  // Handle opening user modal for Add or Edit
  const openUserModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        email: user.email,
        password: "", // Leave blank for edit unless they want to change it
        full_name: user.full_name || "",
        role: user.role || "user",
        credits: user.credits || 0,
        plan: user.plan || "free",
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        email: "",
        password: "",
        full_name: "",
        role: "user",
        credits: 100,
        plan: "free",
      });
    }
    setShowUserModal(true);
  };

  // Handle saving user
  const handleSaveUser = async () => {
    if (!userFormData.email || !userFormData.full_name) {
      toast.error("Vui lòng nhập Email và Họ Tên!");
      return;
    }

    if (!editingUser && !userFormData.password) {
      toast.error("Vui lòng nhập mật khẩu cho người dùng mới!");
      return;
    }

    try {
      if (editingUser) {
        // Update
        await updateUserAsAdmin(editingUser.id, userFormData);
        toast.success(
          `Cập nhật người dùng ${userFormData.full_name} thành công!`,
        );
      } else {
        // Create
        await createUserAsAdmin(userFormData);
        toast.success(
          `Tạo mới người dùng ${userFormData.full_name} thành công!`,
        );
      }
      setShowUserModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu người dùng!");
    }
  };

  // Handle opening user detail modal
  const openDetailModal = async (userId: number) => {
    setDetailLoading(true);
    setDetailTab("interviews");
    try {
      const data = await getUserDetail(userId);
      setDetailUser(data.user);
      setDetailInterviews(data.interviews || []);
      setDetailTransactions(data.transactions || []);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin chi tiết!");
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white">
          Quản lý Tài khoản Ứng viên
        </h2>

        {/* SEARCH BAR & ADD USER BUTTON */}
        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-slate-500 group-focus-within:text-blue-400 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xl"
            />
          </div>
          <button
            onClick={() => openUserModal()}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <PlusCircle size={20} />{" "}
            <span className="hidden md:inline">Thêm Users</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" /> Danh sách người dùng hệ thống
          </h3>
          <span className="text-sm px-3 py-1 bg-slate-800 rounded-lg text-slate-300 font-medium border border-slate-700">
            Tìm thấy:{" "}
            <span className="text-white font-bold">
              {filteredUsers?.length || 0}
            </span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="p-5 border-b border-slate-800">
                  Thông tin User
                </th>
                <th className="p-5 border-b border-slate-800 text-center">
                  Vai trò
                </th>
                <th className="p-5 border-b border-slate-800 text-center">
                  Gói
                </th>
                <th className="p-5 border-b border-slate-800 text-center">
                  Lượt PV
                </th>
                <th className="p-5 border-b border-slate-800 text-center">
                  Số Dư Credit
                </th>
                <th className="p-5 border-b border-slate-800 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    Không tìm thấy người dùng nào khớp với từ khóa "{searchTerm}
                    "
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((u: any) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Column 1: User Info */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {u.full_name
                            ? u.full_name.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-white text-[15px]">
                            {u.full_name || "Chưa cập nhật"}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Role */}
                    <td className="p-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider ${
                          u.role === "admin"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {u.role?.toUpperCase()}
                      </span>
                    </td>

                    {/* Column 3: Plan */}
                    <td className="p-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider ${
                          u.plan === "pro"
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-slate-500/10 border border-slate-500/30 text-slate-400"
                        }`}
                      >
                        {u.plan === "pro" ? "⭐ PRO" : "FREE"}
                      </span>
                    </td>

                    {/* Column 4: Interview count */}
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-300 font-bold">
                        <Activity
                          size={14}
                          className={
                            u.interview_count > 0
                              ? "text-emerald-400"
                              : "text-slate-600"
                          }
                        />
                        {u.interview_count || 0}
                      </div>
                    </td>

                    {/* Column 5: Credits */}
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl w-fit mx-auto shadow-sm">
                        <Coins size={16} className="animate-bounce-slow" />
                        {u.credits !== undefined ? u.credits : 0}
                      </div>
                    </td>

                    {/* Column 6: Action Buttons */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* OPEN CREDIT POPUP BUTTON */}
                        <button
                          onClick={() => {
                            setCreditModalUser({
                              id: u.id,
                              name: u.full_name || "Chưa cập nhật",
                            });
                            setCreditAmount(100);
                          }}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-colors"
                          title="Nạp thêm Credit"
                        >
                          <Zap size={18} />
                        </button>
                        {/* Edit Button */}
                        <button
                          onClick={() => openUserModal(u)}
                          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors"
                          title="Chỉnh sửa người dùng"
                        >
                          <Edit size={18} />
                        </button>
                        {/* View Detail Button */}
                        <button
                          onClick={() => openDetailModal(u.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(u.id, u.full_name)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREDIT POPUP */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Coins className="text-yellow-400" /> Bơm Tiền (Credit)
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Bạn đang nạp credit cho ứng viên{" "}
              <span className="text-white font-bold">
                {creditModalUser.name}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Nhập số lượng Credit muốn nạp:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PlusCircle size={18} className="text-slate-500" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-xl font-black shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCreditModalUser(null)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={submitAddCredits}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-yellow-950 rounded-xl font-black transition-all shadow-lg shadow-yellow-500/20 transform hover:-translate-y-0.5"
                >
                  Xác Nhận Nạp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER ADD/EDIT MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {editingUser ? (
                  <Edit className="text-cyan-400" />
                ) : (
                  <PlusCircle className="text-blue-400" />
                )}
                {editingUser ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng Mới"}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    value={userFormData.full_name}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nguyen Van A"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Mật khẩu{" "}
                    {editingUser && (
                      <span className="text-slate-500 text-xs">
                        (Bỏ trống nếu không muốn đổi)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Vai trò (Role)
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Kế hoạch (Plan)
                  </label>
                  <select
                    value={userFormData.plan}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, plan: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Số Dư Credit
                  </label>
                  <input
                    type="number"
                    value={userFormData.credits}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        credits: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Save size={18} /> Lưu Thông Tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {(detailUser || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            {detailLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setDetailUser(null)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {detailUser?.full_name
                          ? detailUser.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {detailUser?.full_name || "Chưa cập nhật"}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {detailUser?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailUser(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Info Cards */}
                <div className="p-6 border-b border-slate-800 shrink-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                        Vai trò
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          detailUser?.role === "admin"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {detailUser?.role?.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                        Gói đang dùng
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          detailUser?.plan === "pro"
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-slate-600/20 border border-slate-500/30 text-slate-300"
                        }`}
                      >
                        {detailUser?.plan === "pro" ? (
                          <>
                            <Crown size={12} /> PRO
                          </>
                        ) : (
                          "FREE"
                        )}
                      </span>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                        Số Dư Credit
                      </p>
                      <span className="text-yellow-400 font-black text-lg flex items-center justify-center gap-1">
                        <Coins size={16} />
                        {detailUser?.credits ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetailTab("interviews")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        detailTab === "interviews"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <FileText size={16} />
                      Lịch sử phỏng vấn
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          detailTab === "interviews"
                            ? "bg-blue-500/30"
                            : "bg-slate-700"
                        }`}
                      >
                        {detailInterviews.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setDetailTab("transactions")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        detailTab === "transactions"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Coins size={16} />
                      Lịch sử giao dịch
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          detailTab === "transactions"
                            ? "bg-blue-500/30"
                            : "bg-slate-700"
                        }`}
                      >
                        {detailTransactions.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {detailTab === "interviews" && (
                    <div className="space-y-3">
                      {detailInterviews.length === 0 ? (
                        <div className="text-center py-10">
                          <FileText
                            size={40}
                            className="text-slate-600 mx-auto mb-3"
                          />
                          <p className="text-slate-500 font-medium">
                            Chưa có lịch sử phỏng vấn nào
                          </p>
                        </div>
                      ) : (
                        detailInterviews.map((iv: any) => (
                          <div
                            key={iv.id}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:bg-slate-800/60 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-white text-[15px]">
                                  {iv.title || iv.position || "Phỏng vấn"}
                                </p>
                                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                  <Clock size={12} />{" "}
                                  {formatDate(iv.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {iv.interview_type && (
                                  <span
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                      iv.interview_type === "pro"
                                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                        : "bg-slate-600/20 border border-slate-500/30 text-slate-400"
                                    }`}
                                  >
                                    {iv.interview_type}
                                  </span>
                                )}
                                {iv.score !== null &&
                                  iv.score !== undefined && (
                                    <span
                                      className={`px-3 py-1.5 rounded-xl text-sm font-black ${
                                        iv.score >= 7
                                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                          : iv.score >= 5
                                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                                            : "bg-red-500/10 border border-red-500/30 text-red-400"
                                      }`}
                                    >
                                      {iv.score.toFixed(1)}⭐
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {detailTab === "transactions" && (
                    <div className="space-y-3">
                      {detailTransactions.length === 0 ? (
                        <div className="text-center py-10">
                          <Coins
                            size={40}
                            className="text-slate-600 mx-auto mb-3"
                          />
                          <p className="text-slate-500 font-medium">
                            Chưa có lịch sử giao dịch nào
                          </p>
                        </div>
                      ) : (
                        detailTransactions.map((txn: any) => (
                          <div
                            key={txn.id}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:bg-slate-800/60 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-white text-sm">
                                  {txn.transaction_type === "add_credits"
                                    ? "Nạp Credit"
                                    : txn.transaction_type === "consume_credits"
                                      ? "Tiêu Credit"
                                      : txn.transaction_type}
                                </p>
                                {txn.note && (
                                  <p className="text-slate-400 text-xs mt-1">
                                    {txn.note}
                                  </p>
                                )}
                                <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                  <Clock size={12} />{" "}
                                  {formatDate(txn.created_at)}
                                </p>
                              </div>
                              <span
                                className={`font-black text-lg ${
                                  txn.amount > 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {txn.amount > 0 ? "+" : ""}
                                {txn.amount}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
