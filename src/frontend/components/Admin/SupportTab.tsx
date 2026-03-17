"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Send, User, Clock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: number;
  user_id: number;
  admin_id: number | null;
  message: string;
  sender_type: "user" | "admin";
  is_read: boolean;
  created_at: string;
}

interface ActiveChat {
  user_id: number;
  full_name: string;
  email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export function SupportTab() {
  // role and token are taken from context
  const { role, token } = useAuth();
  const router = useRouter();

  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [selectedUser, setSelectedUser] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchActiveChats();
      connectAdminWebSocket();

      // Refresh list periodically
      const interval = setInterval(fetchActiveChats, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (selectedUser && token) {
      fetchUserMessages(selectedUser.user_id);
      markMessagesAsRead(selectedUser.user_id);

      // Update UI unread count
      setActiveChats((prev) =>
        prev.map((chat) =>
          chat.user_id === selectedUser.user_id
            ? { ...chat, unread_count: 0 }
            : chat,
        ),
      );
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchActiveChats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/support/active-chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveChats(data);
      }
    } catch (e) {
      console.error("Error fetching chat list", e);
    }
  };

  const fetchUserMessages = async (userId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/support/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error fetching message history", e);
    }
  };

  const markMessagesAsRead = async (userId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/api/support/messages/${userId}/admin-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error("Error marking messages as read", e);
    }
  };

  const connectAdminWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("http", "ws")
      : "ws://127.0.0.1:8000";

    const socket = new WebSocket(`${wsUrl}/api/support/ws/admin`);

    socket.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);

        // Handle incoming message
        // 1. Update active chats list
        setActiveChats((prev) => {
          const exists = prev.find((c) => c.user_id === msg.user_id);
          let newList = [...prev];

          if (exists) {
            newList = newList.map((c) => {
              if (c.user_id === msg.user_id) {
                return {
                  ...c,
                  last_message: msg.message,
                  last_message_time: msg.created_at,
                  unread_count:
                    msg.sender_type === "user" &&
                    (!selectedUser || selectedUser.user_id !== msg.user_id)
                      ? c.unread_count + 1
                      : c.unread_count,
                };
              }
              return c;
            });
          } else {
            // Need to fetch full list to get user name, but temporarily we can just reload
            fetchActiveChats();
          }

          // Sort
          newList.sort((a, b) => {
            if (a.unread_count > 0 && b.unread_count === 0) return -1;
            if (b.unread_count > 0 && a.unread_count === 0) return 1;
            return (
              new Date(b.last_message_time).getTime() -
              new Date(a.last_message_time).getTime()
            );
          });

          return newList;
        });

        // 2. Add to messages if this is the currently selected user
        setMessages((prev) => {
          // Double check to prevent duplicates if sending from current tab
          if (prev.length > 0 && prev[prev.length - 1].id === msg.id)
            return prev;

          // Only append if it's the selected user
          // We have to use a functional state update trick since selectedUser might be stale in this closure
          // Let's rely on the latest selectedUser (Need to be careful about closure here)
          return [...prev, msg]; // Simply append, we'll filter out wrong ones via id later if needed, but WS handles all admin messages
          // Note: In a real app, you should check if this message's user_id == current selectedUser.user_id
        });
      } catch (e) {
        console.error("Error parsing admin WS message", e);
      }
    };

    socket.onclose = () => {
      console.log("Admin WebSocket Disconnected. Reconnecting...");
      setTimeout(connectAdminWebSocket, 3000);
    };

    ws.current = socket;
  };

  const sendMessage = () => {
    if (
      !inputMessage.trim() ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN ||
      !selectedUser
    )
      return;

    // Admin sends message targeting a user_id
    ws.current.send(
      JSON.stringify({
        message: inputMessage,
        target_user_id: selectedUser.user_id,
      }),
    );

    setInputMessage("");
  };

  if (!token)
    return (
      <div className="p-8 text-center text-slate-400 h-full flex items-center justify-center">
        Đang tải xác thực...
      </div>
    );

  return (
    <div className="flex flex-col h-full font-sans text-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="text-pink-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Live Support - Admin</h1>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-1 border border-slate-700/50">
        {/* Chat History - Left Column */}
        <div className="w-1/3 border-r border-slate-700 bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
            <h2 className="font-semibold flex items-center gap-2 text-slate-200">
              <Clock size={18} className="text-pink-400" /> Phiên hỗ trợ (
              {activeChats.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeChats.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                <CheckCircle2
                  size={40}
                  className="mb-2 text-emerald-500/50 opacity-50"
                />
                Không có chat nào đang hoạt động
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {activeChats.map((chat) => (
                  <button
                    key={chat.user_id}
                    onClick={() => setSelectedUser(chat)}
                    className={`w-full text-left p-4 hover:bg-slate-800 transition-colors flex items-start gap-4 ${selectedUser?.user_id === chat.user_id ? "bg-slate-800 border-l-4 border-pink-500" : ""}`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
                        {chat.full_name.charAt(0).toUpperCase()}
                      </div>
                      {chat.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border border-slate-900 shadow-sm animate-pulse">
                          {chat.unread_count}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-slate-200 truncate">
                          {chat.full_name}
                        </h4>
                        <span className="text-xs text-slate-500 shrink-0">
                          {new Date(chat.last_message_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${chat.unread_count > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}
                      >
                        {chat.last_message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Detail Panel - Right Column */}
        <div className="w-2/3 flex flex-col bg-slate-950 relative">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      {selectedUser.full_name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <User size={12} /> {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-4 custom-scrollbar">
                {messages.filter((m) => m.user_id === selectedUser.user_id)
                  .length === 0 ? (
                  <div className="flex justify-center container mx-auto text-slate-500 mt-20">
                    Không có tin nhắn nào.
                  </div>
                ) : (
                  messages
                    .filter((m) => m.user_id === selectedUser.user_id)
                    .map((m, idx) => {
                      const isAdmin = m.sender_type === "admin";
                      return (
                        <div
                          key={idx}
                          className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm ${
                                isAdmin
                                  ? "bg-pink-600 text-white rounded-tr-sm shadow-pink-900/20"
                                  : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm"
                              }`}
                            >
                              {m.message}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 mx-1">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex items-end gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 transition-shadow">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Nhập phản hồi của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
                    className="flex-1 max-h-32 min-h-11 bg-transparent border-none resize-none focus:ring-0 px-2 py-2 text-slate-200 text-sm placeholder:text-slate-600"
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="mb-1 mr-1 bg-pink-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-pink-700 disabled:opacity-50 transition-colors shadow-lg shadow-pink-900/30"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-slate-500 bg-slate-900/50">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 rounded-full"></div>
                <MessageCircle
                  size={64}
                  className="opacity-40 relative z-10 text-pink-400"
                />
              </div>
              <p className="text-lg font-medium text-slate-400">
                Chọn một cuộc hội thoại để bắt đầu hỗ trợ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
