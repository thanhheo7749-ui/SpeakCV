/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useEffect, useState } from "react";
import { getTransactionLogs } from "@/services/api";
import {
  Loader2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";

interface TransactionLog {
  id: number;
  user_email: string;
  user_name: string;
  amount: number;
  transaction_type: string;
  note: string;
  created_at: string;
}

export function TransactionsTab() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionLogs()
      .then((res) => {
        setLogs(res.transactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy transaction logs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-3 text-emerald-500" size={28} />
        Đang tải Lịch sử Giao dịch...
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Receipt className="text-emerald-500" size={32} />
            Transaction Logs
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Biến động số dư Credit của người dùng trên hệ thống
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/80 text-slate-300 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-5">Giao dịch</th>
                <th className="px-6 py-5">Người dùng</th>
                <th className="px-6 py-5">Số Tiền (Credit)</th>
                <th className="px-6 py-5">Thời gian</th>
                <th className="px-6 py-5">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => {
                const isAdd =
                  log.amount > 0 ||
                  log.transaction_type === "add_credits" ||
                  log.transaction_type.startsWith("upgrade_pro");
                let actionName = "Giao dịch khác";
                if (log.transaction_type === "add_credits")
                  actionName = "Nạp Credit Auth";
                else if (log.transaction_type.startsWith("upgrade_pro"))
                  actionName = "Nâng cấp Pro";
                else if (log.transaction_type === "consume_credits")
                  actionName = "Sử dụng Credit";
                else actionName = log.transaction_type;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                            isAdd
                              ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10"
                              : "bg-red-500/20 text-red-400 shadow-red-500/10"
                          }`}
                        >
                          {isAdd ? (
                            <ArrowUpRight size={20} />
                          ) : (
                            <ArrowDownRight size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">
                            {actionName}
                          </div>
                          <div className="text-xs text-slate-500 font-medium font-mono uppercase">
                            #{log.id.toString().padStart(5, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-300">
                            {log.user_name || "GUEST"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-black text-lg ${isAdd ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {isAdd ? "+" : "-"}
                        {log.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {new Date(log.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-slate-400 italic text-sm">
                      {log.note || "Hệ thống cập nhật"}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Chưa có lịch sử giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
