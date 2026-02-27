"use client";
import { useState } from "react";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { registerUser } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [ho, setHo] = useState("");
  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fullName = `${ho.trim()} ${ten.trim()}`.trim();

    try {
      await registerUser(email, password, fullName);
      toast.success(
        "Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...",
      );
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Email này đã được sử dụng hoặc có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 p-8 shadow-2xl">
        <button className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors bg-slate-800/50 px-4 py-2 rounded-xl">
          <ArrowLeft size={20} />
          <Link href="/">Thoát</Link>
        </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Tạo Tài Khoản
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TÁCH 2 CỘT HỌ VÀ TÊN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                Họ và đệm
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                value={ho}
                onChange={(e) => setHo(e.target.value)}
                placeholder="VD: Nguyễn Văn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                Tên
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                placeholder="VD: A"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus size={20} />
            )}
            {loading ? "Đang tạo..." : "Đăng Ký Tài Khoản"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
