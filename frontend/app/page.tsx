"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mic,
  FileText,
  Target,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleStart = () => {
    if (user) {
      router.push("/interview");
    } else {
      router.push("/login");
    }
  };

  if (isLoading) return <div className="h-screen bg-slate-950"></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mic className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tight text-white">
              Speak<span className="text-blue-400">CV</span>
            </span>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <button
                onClick={() => router.push("/interview")}
                className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                Chào, {user}
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Đăng nhập
              </button>
            )}
            <button
              onClick={handleStart}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-transform active:scale-95 flex items-center gap-2"
            >
              Vào Phòng Phỏng Vấn <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-blue-400 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <Sparkles size={16} /> Công nghệ AI GPT-4o mới nhất
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            Vượt qua mọi kỳ phỏng vấn <br />
            với{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              AI HR Chuyên Nghiệp
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            Trải nghiệm cảm giác phỏng vấn thực tế 1-1 bằng giọng nói. Hệ thống
            sẽ chấm điểm, chỉ ra lỗi sai và gợi ý cách trả lời hoàn hảo nhất để
            bạn tự tin lấy trọn điểm từ nhà tuyển dụng.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Mic size={24} /> Bắt đầu luyện tập miễn phí
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700 transition-all flex items-center justify-center gap-3"
            >
              <FileText size={24} /> Tạo CV
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hệ sinh thái chuẩn bị việc làm toàn diện
            </h2>
            <p className="text-slate-400">
              Không chỉ là phỏng vấn, SpeakCV mang đến cho bạn mọi công cụ cần
              thiết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Phỏng vấn Voice AI
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Tương tác bằng giọng nói thời gian thực. AI có khả năng phân
                tích JD và tùy chỉnh câu hỏi độ khó cao như một HR thực thụ.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Không
                  giới hạn ngành nghề
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Chế độ
                  tính giờ áp lực
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Báo cáo chấm điểm sâu
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Kết thúc phỏng vấn, AI sẽ chấm điểm thang 10, phân tích chi tiết
                từng câu bạn đã nói và đưa ra câu trả lời mẫu hoàn hảo.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Nhận
                  xét thái độ, chuyên môn
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Lưu
                  trữ lịch sử tiến bộ
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-yellow-500/50 transition-colors group">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-yellow-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Trình tạo CV Tự động
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Nhập thông tin một lần, xuất ra CV PDF siêu nét với các mẫu
                thiết kế chuẩn ATS giúp qua vòng hồ sơ dễ dàng.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Gợi ý
                  viết theo chuẩn STAR
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Tích
                  hợp Review CV bằng AI
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2026 SpeakCV. Phát triển cho tương lai nghề nghiệp của bạn.</p>
      </footer>
    </div>
  );
}
