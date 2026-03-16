/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, X, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

import { MicroButton } from "@/components/Interview/MicroButton";
import { ChatBox } from "@/components/Interview/ChatBox";
import { SetupForm } from "@/components/Interview/SetupForm";
import { TimerDisplay } from "@/components/Interview/TimerDisplay";

interface InterviewLayoutProps {
  config: any;
  setConfig: (c: any) => void;
  hasStarted: boolean;
  hint: { show: boolean; content: string };
  setHint: (v: any) => void;
  status: string;
  aiText: string;
  userText: string;
  tempText: string;
  isEnglish: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  questionCount: number;
  timeLeft: number;
  // Actions
  onMicClick: () => void;
  onHintClick: () => void;
  onSend: (isTimeout: boolean | React.MouseEvent) => void;
  onUserTextChange: (text: string) => void;
  onClearText: () => void;
  onRefreshMic: () => void;
  startTimedInterview: () => void;
}

export function InterviewLayout({
  config,
  setConfig,
  hasStarted,
  hint,
  setHint,
  status,
  aiText,
  userText,
  tempText,
  isEnglish,
  isSidebarOpen,
  setIsSidebarOpen,
  questionCount,
  timeLeft,
  onMicClick,
  onHintClick,
  onSend,
  onUserTextChange,
  onClearText,
  onRefreshMic,
  startTimedInterview,
}: InterviewLayoutProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  // Swipe-to-dismiss state for mobile hint modal
  const touchStartY = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setSwipeOffset(delta);
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 80) {
      setHint({ show: false, content: "" });
    }
    setSwipeOffset(0);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-between py-8 px-6 relative bg-theme-secondary">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2.5 bg-theme-surface/80 border border-theme-border rounded-xl text-theme-text-secondary hover:text-yellow-400 backdrop-blur-sm shadow-lg transition-all hover:scale-105"
        aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Mở menu"
        className={`md:hidden absolute top-4 left-4 z-20 p-2 bg-theme-surface/80 border border-theme-border rounded-lg text-theme-text-secondary hover:text-theme-text backdrop-blur-sm shadow-lg transition-opacity duration-300 ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
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
                onClick={onHintClick}
                aria-label="Gợi ý từ AI"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg backdrop-blur-sm"
              >
                <Lightbulb className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            {hint.show && (
              <div className="hidden md:flex absolute left-full top-0 ml-8 z-50 w-[420px] max-h-[220px] flex-col bg-theme-primary/95 p-5 rounded-2xl border border-yellow-500/50 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] backdrop-blur-md animate-in fade-in slide-in-from-left-5 origin-top-left">
                <button
                  onClick={() => setHint({ show: false, content: "" })}
                  aria-label="Đóng gợi ý"
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
            onUserTextChange={onUserTextChange}
            onSend={() => onSend(false)}
            onClear={onClearText}
            onRefresh={onRefreshMic}
          />

          {/* Mobile Hint Modal */}
          {hint.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:hidden" role="dialog" aria-modal="true" aria-label="Gợi ý từ AI">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setHint({ show: false, content: "" })}
              />
              <div
                className="relative w-full max-w-sm max-h-[80vh] flex flex-col bg-theme-primary border border-yellow-500/50 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)] rounded-2xl p-5 animate-in zoom-in-95"
                style={{ transform: `translateY(${swipeOffset}px)`, opacity: swipeOffset > 60 ? 0.5 : 1, transition: swipeOffset === 0 ? 'transform 0.2s, opacity 0.2s' : 'none' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={() => setHint({ show: false, content: "" })}
                  aria-label="Đóng gợi ý"
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
  );
}
