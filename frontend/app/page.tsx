"use client";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Loader2,
  FileText,
  Upload,
  X,
  Settings,
  Check,
  User,
  Sparkles,
  PenTool,
  Flag,
  BarChart3,
  Volume2,
  Lightbulb,
  Send,
  RefreshCcw,
  Eraser,
  StopCircle,
  Award,
} from "lucide-react";

// --- COMPONENT SÓNG ÂM ---
const AudioWave = ({ state }: { state: string }) => {
  if (state === "idle")
    return <Mic size={48} className="text-white opacity-80" />;
  const barColor = state === "listening" ? "bg-red-500" : "bg-blue-500";
  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-full ${barColor} animate-pulse`}
          style={{ height: "100%", animationDuration: `${0.4 + i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
};

export default function Home() {
  // --- STATE CHÍNH ---
  const [status, setStatus] = useState("Sẵn sàng");
  const [aiText, setAiText] = useState(
    "Chào bạn, tôi là AI Interviewer. Bạn đã sẵn sàng chưa?",
  );
  const [userText, setUserText] = useState("");
  const [tempText, setTempText] = useState("");

  // MODALS
  const [showCvModal, setShowCvModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // DATA
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
  });
  const [targetCompany, setTargetCompany] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvResult, setCvResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- SETTINGS ---
  const [jdText, setJdText] = useState("");
  // ĐỔI MẶC ĐỊNH SANG ANDREW (MIỄN PHÍ & ỔN ĐỊNH)
  const [selectedVoice, setSelectedVoice] = useState(
    "en-US-AndrewMultilingualNeural",
  );
  const [interviewMode, setInterviewMode] = useState("general");

  // --- GENERATOR ---
  const [genPosition, setGenPosition] = useState("");
  const [genCompany, setGenCompany] = useState("");
  const [generatedCV, setGeneratedCV] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- HISTORY & HINT ---
  const [chatHistory, setChatHistory] = useState("");
  const [reportResult, setReportResult] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintContent, setHintContent] = useState("");
  const [isHinting, setIsHinting] = useState(false);

  // --- REFS ---
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 1. API CHAT (LOGIC ỔN ĐỊNH)
  // ==========================================
  const handleChat = async () => {
    const finalInput = (userText + " " + tempText).trim();
    if (!finalInput) return;

    setStatus("Đang xử lý");
    setHintContent("");
    setShowHint(false);
    setTempText("");

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const newHistory = chatHistory + `\nỨng viên: ${finalInput}`;
    setChatHistory(newHistory);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_text: finalInput,
          jd_text: jdText,
          voice_id: selectedVoice,
          mode: interviewMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Lỗi Server");

      const aiResponse = decodeURIComponent(
        res.headers.get("X-AI-Response-Text") || "",
      );
      setAiText(aiResponse);
      setChatHistory(newHistory + `\nAI: ${aiResponse}`);
      setUserText("");

      // Xử lý Audio Blob
      const blob = await res.blob();
      if (blob.size > 0) {
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch((e) => console.log("Play error:", e));
          setStatus("AI đang nói");
          audioRef.current.onended = () => setStatus("Sẵn sàng");
        }
      } else {
        setStatus("Sẵn sàng");
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        alert("Lỗi kết nối!");
        setStatus("Sẵn sàng");
      }
    }
  };

  // ==========================================
  // 2. MICROPHONE (ĐA NGÔN NGỮ)
  // ==========================================
  useEffect(() => {
    // Logic tự động chọn ngôn ngữ nghe
    // Nếu chọn mode English hoặc giọng Andrew -> Nghe tiếng Anh (en-US)
    // Còn lại -> Nghe tiếng Việt (vi-VN)
    const langCode =
      interviewMode === "english" || selectedVoice.startsWith("en-")
        ? "en-US"
        : "vi-VN";
    console.log("Micro setting:", langCode);

    audioRef.current = new Audio();
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = langCode;
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e: any) => {
        let final = "";
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (interim) setTempText(interim);
        if (final) {
          setTempText("");
          setUserText((p) => (p + " " + final).trim());
        }
      };

      // Reset Mic nếu đổi chế độ
      if (recognitionRef.current)
        try {
          recognitionRef.current.stop();
        } catch {}
      recognitionRef.current = rec;
    }

    const saved = localStorage.getItem("userProfile");
    if (saved) setUserProfile(JSON.parse(saved));
  }, [interviewMode, selectedVoice]); // Chạy lại khi đổi giọng/chế độ

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (status === "Đang xử lý" || status === "AI đang nói") {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      recognitionRef.current.stop();
      setStatus("Sẵn sàng");
      return;
    }
    if (status === "Sẵn sàng") {
      recognitionRef.current.start();
      setStatus("Đang nghe");
    } else if (status === "Đang nghe") {
      recognitionRef.current.stop();
      setStatus("Sẵn sàng");
    }
  };

  const handleClear = () => {
    setUserText("");
    setTempText("");
    if (status === "Đang nghe") {
      recognitionRef.current.stop();
      setStatus("Sẵn sàng");
    }
  };

  // --- API PHỤ ---
  const handleEndInterview = async () => {
    if (!chatHistory) return alert("Bạn chưa phỏng vấn câu nào cả!");
    if (status === "Đang nghe" || status === "AI đang nói") toggleListening();
    setShowReportModal(true);
    setReportResult("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/end-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: chatHistory, jd_text: jdText }),
      });
      const data = await res.json();
      setReportResult(data.report);
    } catch {
      setReportResult("<p class='text-red-500'>Lỗi khi chấm điểm.</p>");
    }
  };

  const handleGetHint = async () => {
    if (!aiText) return;
    setIsHinting(true);
    setShowHint(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_question: aiText, jd_text: jdText }),
      });
      const data = await res.json();
      setHintContent(data.hint);
    } catch {
    } finally {
      setIsHinting(false);
    }
  };
  const handleAnalyzeCV = async () => {
    if (!cvFile) return;
    setIsAnalyzing(true);
    const fd = new FormData();
    fd.append("file", cvFile);
    fd.append("company", targetCompany);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/review-cv", {
        method: "POST",
        body: fd,
      });
      const d = await res.json();
      setCvResult(d.review);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleGenerateCV = async () => {
    if (!genPosition) return;
    setIsGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_info: JSON.stringify(userProfile),
          position: genPosition,
          company: genCompany,
        }),
      });
      const d = await res.json();
      setGeneratedCV(d.content);
    } catch {
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* SIDEBAR */}
      <nav className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-5 z-20 shadow-2xl">
        <div className="p-3 bg-blue-600/20 rounded-xl mb-2">
          <Mic className="text-blue-500" size={28} />
        </div>
        <div
          onClick={() => setShowProfileModal(true)}
          className="icon-btn"
          title="Hồ sơ"
        >
          <User size={24} className="text-slate-400 hover:text-pink-400" />
        </div>
        <div
          onClick={() => setShowGenModal(true)}
          className="icon-btn"
          title="Tạo CV"
        >
          <Sparkles
            size={24}
            className="text-slate-400 hover:text-yellow-400"
          />
        </div>
        <div
          onClick={() => setShowCvModal(true)}
          className="icon-btn"
          title="Review CV"
        >
          <FileText size={24} className="text-slate-400 hover:text-blue-400" />
        </div>
        <div
          onClick={() => setShowSettingsModal(true)}
          className="icon-btn"
          title="Cài đặt"
        >
          <Settings
            size={24}
            className="text-slate-400 hover:text-emerald-400"
          />
        </div>
        <div
          onClick={handleEndInterview}
          className="mt-auto mb-6 group cursor-pointer p-3 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-all"
          title="Kết thúc"
        >
          <Flag size={24} className="text-red-500 animate-pulse" />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-between py-8 px-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <header className="text-center z-10 space-y-2">
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
            SpeakCV
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-500 text-[10px] tracking-[0.2em] uppercase font-bold">
              MODE:
            </span>
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 ${interviewMode === "general" ? "bg-slate-800" : "bg-blue-900/50 text-blue-300"}`}
            >
              {interviewMode.toUpperCase()}
            </span>
          </div>
        </header>

        {/* MICRO ZONE */}
        <div className="relative group z-10 flex items-center gap-10">
          <div className="relative">
            <div
              className={`absolute -inset-8 rounded-full blur-3xl transition-opacity duration-500 ${status === "Đang nghe" ? "opacity-100 bg-red-500/20" : status === "Đang xử lý" || status === "AI đang nói" ? "opacity-100 bg-yellow-500/20" : "opacity-20 bg-blue-500/20"}`}
            ></div>
            <button
              onClick={toggleListening}
              className={`w-52 h-52 rounded-full bg-slate-900/80 backdrop-blur-sm border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl relative z-10 hover:scale-105 active:scale-95 ${status === "Đang nghe" ? "border-red-500 shadow-red-900/40" : status === "Đang xử lý" || status === "AI đang nói" ? "border-yellow-500 shadow-yellow-900/40" : "border-slate-700 hover:border-blue-500 shadow-blue-900/20"}`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors ${status === "Đang nghe" ? "text-red-400 animate-pulse" : "text-blue-400"}`}
              >
                {status === "Đang xử lý" || status === "AI đang nói"
                  ? "BẤM ĐỂ DỪNG"
                  : status}
              </span>
              {status === "Đang xử lý" || status === "AI đang nói" ? (
                <StopCircle
                  className="animate-pulse text-yellow-500"
                  size={56}
                />
              ) : status === "Đang nghe" ? (
                <AudioWave state="listening" />
              ) : (
                <AudioWave state="idle" />
              )}
            </button>
            {/* Hiển thị ngôn ngữ đang nghe */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${selectedVoice.startsWith("en-") || interviewMode === "english" ? "border-orange-500 text-orange-400 bg-orange-500/10" : "border-emerald-500 text-emerald-400 bg-emerald-500/10"}`}
              >
                Mic:{" "}
                {selectedVoice.startsWith("en-") || interviewMode === "english"
                  ? "Tiếng Anh"
                  : "Tiếng Việt"}
              </span>
            </div>
          </div>
          <div className="absolute -right-28 flex flex-col gap-4">
            <button
              onClick={handleGetHint}
              className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center hover:bg-yellow-500/20 transition-all hover:scale-110 group"
              title="Gợi ý"
            >
              <Lightbulb
                size={24}
                className="text-yellow-400 group-hover:text-yellow-300"
              />
            </button>
            <button
              onClick={handleEndInterview}
              className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-all hover:scale-110 group"
              title="Kết thúc"
            >
              <Award
                size={24}
                className="text-red-400 group-hover:text-red-300"
              />
            </button>
          </div>
        </div>

        {/* HINT POPUP */}
        {showHint && (
          <div className="absolute top-[28%] z-50 w-full max-w-xl animate-in fade-in">
            <div className="bg-slate-900/95 border border-yellow-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative">
              <button
                onClick={() => setShowHint(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
              <h3 className="text-yellow-400 font-bold mb-3">Gợi ý từ AI:</h3>
              <div className="text-slate-200 text-sm whitespace-pre-line">
                {isHinting ? "..." : hintContent}
              </div>
            </div>
          </div>
        )}

        {/* CHAT BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl h-72 z-10">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 backdrop-blur-md shadow-xl flex flex-col hover:border-blue-500/20 transition-colors relative">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                Ứng viên (Bạn)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400"
                >
                  <Eraser size={16} />
                </button>
                <button
                  onClick={() => {
                    setUserText("");
                    toggleListening();
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-950/30 rounded-xl border border-slate-700/50 overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <textarea
                className="w-full h-full bg-transparent p-4 outline-none resize-none text-slate-300 text-lg leading-relaxed custom-scrollbar"
                placeholder="Nói hoặc gõ câu trả lời..."
                value={userText + (tempText ? " " + tempText : "")}
                onChange={(e) => {
                  setUserText(e.target.value);
                  setTempText("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
              />
              <button
                onClick={handleChat}
                disabled={(!userText && !tempText) || status === "Đang xử lý"}
                className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/80 to-blue-950/20 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              AI Phản hồi
            </span>
            <p className="text-xl text-slate-200 leading-relaxed overflow-y-auto custom-scrollbar flex-1">
              {aiText}
            </p>
          </div>
        </div>
      </main>

      {/* --- CÁC MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-700 p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Cấu hình</h2>
              <button onClick={() => setShowSettingsModal(false)}>
                <X />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">
                  Chế độ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "general", name: "Chung" },
                    { id: "behavioral", name: "Hành vi" },
                    { id: "technical", name: "Kỹ thuật" },
                    { id: "english", name: "Tiếng Anh" },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setInterviewMode(m.id)}
                      className={`p-4 border rounded-xl cursor-pointer font-bold ${interviewMode === m.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700"}`}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
              {/* CHỈ CÒN GIỌNG EDGE TTS - BỎ OPENAI */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">
                  Giọng
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() =>
                      setSelectedVoice("en-US-AndrewMultilingualNeural")
                    }
                    className={`p-4 border rounded-xl cursor-pointer ${selectedVoice.includes("Andrew") ? "border-orange-500 bg-orange-500/10" : "border-slate-700"}`}
                  >
                    Andrew (Việt Kiều)
                  </div>
                  <div
                    onClick={() => setSelectedVoice("vi-VN-NamMinhNeural")}
                    className={`p-4 border rounded-xl cursor-pointer ${selectedVoice.includes("NamMinh") ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700"}`}
                  >
                    Nam Minh (Việt)
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">
                  JD
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white"
                  rows={3}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Nhập JD..."
                />
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-4 bg-emerald-600 rounded-xl font-bold"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CÁC MODAL KHÁC GIỮ NGUYÊN (CV, REPORT, PROFILE...) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white flex gap-3">
                <Award className="text-pink-500" /> KẾT QUẢ
              </h2>
              <button onClick={() => setShowReportModal(false)}>
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!reportResult ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-pink-500" size={48} />
                  <p className="text-slate-400">AI đang chấm điểm...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: reportResult }} />
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setChatHistory("");
                        setReportResult("");
                        setShowReportModal(false);
                        setStatus("Sẵn sàng");
                        setAiText("Bắt đầu lại nhé!");
                      }}
                      className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl"
                    >
                      Phỏng vấn lại
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-3 bg-pink-600 rounded-xl font-bold"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Hồ sơ</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tên</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mt-1"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">
                  Kỹ năng
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mt-1 h-24"
                  value={userProfile.skills}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, skills: e.target.value })
                  }
                />
              </div>
              <button
                onClick={() => {
                  localStorage.setItem(
                    "userProfile",
                    JSON.stringify(userProfile),
                  );
                  setShowProfileModal(false);
                }}
                className="w-full py-3 bg-pink-600 rounded-xl font-bold mt-4"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col p-8">
            <div className="flex justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Tạo CV</h2>
              <button onClick={() => setShowGenModal(false)}>
                <X />
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <input
                className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl"
                value={genPosition}
                onChange={(e) => setGenPosition(e.target.value)}
                placeholder="Vị trí"
              />
              <input
                className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl"
                value={genCompany}
                onChange={(e) => setGenCompany(e.target.value)}
                placeholder="Công ty"
              />
              <button
                onClick={handleGenerateCV}
                disabled={isGenerating}
                className="bg-yellow-600 px-6 rounded-xl font-bold flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <PenTool />
                )}{" "}
                Tạo
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-800 rounded-2xl p-6 border border-slate-700">
              {generatedCV ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedCV }}
                />
              ) : (
                <p className="text-center text-slate-500 mt-20">
                  Nhập thông tin để tạo CV.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {showCvModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl border border-slate-700 flex flex-col p-8">
            <div className="flex justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Review CV</h2>
              <button onClick={() => setShowCvModal(false)}>
                <X />
              </button>
            </div>
            {!cvResult ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <input
                  className="w-96 bg-slate-800 border border-slate-700 p-4 rounded-xl"
                  placeholder="Công ty"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                />
                <div className="relative cursor-pointer w-96 h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center">
                  <input
                    type="file"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="text-blue-500 mb-2" />
                  <p className="text-slate-400">
                    {cvFile ? cvFile.name : "Upload CV"}
                  </p>
                </div>
                <button
                  onClick={handleAnalyzeCV}
                  disabled={isAnalyzing}
                  className="w-96 py-4 bg-blue-600 rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check />
                  )}{" "}
                  Review
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: cvResult }}
                />
                <button
                  onClick={() => setCvResult("")}
                  className="mt-6 text-slate-400 underline"
                >
                  Làm lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
