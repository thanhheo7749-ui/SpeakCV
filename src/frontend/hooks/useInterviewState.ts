import { useState } from "react";

export function useInterviewState() {
  const [modals, setModals] = useState({
    settings: false,
    report: false,
    cv: false,
    review: false,
    history: false,
    resumeConfig: false,
  });

  const [pendingResumeData, setPendingResumeData] = useState<any>(null);

  const toggleModal = (key: string, val: boolean) =>
    setModals((prev) => ({ ...prev, [key]: val }));

  const [config, setConfig] = useState<any>({
    position: "",
    company: "",
    jd: "",
    voice: "vi-VN-HoaiMyNeural",
    mode: "technical",
    userProfile: null,
    interviewType: "free",
    questionLimit: 5,
    timeLimit: 120,
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [interviewHistories, setInterviewHistories] = useState<any[]>([]);
  const [myProfileData, setMyProfileData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [hint, setHint] = useState({ show: false, content: "" });
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [savedReport, setSavedReport] = useState<any | null>(null);

  return {
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
  };
}
