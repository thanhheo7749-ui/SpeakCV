"use client";
import { useEffect, useState } from "react";
import {
  Mic,
  User,
  Sparkles,
  FileText,
  Settings,
  Flag,
  Lightbulb,
  X,
  LogIn,
  LogOut,
} from "lucide-react";

// Components
import {
  SettingsModal,
  ReportModal,
  ProfileModal,
  GenCVModal,
  ReviewCVModal,
  AuthModal,
} from "@/components/Modals";
import { MicroButton } from "@/components/Interview/MicroButton";
import { ChatBox } from "@/components/Interview/ChatBox";

// API & Hooks
import { endInterview, getHint } from "@/services/api";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useChat } from "@/hooks/useChat";
import { useAudioQueue } from "@/hooks/useAudioQueue";

export default function Home() {
  // --- 1. SETUP STATE & HOOKS ---
  const [modals, setModals] = useState({
    settings: false,
    report: false,
    profile: false,
    cv: false,
    review: false,
    auth: false,
  });
  const toggleModal = (key: string, val: boolean) =>
    setModals((prev) => ({ ...prev, [key]: val }));

  const [user, setUser] = useState<string | null>(null);
  // Check login lúc mới vào
  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUser(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
  };

  const [config, setConfig] = useState({
    jd: "",
    voice: "en-US-AndrewMultilingualNeural",
    mode: "general",
    userProfile: { name: "", email: "", phone: "", skills: "" },
  });

  // Custom Hooks
  const micLang = config.mode === "english" ? "en-US" : "vi-VN";
  const {
    text: userText,
    setText: setUserText,
    temp: tempText,
    isListening,
    toggleMic,
    resetText,
    setIsListening,
  } = useMicrophone(micLang);
  const { isPlaying, playAudio, stopAudio } = useAudioQueue();
  const {
    status,
    setStatus,
    aiText,
    history,
    sendMessage,
    resetChat,
    interrupt: interruptChat,
  } = useChat();

  // State phụ
  const [reportHtml, setReportHtml] = useState("");
  const [hint, setHint] = useState({ show: false, content: "" });

  // --- 2. HANDLERS ---

  // Xử lý khi AI nói xong (đồng bộ trạng thái Audio và Chat)
  // Mẹo: Khi Audio hết playing mà status vẫn là "AI đang nói" -> chuyển về "Sẵn sàng"
  if (!isPlaying && status === "AI đang nói") {
    setStatus("Sẵn sàng");
  }

  const handleSend = () => {
    const input = (userText + " " + tempText).trim();
    if (!input) return;

    resetText(); // Xóa text input
    setIsListening(false); // Tắt mic

    // Gọi hàm send từ useChat, truyền hàm playAudio vào để chạy khi có kết quả
    sendMessage(input, config.jd, config.voice, config.mode, (blob) => {
      playAudio(blob);
    });
  };

  const handleInterrupt = () => {
    interruptChat(); // Ngắt API
    stopAudio(); // Ngắt Loa
    if (isListening) toggleMic(); // Ngắt Mic
    setStatus("Sẵn sàng");
  };

  const onMicClick = () => {
    if (status === "Đang xử lý" || status === "AI đang nói") {
      handleInterrupt();
    } else {
      toggleMic();
      // Chỉ update status hiển thị nếu mic bật
      if (!isListening) setStatus("Đang nghe");
      else setStatus("Sẵn sàng");
    }
  };

  const handleRetry = () => {
    toggleModal("report", false);
    resetChat(); // Reset lịch sử chat
    stopAudio();
  };

  // --- 3. RENDER UI ---
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-5 z-20 shadow-2xl">
        <div className="p-3 bg-blue-600/20 rounded-xl mb-2">
          <Mic className="text-blue-500" size={28} />
        </div>
        <div onClick={() => toggleModal("profile", true)} className="icon-btn">
          <User size={24} />
        </div>
        <div onClick={() => toggleModal("cv", true)} className="icon-btn">
          <Sparkles size={24} />
        </div>
        <div onClick={() => toggleModal("review", true)} className="icon-btn">
          <FileText size={24} />
        </div>
        <div onClick={() => toggleModal("settings", true)} className="icon-btn">
          <Settings size={24} />
        </div>
        <div
          onClick={() => (user ? handleLogout() : toggleModal("auth", true))}
          className="icon-btn mb-4"
          title={user ? "Đăng xuất" : "Đăng nhập"}
        >
          {user ? (
            <LogOut size={24} className="text-red-400" />
          ) : (
            <LogIn size={24} className="text-green-400" />
          )}
        </div>
        <div
          onClick={async () => {
            handleInterrupt();
            toggleModal("report", true);
            const d = await endInterview(history, config.jd);
            setReportHtml(d.report);
          }}
          className="mt-auto mb-6 p-3 bg-red-500/10 rounded-full cursor-pointer"
        >
          <Flag className="text-red-500" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-between py-8 px-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <header className="text-center z-10">
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            SpeakCV
          </h1>
          {user && (
            <div className="absolute top-4 right-6 text-slate-500 text-sm font-bold">
              Xin chào, {user}
            </div>
          )}
        </header>

        <div className="relative group z-10">
          <MicroButton
            status={status}
            onClick={onMicClick}
            langLabel={micLang === "en-US" ? "Tiếng Anh" : "Tiếng Việt"}
          />
          <div className="absolute -right-28 top-0 flex flex-col gap-4">
            <button
              onClick={async () => {
                setHint({ show: true, content: "..." });
                const d = await getHint(aiText, config.jd);
                setHint({ show: true, content: d.hint });
              }}
              className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Lightbulb className="text-yellow-400" />
            </button>
          </div>
        </div>

        {hint.show && (
          <div className="absolute top-[28%] z-50 bg-slate-900/90 p-4 rounded-xl border border-yellow-500/30 max-w-lg animate-in fade-in">
            <button
              onClick={() => setHint({ show: false, content: "" })}
              className="absolute top-2 right-2"
            >
              <X size={16} />
            </button>
            <p>{hint.content}</p>
          </div>
        )}

        <ChatBox
          userText={userText}
          tempText={tempText}
          aiText={aiText}
          status={status}
          onUserTextChange={setUserText}
          onSend={handleSend}
          onClear={resetText}
          onRefresh={() => {
            resetText();
            onMicClick();
          }}
        />
      </main>

      {/* Modals Injection */}
      <SettingsModal
        show={modals.settings}
        onClose={() => toggleModal("settings", false)}
        voice={config.voice}
        setVoice={(v) => setConfig({ ...config, voice: v })}
        mode={config.mode}
        setMode={(m) => setConfig({ ...config, mode: m })}
        jd={config.jd}
        setJd={(j) => setConfig({ ...config, jd: j })}
      />
      <ReportModal
        show={modals.report}
        onClose={() => toggleModal("report", false)}
        result={reportHtml}
        onRetry={handleRetry}
      />
      <ProfileModal
        show={modals.profile}
        onClose={() => toggleModal("profile", false)}
        profile={config.userProfile}
        setProfile={(p: any) => setConfig({ ...config, userProfile: p })}
      />
      <GenCVModal
        show={modals.cv}
        onClose={() => toggleModal("cv", false)}
        userProfile={config.userProfile}
      />
      <ReviewCVModal
        show={modals.review}
        onClose={() => toggleModal("review", false)}
      />
      <AuthModal
        show={modals.auth}
        onClose={() => toggleModal("auth", false)}
        onLoginSuccess={(name: string) => setUser(name)}
      />
    </div>
  );
}
