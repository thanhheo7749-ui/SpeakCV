import { useState } from "react";
import { X, LogIn, UserPlus, Loader2 } from "lucide-react";
import { loginUser, registerUser } from "@/services/api";

export default function AuthModal({ show, onClose, onLoginSuccess }: any) {
  const [isLogin, setIsLogin] = useState(true); // True: Login, False: Register
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await loginUser(formData.email, formData.password);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userName", data.user_name);
        onLoginSuccess(data.user_name);
        onClose();
      } else {
        await registerUser(
          formData.email,
          formData.password,
          formData.fullName,
        );
        alert("Đăng ký thành công! Hãy đăng nhập.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold flex gap-2 text-white">
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </h2>
          <button onClick={onClose}>
            <X className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-slate-500">Họ tên</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500">Email</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Mật khẩu</label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="******"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              <LogIn size={20} />
            ) : (
              <UserPlus size={20} />
            )}
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>

          <p
            className="text-center text-slate-400 text-sm cursor-pointer hover:text-white"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Chưa có tài khoản? Đăng ký ngay"
              : "Đã có tài khoản? Đăng nhập"}
          </p>
        </div>
      </div>
    </div>
  );
}
