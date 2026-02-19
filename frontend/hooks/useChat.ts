import { useState, useRef } from "react";
import { chatWithAI } from "@/services/api"; // Đảm bảo đã import đúng

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
    onAudioReceived: (blob: Blob) => void // Callback để phát âm thanh
  ) => {
    if (!userText.trim()) return;

    // Cập nhật trạng thái
    setStatus("Đang xử lý");
    setHistory(prev => prev + `\nỨng viên: ${userText}`);

    // Hủy request cũ nếu có
    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    try {
      const res = await chatWithAI(userText, jd, voice, mode, abortCtrl.current.signal);
      
      // Lấy text phản hồi
      const responseText = decodeURIComponent(res.headers.get("X-AI-Response-Text") || "");
      if (responseText) {
        setAiText(responseText);
        setHistory(prev => prev + `\nAI: ${responseText}`);
      }

      // Lấy audio blob
      const blob = await res.blob();
      if (blob.size > 0) {
        setStatus("AI đang nói");
        onAudioReceived(blob); // Gọi hook Audio để phát
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
    setAiText("Bắt đầu lại nhé!");
    setStatus("Sẵn sàng");
    if (abortCtrl.current) abortCtrl.current.abort();
  };

  const interrupt = () => {
      if (abortCtrl.current) abortCtrl.current.abort();
      setStatus("Sẵn sàng");
  };

  return { 
    status, 
    setStatus, 
    aiText, 
    history, 
    sendMessage, 
    resetChat,
    interrupt
  };
};