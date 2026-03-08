/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useState, useRef } from "react";
import { chatWithAI } from "@/services/api"; 
import toast from "react-hot-toast";

export const useChat = () => {
  const [status, setStatus] = useState("Sẵn sàng");
  const [aiText, setAiText] = useState("Chào bạn, tôi là AI Interviewer. Bạn đã sẵn sàng chưa?");
  const [history, setHistory] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const abortCtrl = useRef<AbortController | null>(null);

  const sendMessage = async (
    userText: string, 
    jd: string, 
    voice: string, 
    mode: string,
    onAudioReceived: (blob: Blob) => void 
  ) => {
    if (!userText.trim()) return;

    setStatus("Đang xử lý");
    setHistory(prev => prev + `\nỨng viên: ${userText}`);
    
    const currentChatHistory = [...chatHistory];
    setChatHistory(prev => [...prev, { role: "user", content: userText }]);

    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    try {
      const res = await chatWithAI(userText, jd, voice, mode, currentChatHistory, abortCtrl.current.signal);
      
      if (res.status === 429) {
        toast.error("Bạn đã dùng hết số lượt miễn phí. Vui lòng đăng nhập để tiếp tục!", {
          duration: 5000,
          position: "top-center"
        });
        setStatus("Sẵn sàng");
        return;
      }

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const responseText = decodeURIComponent(res.headers.get("X-AI-Response-Text") || "");
      if (responseText) {
        setAiText(responseText);
        setHistory(prev => prev + `\nAI: ${responseText}`);
        setChatHistory(prev => [...prev, { role: "assistant", content: responseText }]);
      }

      const blob = await res.blob();
      if (blob.size > 0) {
        setStatus("AI đang nói");
        onAudioReceived(blob); 
      } else {
        setStatus("Sẵn sàng");
      }

      // Automatically refresh tokens on successful AI reply
      window.dispatchEvent(new Event("auth-changed"));

    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast.error("Connection error or server overloaded!");
        setStatus("Sẵn sàng");
      }
    }
  };

  const resetChat = () => {
    setHistory("");
    setChatHistory([]);
    setAiText("Bắt đầu lại nhé. Bạn hãy giới thiệu bản thân đi!");
    setStatus("Sẵn sàng");
    if (abortCtrl.current) abortCtrl.current.abort();
  };

  const interrupt = () => {
      if (abortCtrl.current) abortCtrl.current.abort();
      setStatus("Sẵn sàng");
  };

  const loadSession = (historyStr: string, lastQuestion: string, initialChatHistory: any[] = []) => {
    setHistory(historyStr);
    setChatHistory(initialChatHistory);
    setAiText(lastQuestion);
    setStatus("Sẵn sàng");
  };

  return { 
    status, setStatus, aiText, setAiText, history, chatHistory, setChatHistory, sendMessage, resetChat, interrupt, loadSession
  };
};