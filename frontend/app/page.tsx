"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, LayoutGrid, User, Video, Loader2 } from "lucide-react";

export default function Home() {
  const [status, setStatus] = useState("Sẵn sàng");
  const [aiText, setAiText] = useState("");
  const [userText, setUserText] = useState("");
  const recognitionRef = useRef<any>(null);

  // 1. Tách hàm xử lý API ra ngoài để dễ quản lý
  const handleChat = async (text: string) => {
    setStatus("Đang xử lý"); // Cập nhật trạng thái để hiện Spinner
    try {
      console.log(" Đang gửi tin nhắn:", text);

      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_text: text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Lỗi Backend: " + (errorData.detail || "Không rõ nguyên nhân"));
        setStatus("Sẵn sàng");
        return;
      }

      // Xử lý khi thành công
      const aiContent = decodeURIComponent(res.headers.get("X-AI-Response-Text") || "");
      setAiText(aiContent);

      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));

      audio.onplay = () => setStatus("AI đang nói");
      audio.onended = () => setStatus("Sẵn sàng");
      await audio.play();

    } catch (e) {
      console.error("❌ Lỗi Frontend:", e);
      alert("Không kết nối được với Server! Hãy kiểm tra Terminal backend.");
      setStatus("Sẵn sàng");
    }
  };

  // 2. useEffect chỉ lo việc khởi tạo Micro
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "vi-VN";
      rec.continuous = false; 
      rec.interimResults = false;

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setUserText(text); // Hiện chữ người dùng
        
        handleChat(text); 
      };

      rec.onend = () => {
        // Chỉ reset về sẵn sàng nếu không phải đang xử lý API
        setStatus((prev) => prev === "Đang nghe" ? "Sẵn sàng" : prev);
      };
      
      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (status === "Sẵn sàng") {
      setStatus("Đang nghe");
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="main-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <Mic className="sidebar-icon active" size={24} />
        <User className="sidebar-icon" size={24} />
        <LayoutGrid className="sidebar-icon" size={24} />
        <Video className="sidebar-icon" size={24} />
      </nav>

      {/* Main Section */}
      <main className={`content-section ${status === 'Đang nghe' ? 'listening' : ''}`}>
        <header className="header">
          <h1>SpeakCV</h1>
          <p>Interview AI v1.1</p>
        </header>

        <div className="micro-zone">
          <div className="glow-effect"></div>
          <button className="micro-button" onClick={startListening}>
            <span className="status-label">{status}</span>
            {status === "Đang xử lý" ? (
              <Loader2 className="spinner animate-spin" size={48} color="#3b82f6" />
            ) : (
              <Mic className="micro-icon" size={48} color="white" />
            )}
          </button>
        </div>

        <div className="message-grid">
          <div className="message-box">
            <span className="box-label user-label">Ứng viên nói</span>
            <p className="message-text">"{userText || "Đang đợi âm thanh..."}"</p>
          </div>
          <div className="message-box ai">
            <span className="box-label ai-label">AI Phản hồi</span>
            <p className="message-text">{aiText || "..."}</p>
          </div>
        </div>
      </main>
    </div>
  );
}