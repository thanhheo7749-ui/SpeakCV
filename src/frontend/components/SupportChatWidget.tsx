"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { MessageCircle, X, Send, LogIn } from "lucide-react";

interface ChatMessage {
  id: number;
  user_id: number;
  admin_id: number | null;
  message: string;
  sender_type: "user" | "admin" | "system";
  is_read: boolean;
  created_at: string;
  quota_exceeded?: boolean;
}

export default function SupportChatWidget() {
  const { token, role } = useAuth();
  const { plan } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quota, setQuota] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECONNECT = 3;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- Fetch user ID once on mount ---
  const fetchUserId = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const uId = data.info?.user_id;
      if (uId) setUserId(uId);
    } catch (e) {
      console.error("Error fetching user ID:", e);
    }
  };

  // --- Polling for unread count ---
  const startPolling = (uId: number) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`${apiUrl}/api/support/unread-count/${uId}`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count);
        }
      } catch {}
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 30000);
  };

  // --- Fetch quota ---
  const fetchQuota = async (uId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/support/quota/${uId}`);
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch {}
  };

  // --- Mark messages as read ---
  const markAsRead = async (uId: number) => {
    try {
      await fetch(`${apiUrl}/api/support/messages/${uId}/read`, {
        method: "POST",
      });
    } catch {}
  };

  // --- WebSocket connection ---
  const connectWebSocket = (uId: number) => {
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
        if (msg.quota_exceeded) {
          fetchQuota(uId);
        }
        if (msg.sender_type === "user" && quota && quota.remaining > 0) {
          setQuota((prev) =>
            prev && prev.remaining > 0
              ? { ...prev, remaining: prev.remaining - 1 }
              : prev,
          );
        }
      } catch (e) {
        console.error("Error parsing ws message", e);
      }
    };

    socket.onclose = () => {
      if (isOpenRef.current && reconnectAttempts.current < MAX_RECONNECT) {
        reconnectAttempts.current += 1;
        setTimeout(() => connectWebSocket(uId), 3000);
      }
    };

    ws.current = socket;
  };

  // --- Fetch history ---
  const fetchHistory = async (uId: number) => {
    try {
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

  useEffect(() => {
    if (token && !userId) {
      fetchUserId();
    }
  }, [token]);

  // --- Open/close widget logic ---
  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen && token && userId) {
      reconnectAttempts.current = 0;
      connectWebSocket(userId);
      fetchHistory(userId);
      fetchQuota(userId);
      markAsRead(userId);
      setUnreadCount(0);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    if (!isOpen && ws.current) {
      ws.current.onclose = null;
      ws.current.close();
      ws.current = null;
    }

    if (!isOpen && token && userId) {
      startPolling(userId);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isOpen, token, userId]);

  // --- Auto scroll ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Hide widget for admins
  if (role === "admin") return null;

  // --- Send message ---
  const sendMessage = () => {
    if (
      !inputMessage.trim() ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN
    )
      return;

    // Check if quota exceeded locally
    if (quota && quota.limit > 0 && quota.remaining <= 0) return;

    ws.current.send(JSON.stringify({ message: inputMessage }));
    setInputMessage("");
  };

  // --- Handle icon click ---
  const handleIconClick = () => {
    if (!token) {
      setShowGuestPrompt(true);
      return;
    }
    setIsOpen(true);
    setShowGuestPrompt(false);
  };

  const isQuotaExceeded =
    quota !== null && quota.limit > 0 && quota.remaining <= 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col border border-indigo-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle size={20} /> Hỗ trợ trực tuyến
            </h3>
            <div className="flex items-center gap-2">
              {/* Quota indicator for free users */}
              {quota && quota.limit > 0 && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  {quota.remaining}/{quota.limit}
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 bg-gray-50 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full font-sans">
              <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-gray-400 mt-10">
                    Hãy gửi tin nhắn đầu tiên của bạn. Admin sẽ trả lời sớm nhất
                    có thể.
                  </div>
                )}
                {messages.map((m, idx) => {
                  const isUser = m.sender_type === "user";
                  const isSystem = m.sender_type === "system";
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex ${
                        isSystem
                          ? "justify-center"
                          : isUser
                            ? "justify-end"
                            : "justify-start"
                      } animate-slide-in-${isUser ? "right" : "left"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                          isSystem
                            ? "bg-amber-50 border border-amber-200 text-amber-700 text-center italic text-xs"
                            : isUser
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

              {/* Quota exceeded banner */}
              {isQuotaExceeded && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-2 text-center">
                  <p className="text-xs text-amber-700 font-medium">
                    Bạn đã hết lượt chat hôm nay
                  </p>
                  <button
                    onClick={() => (window.location.href = "/#pricing")}
                    className="mt-1 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Nâng cấp Pro để Chat thả ga
                  </button>
                </div>
              )}

              <div className="pt-3 flex gap-2 w-full mt-auto mb-2 border-t border-gray-200 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={
                    isQuotaExceeded
                      ? "Hết lượt chat hôm nay..."
                      : "Nhập tin nhắn..."
                  }
                  disabled={isQuotaExceeded}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isQuotaExceeded}
                  className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={16} className="-ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Guest login prompt popup */}
          {showGuestPrompt && (
            <div className="absolute bottom-16 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-4 text-center animate-slide-in-left">
              <LogIn size={24} className="mx-auto text-indigo-500 mb-2" />
              <p className="text-sm text-gray-700 font-medium mb-2">
                Đăng nhập để chat hỗ trợ
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all w-full"
              >
                Đăng nhập ngay
              </button>
              <button
                onClick={() => setShowGuestPrompt(false)}
                className="mt-1.5 text-xs text-gray-400 hover:text-gray-600"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Chat icon button */}
          <button
            onClick={handleIconClick}
            className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <MessageCircle size={28} className="group-hover:animate-pulse" />
          </button>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
