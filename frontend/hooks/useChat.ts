import { useState, useRef } from "react";
import { chatWithAI } from "@/services/api"; 

export const useChat = () => {
  const [status, setStatus] = useState("Sẵn sàng");
  const [aiText, setAiText] = useState("Chào bạn, tôi là AI Interviewer. Bạn đã sẵn sàng chưa?");
  const [history, setHistory] = useState("");
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

    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    try {
      const res = await chatWithAI(userText, jd, voice, mode, abortCtrl.current.signal);
      
      const responseText = decodeURIComponent(res.headers.get("X-AI-Response-Text") || "");
      if (responseText) {
        setAiText(responseText);
        setHistory(prev => prev + `\nAI: ${responseText}`);
      }

      const blob = await res.blob();
      if (blob.size > 0) {
        setStatus("AI đang nói");
        onAudioReceived(blob); 
      } else {
        setStatus("Sẵn sàng");
      }

    } catch (e: any) {
      if (e.name !== 'AbortError') {
        alert("Lỗi kết nối hoặc Server quá tải!");
        setStatus("Sẵn sàng");
      }
    }
  };

  const resetChat = () => {
    setHistory("");
    setAiText("Bắt đầu lại nhé. Bạn hãy giới thiệu bản thân đi!");
    setStatus("Sẵn sàng");
    if (abortCtrl.current) abortCtrl.current.abort();
  };

  const interrupt = () => {
      if (abortCtrl.current) abortCtrl.current.abort();
      setStatus("Sẵn sàng");
  };

  return { 
    status, setStatus, aiText, history, sendMessage, resetChat, interrupt
  };
};