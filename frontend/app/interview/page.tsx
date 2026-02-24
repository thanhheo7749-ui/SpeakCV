"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
  Target,
  Play,
  Briefcase,
  History,
} from "lucide-react";

import {
  SettingsModal,
  ReportModal,
  GenCVModal,
  ReviewCVModal,
} from "@/components/Modals";
import { MicroButton } from "@/components/Interview/MicroButton";
import { ChatBox } from "@/components/Interview/ChatBox";

import { endInterview, getHint, getMyProfile } from "@/services/api";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useChat } from "@/hooks/useChat";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { useAuth } from "@/context/AuthContext";
import HistoryModal from "@/components/Modals/HistoryModal";

export default function Home() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [modals, setModals] = useState({
    settings: false,
    report: false,
    cv: false,
    review: false,
    history: false,
  });
  const toggleModal = (key: string, val: boolean) =>
    setModals((prev) => ({ ...prev, [key]: val }));

  // THÊM BIẾN position VÀ company VÀO CONFIG
  const [config, setConfig] = useState<any>({
    position: "", // Vị trí ứng tuyển
    company: "", // Tên công ty
    jd: "", // Mô tả thêm
    voice: "vi-VN-HoaiMyNeural",
    mode: "technical", // Mặc định là technical cho chế độ tính giờ
    userProfile: null,
    interviewType: "free",
    questionLimit: 5,
    timeLimit: 120,
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);

  const [myProfileData, setMyProfileData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [hint, setHint] = useState({ show: false, content: "" });

  useEffect(() => {
    if (user) {
      getMyProfile()
        .then((data) => {
          data.full_name = localStorage.getItem("userName") || data.full_name;
          setMyProfileData(data);
        })
        .catch(() => console.log("Chưa có profile."));
    }
  }, [user]);

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

  useEffect(() => {
    let interval: any;
    if (
      config.interviewType === "timed" &&
      hasStarted &&
      isListening &&
      timeLeft > 0
    ) {
      interval = setInterval(
        () => setTimeLeft((prev: number) => prev - 1),
        1000,
      );
    } else if (timeLeft === 0 && isListening) {
      handleSend();
    }
    return () => clearInterval(interval);
  }, [isListening, timeLeft, config.interviewType, hasStarted]);

  useEffect(() => {
    setTimeLeft(config.timeLimit);
  }, [config.timeLimit]);

  if (!isPlaying && status === "AI đang nói") setStatus("Sẵn sàng");

  // HÀM: BẮT ĐẦU PHỎNG VẤN (Tự động mồi AI bằng Prompt đặc biệt)
  const startTimedInterview = () => {
    if (!config.position.trim()) {
      alert("Vui lòng nhập Vị trí ứng tuyển để AI biết bề hỏi nhé!");
      return;
    }

    setHasStarted(true);
    setQuestionCount(1);
    setTimeLeft(config.timeLimit);

    // Dùng Prompt để ép AI vào thẳng vấn đề, bỏ qua màn chào hỏi vô nghĩa
    const companyText = config.company ? `tại công ty ${config.company}` : "";
    const prompt = `Tôi ứng tuyển vị trí ${config.position} ${companyText}. Yêu cầu: ${config.jd}. Đóng vai HR chuyên nghiệp, BỎ QUA màn chào hỏi, hãy đặt NGAY MỘT CÂU HỎI ĐẦU TIÊN (xoáy sâu vào tình huống hoặc kỹ năng) để phỏng vấn tôi.`;

    sendMessage(prompt, config.jd, config.voice, config.mode, (blob) =>
      playAudio(blob),
    );
  };

  const handleSend = async () => {
    const input = (userText + " " + tempText).trim();
    if (!input && timeLeft > 0) return;

    resetText();
    setIsListening(false);

    if (config.interviewType === "timed") {
      if (questionCount >= config.questionLimit) {
        setStatus("Đang chấm điểm...");
        sendMessage(
          input || "Tôi đã hoàn thành phần trả lời.",
          config.jd,
          config.voice,
          config.mode,
          () => {},
        );
        handleOpenReport(true);
        return;
      }
      setQuestionCount((prev) => prev + 1);
      setTimeLeft(config.timeLimit);
    }

    sendMessage(
      input || "Tôi xin lỗi, tôi chưa kịp trả lời câu này.",
      config.jd,
      config.voice,
      config.mode,
      (blob) => playAudio(blob),
    );
  };

  const handleInterrupt = () => {
    interruptChat();
    stopAudio();
    if (isListening) toggleMic();
    setStatus("Sẵn sàng");
  };

  const onMicClick = () => {
    if (
      status === "Đang xử lý" ||
      status === "AI đang nói" ||
      status === "Đang chấm điểm..."
    ) {
      handleInterrupt();
    } else {
      toggleMic();
      if (!isListening) setStatus("Đang nghe");
      else setStatus("Sẵn sàng");
    }
  };

  const handleOpenReport = async (isAutoFinish = false) => {
    if (!isAutoFinish) handleInterrupt();
    toggleModal("report", true);

    const currentHistory = history.trim();
    if (!currentHistory) {
      setReportData(null);
      return;
    }

    try {
      const d = await endInterview(
        currentHistory,
        config.jdText,
        config.position,
      );
      setReportData(d.report);
      setStatus("Sẵn sàng");
    } catch (error) {
      console.log("Lỗi chấm điểm", error);
    }
  };

  const handleRetry = () => {
    toggleModal("report", false);
    resetChat();
    setReportData(null);
    stopAudio();
    setHasStarted(false);
    setQuestionCount(0);
    setTimeLeft(config.timeLimit);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  const getTimerColor = () => {
    if (timeLeft > 30)
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (timeLeft > 10)
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/50 bg-red-500/20 animate-pulse";
  };

  if (isLoading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        Đang tải...
      </div>
    );

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <nav className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-5 z-20 shadow-2xl">
        <div className="p-3 bg-blue-600/20 rounded-xl mb-2">
          <Mic className="text-blue-500" size={28} />
        </div>
        <div
          onClick={() => router.push("/profile")}
          className="icon-btn hover:text-blue-400 cursor-pointer p-3 rounded-lg hover:bg-slate-800"
          title="Hồ sơ của tôi"
        >
          <User size={24} />
        </div>
        <div
          onClick={() => toggleModal("cv", true)}
          className="icon-btn hover:text-yellow-400 cursor-pointer p-3 rounded-lg hover:bg-slate-800"
          title="Tạo CV"
        >
          <Sparkles size={24} />
        </div>
        <div
          onClick={() => toggleModal("review", true)}
          className="icon-btn hover:text-purple-400 cursor-pointer p-3 rounded-lg hover:bg-slate-800"
          title="Review CV"
        >
          <FileText size={24} />
        </div>
        <div
          onClick={() => toggleModal("history", true)}
          className="icon-btn hover:text-green-400 cursor-pointer p-3 rounded-lg hover:bg-slate-800"
          title="Lịch sử luyện tập"
        >
          <History size={24} />
        </div>
        <div
          onClick={() => toggleModal("settings", true)}
          className="icon-btn hover:text-slate-300 cursor-pointer p-3 rounded-lg hover:bg-slate-800"
          title="Cài đặt AI"
        >
          <Settings size={24} />
        </div>
        <div
          onClick={() => (user ? logout() : router.push("/login"))}
          className="icon-btn mb-4 cursor-pointer p-3 rounded-lg hover:bg-slate-800 mt-auto"
          title={user ? "Đăng xuất" : "Đăng nhập"}
        >
          {user ? (
            <LogOut size={24} className="text-red-400" />
          ) : (
            <LogIn size={24} className="text-emerald-400" />
          )}
        </div>
        <div
          onClick={() => handleOpenReport(false)}
          className="mb-6 p-3 bg-red-500/10 rounded-full cursor-pointer hover:scale-110 transition-transform"
          title="Chấm dứt & Báo cáo"
        >
          <Flag className="text-red-500" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-between py-8 px-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <header className="text-center z-10 flex flex-col items-center">
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            SpeakCV
          </h1>

          {config.interviewType === "timed" && hasStarted ? (
            <div className="mt-4 flex gap-4 items-center animate-in slide-in-from-top-4">
              <div className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-bold flex items-center gap-2 text-slate-300 shadow-lg">
                <Target size={16} className="text-blue-400" /> Câu hỏi:{" "}
                <span className="text-white text-base">
                  {questionCount}/{config.questionLimit}
                </span>
              </div>
              <div
                className={`px-5 py-2 border rounded-full text-base font-bold flex items-center gap-2 shadow-lg transition-colors ${getTimerColor()}`}
              >
                <Clock size={18} /> {formatTime(timeLeft)}
              </div>
            </div>
          ) : (
            user && (
              <div className="mt-2 text-slate-400 font-medium">
                Ứng viên: <span className="text-white font-bold">{user}</span>
              </div>
            )
          )}
        </header>

        {/* KHU VỰC ĐIỀU KHIỂN CHÍNH */}
        {config.interviewType === "timed" && !hasStarted ? (
          // FORM CHUẨN BỊ PHỎNG VẤN
          <div className="mt-8 bg-slate-900/80 p-8 rounded-3xl border border-slate-700 w-full max-w-2xl shadow-2xl animate-in zoom-in flex flex-col gap-5">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <Briefcase className="text-blue-400" /> Thiết Lập Bối Cảnh
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Cung cấp thông tin để AI đưa ra câu hỏi xoáy và sát thực tế nhất
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                  Vị trí ứng tuyển *
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-red-500 outline-none transition-colors"
                  placeholder="VD: Frontend Dev, Kế toán..."
                  value={config.position}
                  onChange={(e) =>
                    setConfig({ ...config, position: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                  Tên Công ty (Tùy chọn)
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-red-500 outline-none transition-colors"
                  placeholder="VD: FPT, VNG..."
                  value={config.company}
                  onChange={(e) =>
                    setConfig({ ...config, company: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Mô tả công việc (JD) hoặc Kỹ năng yêu cầu
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white h-24 custom-scrollbar focus:border-red-500 outline-none transition-colors"
                placeholder="Dán JD hoặc liệt kê kỹ năng vào đây (VD: ReactJS, Typescript, Giao tiếp tốt...)"
                value={config.jd}
                onChange={(e) => setConfig({ ...config, jd: e.target.value })}
              />
            </div>

            <button
              onClick={startTimedInterview}
              className="mt-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-xl text-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play fill="currentColor" size={20} /> VÀO PHỎNG VẤN NGAY!
            </button>
          </div>
        ) : (
          // NẾU ĐÃ BẮT ĐẦU / HOẶC ĐANG CHẾ ĐỘ TỰ DO: HIỆN TOÀN BỘ MICRO, GỢI Ý VÀ CHATBOX
          <>
            <div className="relative group z-10 mt-10 animate-in zoom-in">
              <MicroButton
                status={status}
                onClick={onMicClick}
                langLabel={micLang === "en-US" ? "Tiếng Anh" : "Tiếng Việt"}
              />
              <div className="absolute -right-28 top-0 flex flex-col gap-4">
                <button
                  onClick={async () => {
                    setHint({ show: true, content: "Đang nghĩ..." });
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
              <div className="absolute top-[35%] z-50 bg-slate-900/90 p-4 rounded-xl border border-yellow-500/30 max-w-lg animate-in fade-in">
                <button
                  onClick={() => setHint({ show: false, content: "" })}
                  className="absolute top-2 right-2 hover:text-white text-slate-400"
                >
                  <X size={16} />
                </button>
                <p className="pr-4">{hint.content}</p>
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
          </>
        )}
      </main>

      <SettingsModal
        show={modals.settings}
        onClose={() => toggleModal("settings", false)}
        voice={config.voice}
        setVoice={(v: string) => setConfig({ ...config, voice: v })}
        mode={config.mode}
        setMode={(m: string) => setConfig({ ...config, mode: m })}
        jd={config.jd}
        setJd={(j: string) => setConfig({ ...config, jd: j })}
        interviewType={config.interviewType}
        setInterviewType={(t: string) =>
          setConfig({ ...config, interviewType: t })
        }
        questionLimit={config.questionLimit}
        setQuestionLimit={(l: number) =>
          setConfig({ ...config, questionLimit: l })
        }
        timeLimit={config.timeLimit}
        setTimeLimit={(t: number) => setConfig({ ...config, timeLimit: t })}
      />

      <ReportModal
        show={modals.report}
        onClose={() => toggleModal("report", false)}
        result={reportData}
        hasHistory={history.trim().length > 0}
        onRetry={handleRetry}
      />
      <GenCVModal
        show={modals.cv}
        onClose={() => toggleModal("cv", false)}
        userProfile={myProfileData}
      />
      <ReviewCVModal
        show={modals.review}
        onClose={() => toggleModal("review", false)}
      />
      <HistoryModal
        show={modals.history}
        onClose={() => toggleModal("history", false)}
      />
    </div>
  );
}
