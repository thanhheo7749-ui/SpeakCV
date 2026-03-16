/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
import { Sidebar } from "@/components/Interview/Sidebar";
import { InterviewLayout } from "@/components/Interview/InterviewLayout";

import { useMicrophone } from "@/hooks/useMicrophone";
import { useChat } from "@/hooks/useChat";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useInterviewState } from "@/hooks/useInterviewState";
import { useInterviewActions } from "@/hooks/useInterviewActions";

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
    onTimeUp: () => actions.handleSend(true),
  });

  const actions = useInterviewActions({
    user,
    config,
    setConfig,
    hasStarted,
    setHasStarted,
    modals,
    toggleModal,
    setIsAdmin,
    interviewHistories,
    setInterviewHistories,
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
  });

  // Load initial data when user changes
  useEffect(() => {
    actions.loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync audio playing with status
  if (!isPlaying && status === "AI đang nói") setStatus("Sẵn sàng");

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
        handleLoadOldInterview={actions.handleLoadOldInterview}
        handleRetry={actions.handleRetry}
        handleOpenReport={actions.handleOpenReport}
        setInterviewHistories={setInterviewHistories}
        currentHistoryId={currentHistoryId}
        handleNewChat={actions.handleNewChat}
        isGeneratingReport={actions.isGeneratingReport}
        onOpenSubscription={() => setShowSubscription(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <InterviewLayout
        config={config}
        setConfig={setConfig}
        hasStarted={hasStarted}
        hint={hint}
        setHint={setHint}
        status={status}
        aiText={aiText}
        userText={userText}
        tempText={tempText}
        isEnglish={isEnglish}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        questionCount={questionCount}
        timeLeft={timeLeft}
        onMicClick={actions.onMicClick}
        onHintClick={actions.handleHintClick}
        onSend={actions.handleSend}
        onUserTextChange={setUserText}
        onClearText={resetText}
        onRefreshMic={() => {
          resetText();
          actions.onMicClick();
        }}
        startTimedInterview={actions.startTimedInterview}
      />

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
        onRetry={actions.handleRetry}
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
        onConfirm={actions.handleConfirmResume}
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
