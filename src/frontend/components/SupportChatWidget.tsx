"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMessage {
  id: number;
  user_id: number;
  admin_id: number | null;
  message: string;
  sender_type: "user" | "admin";
  is_read: boolean;
  created_at: string;
}

export default function SupportChatWidget() {
  const { token, role } = useAuth();
  const { plan } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT = 3;

  useEffect(() => {
    isOpenRef.current = isOpen;
    // Only fetch profile and connect WS if the chat is opened and user is pro
    if (isOpen && token && plan === "pro") {
      reconnectAttempts.current = 0;
      fetchUserIdAndConnect();
    }

    // Cleanup WebSocket when widget is closed
    if (!isOpen && ws.current) {
      ws.current.onclose = null; // prevent reconnect
      ws.current.close();
      ws.current = null;
    }
  }, [isOpen, token, plan]);

  useEffect(() => {
    // Auto scroll down when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // If the user is an admin, they should use the /admin/support page instead
  if (role === "admin") return null;

  const fetchUserIdAndConnect = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      // Get user ID from profile
      const res = await fetch(`${apiUrl}/api/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const uId = data.info?.user_id;

      if (uId) {
        setUserId(uId);
        connectWebSocket(uId);
        fetchHistory(uId);
      }
    } catch (e) {
      console.error("Error connecting to support chat:", e);
    }
  };

  const connectWebSocket = (uId: number) => {
    // Clean up existing connection
    if (ws.current) {
      ws.current.onclose = null;
      ws.current.close();
    }

    const wsUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("http", "ws")
      : "ws://127.0.0.1:8000";

    const socket = new WebSocket(`${wsUrl}/api/support/ws/${uId}`);

    socket.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error("Error parsing ws message", e);
      }
    };

    socket.onclose = () => {
      // Only reconnect if widget is still open and under max attempts
      if (isOpenRef.current && reconnectAttempts.current < MAX_RECONNECT) {
        reconnectAttempts.current += 1;
        console.log(
          `WebSocket reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT})...`,
        );
        setTimeout(() => connectWebSocket(uId), 3000);
      }
    };

    ws.current = socket;
  };

  const fetchHistory = async (uId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/support/messages/${uId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Lỗi fetch lịch sử", e);
    }
  };

  const sendMessage = () => {
    if (
      !inputMessage.trim() ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN
    )
      return;

    ws.current.send(JSON.stringify({ message: inputMessage }));
    setInputMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col border border-indigo-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle size={20} /> Live Support
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 bg-gray-50 flex flex-col h-full overflow-hidden">
            {plan === "free" ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                  <MessageCircle size={32} />
                </div>
                <h4 className="font-bold text-gray-800">Tính năng Premium</h4>
                <p className="text-sm text-gray-500">
                  Nâng cấp gói Pro để chat trực tiếp với đội ngũ hỗ trợ của
                  chúng tôi.
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Nâng cấp Pro ngay
                </button>
              </div>
            ) : (
              // Component Chat
              <div className="flex flex-col h-full font-sans">
                <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-gray-400 mt-10">
                      Hãy gửi tin nhắn đầu tiên của bạn. Admin sẽ trả lời sớm
                      nhất có thể.
                    </div>
                  )}
                  {messages.map((m, idx) => {
                    const isUser = m.sender_type === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                            isUser
                              ? "bg-indigo-500 text-white rounded-tr-sm"
                              : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="pt-3 flex gap-2 w-full mt-auto mb-2 border-t border-gray-200 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Send size={16} className="-ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <MessageCircle size={28} className="group-hover:animate-pulse" />
        </button>
      )}
    </div>
  );
}
