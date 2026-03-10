/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import PricingSection from "@/components/Landing/PricingSection";
import { CheckoutModal } from "@/components/Modals";
import {
  Mic,
  BarChart,
  FileText,
  Star,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { upgradeToPro } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleStart = () => {
    router.push("/interview");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("#") && href.length > 1) {
      const id = href.substring(1);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950"></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* 1. NAVBAR (Sticky & Glassmorphism) */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Mic className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300">
              Speak<span className="text-blue-500">CV</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a
              href="#features"
              onClick={handleSmoothScroll}
              className="hover:text-white transition-colors"
            >
              Tính năng
            </a>
            <a
              href="#testimonials"
              onClick={handleSmoothScroll}
              className="hover:text-white transition-colors"
            >
              Đánh giá
            </a>
            <a
              href="#pricing"
              onClick={handleSmoothScroll}
              className="hover:text-white transition-colors"
            >
              Bảng giá
            </a>
          </div>

          <div className="flex gap-4 items-center">
            {user ? (
              <button
                onClick={() => router.push("/interview")}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Chào, {user}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Đăng nhập
              </button>
            )}
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center gap-2"
            >
              Bắt đầu <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm font-medium text-cyan-400 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <Sparkles size={16} /> Nền tảng Phỏng vấn giả lập AI hàng đầu
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-8 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100 max-w-5xl">
            Chinh phục kỳ phỏng vấn với{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-cyan-400 to-emerald-400">
              AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            Luyện tập phỏng vấn thực tế, chấm điểm chi tiết tức thì và tạo CV
            chuyên nghiệp tự động. Ngừng nghi ngờ, bắt đầu thành công.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300 w-full sm:w-auto">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Mic size={22} className="text-blue-600" /> Phỏng vấn miễn phí
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-lg border border-slate-700/50 transition-all flex items-center justify-center gap-3 backdrop-blur-md active:scale-95"
            >
              Xem bảng giá
            </button>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 w-full h-full pointer-events-none"></div>
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full"></div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 relative z-10">
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Mic className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">
                        Lập trình viên React Native
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Công ty TechCorp • Chế độ tính giờ
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">
                          AI
                        </span>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm text-sm text-slate-300 border border-slate-700/50">
                        Bạn có thể giải thích điểm khác biệt giữa useMemo và
                        useCallback trong React không?
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          Bạn
                        </span>
                      </div>
                      <div className="bg-blue-600/20 p-4 rounded-2xl rounded-tr-sm text-sm text-blue-100 border border-blue-500/30">
                        Chắc chắn rồi! useMemo được dùng để ghi nhớ giá trị,
                        trong khi useCallback ghi nhớ hàm...
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-64 bg-slate-950/80 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center text-center shrink-0">
                  <p className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">
                    Điểm Phỏng vấn
                  </p>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 mb-2">
                    95<span className="text-2xl text-slate-500">/100</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium mt-2 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={16} /> Câu trả lời xuất sắc
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (Grid of 3 Cards) */}
      <section
        id="features"
        className="py-24 bg-slate-900/30 border-y border-slate-800/50 relative"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              Tại sao chọn SpeakCV?
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
              Mọi thứ bạn cần để tự tin vượt qua kỳ phỏng vấn phần mềm và nhận
              được lời mời làm việc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <Mic className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Phỏng vấn Giọng nói AI thời gian thực
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Nói chuyện tự nhiên với người phỏng vấn AI có độ trễ thấp của
                chúng tôi. Hệ thống lắng nghe, xử lý ngữ cảnh và tự động điều
                chỉnh câu hỏi dựa trên ngành nghề chuyên biệt và các câu trả lời
                trước đó của bạn.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                <BarChart className="text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Phân tích & Chấm điểm Sâu
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Được chấm điểm tức thì về chuyên môn, kỹ năng mềm và kỹ năng
                giao tiếp. Xem lại phản hồi chi tiết, lịch sử trò chuyện và câu
                trả lời mẫu lí tưởng.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                <FileText className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Tạo CV Tự động 1-Chạm
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Tự động biến những câu trả lời xuất sắc của bạn thành một bản CV
                chuyên nghiệp, chuẩn ATS. Chúng tôi trích xuất những kỹ năng và
                kinh nghiệm của bạn để tạo ra file PDF tải liền tay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF / TESTIMONIALS SECTION */}
      <section
        id="testimonials"
        className="py-24 bg-slate-950 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              Được yêu thích bởi hàng ngàn ứng viên
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <p className="text-slate-300 mb-8 italic leading-relaxed text-lg">
                "Tôi đã vô cùng lo lắng trước buổi phỏng vấn React Native đầu
                tiên. Chế độ tính giờ của SpeakCV giúp tôi làm quen với áp lực.
                Phản hồi rất chuẩn xác, và tôi đã nhận được công việc!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
                <div>
                  <h4 className="text-white font-bold">Minh Phạm</h4>
                  <p className="text-slate-500 text-sm">
                    Lập trình viên Frontend tại VNG
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <p className="text-slate-300 mb-8 italic leading-relaxed text-lg">
                "AI đặt những câu hỏi bám sát JD. Ban đầu tôi hơi bất ngờ, nhưng
                việc luyện tập giúp buổi phỏng vấn thực tế tại Shopee trở nên
                thật dễ dàng."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  T
                </div>
                <div>
                  <h4 className="text-white font-bold">Trang Nguyễn</h4>
                  <p className="text-slate-500 text-sm">
                    Chuyên viên Phân tích Dữ liệu tại Shopee
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <p className="text-slate-300 mb-8 italic leading-relaxed text-lg">
                "Điều làm tôi bất ngờ nhất là tính năng tạo CV tự động. Hệ thống
                lấy câu trả lời từ các buổi phỏng vấn giả lập và cấu trúc hoàn
                hảo theo phương pháp STAR. Tiết kiệm cho tôi hàng giờ đồng hồ!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  D
                </div>
                <div>
                  <h4 className="text-white font-bold">Đức Trần</h4>
                  <p className="text-slate-500 text-sm">
                    Kỹ sư Backend tại FPT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <PricingSection onUpgrade={() => setShowCheckout(true)} />

      {/* 6. FINAL CALL TO ACTION & FOOTER */}
      <section className="py-24 relative px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 p-1 md:p-[1px] rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 opacity-20"></div>

          <div className="bg-slate-950 rounded-[2.4rem] p-10 md:p-20 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Sẵn sàng nhận được công việc mơ ước?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Tham gia cùng hàng ngàn lập trình viên đã nâng cấp kỹ năng phỏng
              vấn của họ. Nhận{" "}
              <span className="text-cyan-400 font-bold">100 lượt miễn phí</span>{" "}
              ngay hôm nay.
            </p>
            <button
              onClick={handleStart}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 mx-auto"
            >
              Bắt đầu ngay <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Mic className="text-blue-500" size={20} />
            <span className="text-xl font-black italic tracking-tight text-white">
              Speak<span className="text-blue-500">CV</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">
              Chính sách Bảo mật
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Điều khoản Dịch vụ
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Liên hệ Hỗ trợ
            </a>
          </div>
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} SpeakCV. Đã đăng ký Bản quyền.
          </p>
        </div>
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={upgradeToPro}
      />
    </div>
  );
}
