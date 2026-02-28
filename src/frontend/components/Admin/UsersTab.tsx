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
} from "lucide-react";
import toast from "react-hot-toast";
import { deleteUser, addUserCredits } from "@/services/api";

export function UsersTab({ users }: { users: any[] }) {
  // 🌟 State tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // 🌟 State điều khiển Popup nạp Credit
  const [creditModalUser, setCreditModalUser] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(100);

  // Lọc danh sách người dùng theo Tên hoặc Email
  const filteredUsers = users?.filter(
    (u: any) =>
      (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  // Hàm xử lý khi bấm nút Xóa
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

  // Hàm thực thi khi bấm nút "Xác Nhận Nạp" trong Popup
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
      setCreditModalUser(null); // Đóng popup
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi nạp Credit!");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white">
          Quản lý Tài khoản Ứng viên
        </h2>

        {/* 🌟 THANH TÌM KIẾM */}
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
                  <td colSpan={5} className="p-10 text-center text-slate-500">
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
                    {/* Cột 1: Thông tin User */}
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

                    {/* Cột 2: Vai trò */}
                    <td className="p-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider ${
                          u.role === "admin"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    {/* Cột 3: Lượt phỏng vấn */}
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

                    {/* Cột 4: Token tiêu thụ / Credit */}
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl w-fit mx-auto shadow-sm">
                        <Coins size={16} className="animate-bounce-slow" />
                        {u.credits !== undefined ? u.credits : 0}
                      </div>
                    </td>

                    {/* Cột 5: Nút Thao tác */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* NÚT MỞ POPUP BƠM CREDIT */}
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
                          <PlusCircle size={18} />
                        </button>
                        {/* Nút Xem (Demo) */}
                        <button
                          onClick={() =>
                            toast(
                              "Tính năng xem chi tiết đang được phát triển!",
                              { icon: "🚧" },
                            )
                          }
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {/* Nút Xóa */}
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

      {/* ======================================================= */}
      {/* 🌟 POPUP NẠP CREDIT VIP 🌟 */}
      {/* ======================================================= */}
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
    </div>
  );
}
