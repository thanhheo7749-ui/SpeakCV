/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState } from "react";
import { LogIn, Loader2, ArrowLeft } from "lucide-react";
import { loginUser, loginGoogle } from "@/services/api";
import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      // Save token to Context
      login(data.access_token, data.user_name, data.role || "user");
      router.push("/interview");
    } catch (err: any) {
      setError(err.message || "Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        const data = await loginGoogle(tokenResponse.access_token);
        login(data.access_token, data.user_name, data.role || "user");
        router.push("/interview");
      } catch (err: any) {
        setError(err.message || "Lỗi đăng nhập qua Google!");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Đăng nhập Google thất bại!");
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors bg-slate-800/50 hover:bg-slate-700 px-4 py-2 rounded-xl"
      >
        <ArrowLeft size={20} /> Thoát ra
      </Link>

      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 p-8 shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Đăng Nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b border-slate-700 flex-grow"></span>
          <span className="text-slate-500 text-xs px-2 uppercase font-semibold">
            Hoặc tiếp tục với
          </span>
          <span className="border-b border-slate-700 flex-grow"></span>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="mt-6 w-full py-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex justify-center items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Google
        </button>

        <p className="text-center text-slate-400 text-sm mt-8">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
