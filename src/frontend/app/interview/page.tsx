/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, X, Menu } from "lucide-react";
import toast from "react-hot-toast";

import {
  SettingsModal,
  ReportModal,
  GenCVModal,
  ReviewCVModal,
  ResumeConfigModal,
  SubscriptionModal,
  CheckoutModal,
  CVMakeover,
} from "@/components/Modals";
import SupportChatWidget from "@/components/SupportChatWidget";
import { MicroButton } from "@/components/Interview/MicroButton";
import { ChatBox } from "@/components/Interview/ChatBox";
import { Sidebar } from "@/components/Interview/Sidebar";
import { SetupForm } from "@/components/Interview/SetupForm";
import { TimerDisplay } from "@/components/Interview/TimerDisplay";


import {
  endInterview,
  getHint,
  getMyProfile,
  getAdminDashboard,
  getHistory,
} from "@/services/api";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useChat } from "@/hooks/useChat";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useInterviewState } from "@/hooks/useInterviewState";

export default function InterviewRoom() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { upgradeToPro } = useSubscription();
  const [showSubscription, setShowSubscription] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    modals,
    toggleModal,
    config,
    setConfig,
    hasStarted,
    setHasStarted,
    isAdmin,
    setIsAdmin,
    interviewHistories,
    setInterviewHistories,
    myProfileData,
    setMyProfileData,
    reportData,
    setReportData,
    hint,
    setHint,
    currentHistoryId,
    setCurrentHistoryId,
    savedReport,
    setSavedReport,
    pendingResumeData,
    setPendingResumeData,
  } = useInterviewState();

  const isEnglish = config.voice?.startsWith("en-");
  const micLang = isEnglish ? "en-US" : "vi-VN";

  const { isPlaying, playAudio, stopAudio } = useAudioQueue();

  const {
    status,
    setStatus,
    aiText,
    history,
    sendMessage,
    resetChat,
    interrupt: interruptChat,
    loadSession,
  } = useChat();

  const {
    text: userText,
    setText: setUserText,
    temp: tempText,
    isListening,
    toggleMic,
    resetText,
  } = useMicrophone(micLang);

  const handleNewChat = () => {
    handleInterrupt();
    resetChat();
    setReportData(null);
    setCurrentHistoryId(null);
    setSavedReport(null);
    setHasStarted(false);
    resetTimer();
    toast.success("Bắt đầu buổi phỏng vấn mới!");
  };

  const handleSend = async (isTimeout: boolean | React.MouseEvent = false) => {
    // If the event object is passed from onClick, we should treat isTimeout as false
    const timeoutFlag = isTimeout === true;

    let input = (userText + " " + tempText).trim();

    if (timeoutFlag) {
      input =
        "[HỆ THỐNG]: Đã hết thời gian trả lời. Hãy chuyển sang câu hỏi tiếp theo.";
      if (isListening) toggleMic();
    } else {
      if (!input && timeLeft > 0) return;
    }

    if (!user) {
      const guestCount = parseInt(
        localStorage.getItem("guest_msg_count") || "0",
      );
      if (guestCount >= 10) {
        toast.error(
          "Bạn đã dùng hết lượt tương tác miễn phí. Vui lòng đăng nhập để tiếp tục!",
          {
            duration: 5000,
          },
        );
        return;
      }
      localStorage.setItem("guest_msg_count", (guestCount + 1).toString());
    }

    resetText();

    if (savedReport) {
      setSavedReport(null);
    }
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
      advanceQuestion();
    }

    sendMessage(
      input || "Tôi xin lỗi, tôi chưa kịp trả lời câu này.",
      config.jd,
      config.voice,
      config.mode,
      (blob) => playAudio(blob),
    );
  };

  const {
    timeLeft,
    setTimeLeft,
    questionCount,
    setQuestionCount,
    resetTimer,
    advanceQuestion,
  } = useInterviewTimer({
    interviewType: config.interviewType,
    timeLimit: config.timeLimit,
    questionLimit: config.questionLimit,
    hasStarted,
    status,
    onTimeUp: () => handleSend(true),
  });

  useEffect(() => {
    if (user) {
      getMyProfile()
        .then((data) => {
          data.full_name = localStorage.getItem("userName") || data.full_name;
          setMyProfileData(data);
        })
        .catch(() => {});

      getAdminDashboard()
        .then(() => setIsAdmin(true))
        .catch(() => setIsAdmin(false));

      getHistory()
        .then((data) => setInterviewHistories(data.histories || []))
        .catch(() => {});
    } else {
      setIsAdmin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!isPlaying && status === "AI đang nói") setStatus("Sẵn sàng");

  const startTimedInterview = () => {
    setHasStarted(true);
    resetTimer();
    setQuestionCount(1);

    // Set status to indicate AI is processing
    setStatus("Đang xử lý");

    const companyText = config.company ? `tại công ty ${config.company}` : "";
    const prompt = `Tôi ứng tuyển vị trí ${config.position} ${companyText}. Yêu cầu: ${config.jd}. Đóng vai HR chuyên nghiệp, BỎ QUA màn chào hỏi, hãy đặt NGAY MỘT CÂU HỎI ĐẦU TIÊN (xoáy sâu vào tình huống hoặc kỹ năng) để phỏng vấn tôi.`;

    // Send the prompt but the initial aiText update needs to happen inside useChat or here.
    // If useChat doesn't expose setAiText, we can rely on `loadSession` or just `sendMessage` showing the loader.
    // Actually, let's view useChat.ts first.
    sendMessage(prompt, config.jd, config.voice, config.mode, (blob) =>
      playAudio(blob),
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
    )
      handleInterrupt();
    else {
      toggleMic();
      if (!isListening) setStatus("Đang nghe");
      else setStatus("Sẵn sàng");
    }
  };

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleOpenReport = async (isAutoFinish = false) => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);

    if (!isAutoFinish) handleInterrupt();
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục sử dụng tính năng này!", {
        duration: 5000,
        position: "top-center",
      });
      setStatus("Sẵn sàng");
      setIsGeneratingReport(false);
      return;
    }
    toggleModal("report", true);

    if (savedReport) {
      setReportData(savedReport);
      setStatus("Sẵn sàng");
      setIsGeneratingReport(false);
      return;
    }

    const currentHistory = history.trim();
    if (!currentHistory) {
      setReportData(null);
      setIsGeneratingReport(false);
      return;
    }

    try {
      const d = await endInterview(
        currentHistory,
        config.jd,
        config.position,
        currentHistoryId || undefined,
        config.interviewType,
        config.questionLimit,
        config.timeLimit,
      );
      setReportData(d.report);
      if (d.history_id) setCurrentHistoryId(d.history_id);
      setStatus("Sẵn sàng");
      if (user) {
        getHistory().then((data) =>
          setInterviewHistories(data.histories || []),
        );
      }
    } catch (error) {
      console.log("Lỗi chấm điểm", error);
      toast.error("Lỗi khi chấm điểm! Vui lòng thử lại");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRetry = () => {
    toggleModal("report", false);
    resetChat();
    setReportData(null);
    setCurrentHistoryId(null);
    setSavedReport(null);
    stopAudio();
    setHasStarted(false);
    resetTimer();
  };

  const handleLoadOldInterview = (h: any) => {
    if (!h.details || h.details.length === 0) return;

    // Save data temporarily in state for `ResumeConfigModal` to process
    setPendingResumeData(h);
    toggleModal("resumeConfig", true);
  };

  const handleConfirmResume = (resumeSettings: any) => {
    const h = pendingResumeData;
    if (!h) return;

    let rawHistory = "";
    let lastQuestion = "";
    let reconstructedChat: any[] = [];

    h.details.forEach((d: any) => {
      rawHistory += `\nAI: ${d.question}\nỨng viên: ${d.candidate_answer}`;
      lastQuestion = d.question;

      reconstructedChat.push({ role: "assistant", content: d.question });
      if (
        d.candidate_answer &&
        d.candidate_answer !== "Ứng viên chưa trả lời"
      ) {
        reconstructedChat.push({ role: "user", content: d.candidate_answer });
      }
    });

    // Apply new config from Modal
    setConfig({
      ...config,
      position: h.position || "Tự do",
      interviewType: resumeSettings.interviewType,
      questionLimit: resumeSettings.questionLimit,
      timeLimit: resumeSettings.timeLimit,
    });

    setHasStarted(true);
    setCurrentHistoryId(h.id);

    // Cache old report so that if the user clicks "Chấm điểm" without sending any new messages,
    // we bypass the slow scoring API call and simply return the existing history details.
    // If they do send a new message, handleSend will call setSavedReport(null) to force re-evaluation.
    setSavedReport({
      score: h.score,
      overall_feedback: h.overall_feedback,
      details: h.details || [],
      inferred_position: h.position || "Tự do",
    });

    if (resumeSettings.interviewType === "timed") {
      resetTimer();
      setQuestionCount(h.details.length + 1);
    }

    loadSession(
      rawHistory,
      "Chào mừng bạn quay lại. " + lastQuestion,
      reconstructedChat,
    );
    toggleModal("resumeConfig", false);
    setPendingResumeData(null);
    toast.success(
      `Đã khôi phục buổi phỏng vấn vị trí: ${h.position || h.title}`,
    );
  };

  if (isLoading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        Đang tải...
      </div>
    );

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">

      <Sidebar
        user={user}
        myProfileData={myProfileData}
        isAdmin={isAdmin}
        interviewHistories={interviewHistories}
        logout={logout}
        toggleModal={toggleModal}
        handleLoadOldInterview={handleLoadOldInterview}
        handleRetry={handleRetry}
        handleOpenReport={handleOpenReport}
        setInterviewHistories={setInterviewHistories}
        currentHistoryId={currentHistoryId}
        handleNewChat={handleNewChat}
        isGeneratingReport={isGeneratingReport}
        onOpenSubscription={() => setShowSubscription(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col items-center justify-between py-8 px-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`md:hidden absolute top-4 left-4 z-20 p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300 hover:text-white backdrop-blur-sm shadow-lg transition-opacity duration-300 ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <Menu size={20} />
        </button>

        <header className="text-center z-10 flex flex-col items-center">
          <h1
            className="text-6xl font-black italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer"
            onClick={() => router.push("/")}
          >
            SpeakCV
          </h1>

          {config.interviewType === "timed" && hasStarted && (
            <TimerDisplay
              questionCount={questionCount}
              questionLimit={config.questionLimit}
              timeLeft={timeLeft}
            />
          )}
        </header>

        {config.interviewType === "timed" && !hasStarted ? (
          <SetupForm
            config={config}
            setConfig={setConfig}
            onStart={startTimedInterview}
          />
        ) : (
          <>
            <div className="relative group z-10 mt-10 animate-in zoom-in">
              <MicroButton
                status={status}
                onClick={onMicClick}
                langLabel={isEnglish ? "English" : "Tiếng Việt"}
              />
              <div className="absolute right-0 -top-12 md:-right-20 md:top-0 flex flex-col gap-4 z-50">
                <button
                  onClick={async () => {
                    setHint({ show: true, content: "Đang nghĩ..." });
                    try {
                      const d = await getHint(aiText, config.jd);
                      setHint({ show: true, content: d.hint });
                    } catch (error) {
                      setHint({ show: true, content: "Không lấy được gợi ý." });
                      toast.error("Không lấy được gợi ý lúc này");
                    }
                  }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg backdrop-blur-sm"
                >
                  <Lightbulb className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              {hint.show && (
                <div className="hidden md:flex absolute left-full top-0 ml-8 z-50 w-[420px] max-h-[220px] flex-col bg-slate-900/95 p-5 rounded-2xl border border-yellow-500/50 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] backdrop-blur-md animate-in fade-in slide-in-from-left-5 origin-top-left">
                  <button
                    onClick={() => setHint({ show: false, content: "" })}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full p-1.5 hover:bg-slate-700/50 z-10"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-2 mb-3 text-yellow-400 font-semibold uppercase text-xs tracking-wider shrink-0">
                    <Lightbulb size={14} /> Gợi ý từ AI
                  </div>

                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-medium pl-1 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 transition-colors">
                    {hint.content}
                  </div>
                </div>
              )}
            </div>

            <ChatBox
              userText={userText}
              tempText={tempText}
              aiText={aiText}
              status={status}
              onUserTextChange={setUserText}
              onSend={() => handleSend(false)}
              onClear={resetText}
              onRefresh={() => {
                resetText();
                onMicClick();
              }}
            />

            {/* Mobile Hint Modal */}
            {hint.show && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:hidden">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setHint({ show: false, content: "" })}
                />
                <div className="relative w-full max-w-sm max-h-[80vh] flex flex-col bg-slate-900 border border-yellow-500/50 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] rounded-2xl p-5 animate-in zoom-in-95">
                  <button
                    onClick={() => setHint({ show: false, content: "" })}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full p-1.5 hover:bg-slate-700/50 z-10"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-2 mb-3 text-yellow-400 font-semibold uppercase text-xs tracking-wider shrink-0">
                    <Lightbulb size={14} /> Gợi ý từ AI
                  </div>

                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-medium pl-1 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 transition-colors">
                    {hint.content}
                  </div>
                </div>
              </div>
            )}
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
      <CVMakeover
        show={modals.makeover}
        onClose={() => toggleModal("makeover", false)}
        userAvatar={myProfileData?.info?.avatar}
        onEditManually={() => {
          toggleModal("makeover", false);
          toggleModal("cv", true);
        }}
      />
      <ResumeConfigModal
        show={modals.resumeConfig}
        onClose={() => {
          toggleModal("resumeConfig", false);
          setPendingResumeData(null);
        }}
        onConfirm={handleConfirmResume}
        initialConfig={pendingResumeData}
      />
      <SubscriptionModal
        show={showSubscription}
        onClose={() => setShowSubscription(false)}
        onUpgrade={() => {
          setShowSubscription(false);
          setShowCheckout(true);
        }}
      />
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={upgradeToPro}
      />
      <SupportChatWidget />
    </div>
  );
}
