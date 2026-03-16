/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState } from "react";
import toast from "react-hot-toast";

import {
  endInterview,
  getHint,
  getMyProfile,
  getAdminDashboard,
  getHistory,
  updateInterviewConfig,
} from "@/services/api";

interface UseInterviewActionsParams {
  user: string | null;
  config: any;
  setConfig: (c: any) => void;
  hasStarted: boolean;
  setHasStarted: (v: boolean) => void;
  modals: any;
  toggleModal: (key: string, val: boolean) => void;
  setIsAdmin: (v: boolean) => void;
  interviewHistories: any[];
  setInterviewHistories: (v: any) => void;
  setMyProfileData: (v: any) => void;
  reportData: any;
  setReportData: (v: any) => void;
  hint: any;
  setHint: (v: any) => void;
  currentHistoryId: number | null;
  setCurrentHistoryId: (v: any) => void;
  savedReport: any;
  setSavedReport: (v: any) => void;
  pendingResumeData: any;
  setPendingResumeData: (v: any) => void;
  // From useChat
  status: string;
  setStatus: (v: string) => void;
  aiText: string;
  history: string;
  sendMessage: (text: string, jd: string, voice: string, mode: string, cb: (blob: Blob) => void) => void;
  resetChat: () => void;
  interruptChat: () => void;
  loadSession: (rawHistory: string, lastMsg: string, chat: any[]) => void;
  // From useMicrophone
  userText: string;
  tempText: string;
  isListening: boolean;
  toggleMic: () => void;
  resetText: () => void;
  // From useAudioQueue
  playAudio: (blob: Blob) => void;
  stopAudio: () => void;
  // From useInterviewTimer
  timeLeft: number;
  questionCount: number;
  setQuestionCount: (v: number) => void;
  resetTimer: () => void;
  advanceQuestion: () => void;
}

export function useInterviewActions(params: UseInterviewActionsParams) {
  const {
    user,
    config,
    setConfig,
    hasStarted,
    setHasStarted,
    toggleModal,
    setIsAdmin,
    interviewHistories,
    setInterviewHistories,
    setMyProfileData,
    setReportData,
    setHint,
    currentHistoryId,
    setCurrentHistoryId,
    savedReport,
    setSavedReport,
    pendingResumeData,
    setPendingResumeData,
    status,
    setStatus,
    aiText,
    history,
    sendMessage,
    resetChat,
    interruptChat,
    loadSession,
    userText,
    tempText,
    isListening,
    toggleMic,
    resetText,
    playAudio,
    stopAudio,
    timeLeft,
    questionCount,
    setQuestionCount,
    resetTimer,
    advanceQuestion,
  } = params;

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleInterrupt = () => {
    interruptChat();
    stopAudio();
    if (isListening) toggleMic();
    setStatus("Sẵn sàng");
  };

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

  const startTimedInterview = () => {
    setHasStarted(true);
    resetTimer();
    setQuestionCount(1);
    setStatus("Đang xử lý");

    const companyText = config.company ? `tại công ty ${config.company}` : "";
    const prompt = `Tôi ứng tuyển vị trí ${config.position} ${companyText}. Yêu cầu: ${config.jd}. Đóng vai HR chuyên nghiệp, BỎ QUA màn chào hỏi, hãy đặt NGAY MỘT CÂU HỎI ĐẦU TIÊN (xoáy sâu vào tình huống hoặc kỹ năng) để phỏng vấn tôi.`;

    sendMessage(prompt, config.jd, config.voice, config.mode, (blob) =>
      playAudio(blob),
    );
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

  const handleLoadOldInterview = (h: any) => {
    if (!h.details || h.details.length === 0) return;
    setPendingResumeData(h);
    toggleModal("resumeConfig", true);
  };

  const handleConfirmResume = async (resumeSettings: any) => {
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

    setConfig({
      ...config,
      position: h.position || "Tự do",
      interviewType: resumeSettings.interviewType,
      questionLimit: resumeSettings.questionLimit,
      timeLimit: resumeSettings.timeLimit,
    });

    setHasStarted(true);
    setCurrentHistoryId(h.id);

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

    try {
      await updateInterviewConfig(h.id, {
        interview_type: resumeSettings.interviewType,
        question_limit: resumeSettings.questionLimit,
        time_limit: resumeSettings.timeLimit,
      });
      setInterviewHistories(
        interviewHistories.map((item: any) =>
          item.id === h.id
            ? {
                ...item,
                interview_type: resumeSettings.interviewType,
                question_limit: resumeSettings.questionLimit,
                time_limit: resumeSettings.timeLimit,
              }
            : item,
        ),
      );
    } catch (err) {
      console.warn("Failed to update interview config:", err);
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

  const handleHintClick = async () => {
    setHint({ show: true, content: "Đang nghĩ..." });
    try {
      const d = await getHint(aiText, config.jd);
      setHint({ show: true, content: d.hint });
    } catch (error) {
      setHint({ show: true, content: "Không lấy được gợi ý." });
      toast.error("Không lấy được gợi ý lúc này");
    }
  };

  const loadInitialData = () => {
    if (user) {
      getMyProfile()
        .then((data) => {
          data.full_name = sessionStorage.getItem("userName") || data.full_name;
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
  };

  return {
    isGeneratingReport,
    handleInterrupt,
    handleNewChat,
    handleSend,
    handleOpenReport,
    handleRetry,
    startTimedInterview,
    onMicClick,
    handleLoadOldInterview,
    handleConfirmResume,
    handleHintClick,
    loadInitialData,
  };
}
