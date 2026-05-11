import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import { MessageSquare, Send, Loader2, PawPrint, Search, ArrowLeft, Menu, X } from "lucide-react";
import api from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";
import ReportUserModal from "../components/common/ReportUserModal";

function StatusBadge({ status }) {
  const styles = { Inquiry: "bg-gray-100 text-gray-500", Applied: "bg-blue-100 text-blue-600", Closed: "bg-red-100 text-red-500" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || styles.Inquiry}`}>{status}</span>;
}

function ConversationItem({ conv, isActive, onClick }) {
  const lastMsg = conv.messages?.[0];
  const unread = conv.shelter_unread || 0;
  const adopterName = `${conv.adopter?.first_name || ""} ${conv.adopter?.last_name || ""}`.trim() || "Unknown";
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
          {adopterName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-semibold text-gray-800 truncate">{adopterName}</p>
            {unread > 0 && <span className="w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">{unread}</span>}
          </div>
          <p className="text-[11px] text-blue-500 font-medium truncate mb-1">🐾 {conv.pet?.name || "Unknown Pet"}</p>
          <p className="text-[11px] text-gray-400 truncate">{lastMsg?.content || "No messages yet"}</p>
        </div>
      </div>
    </button>
  );
}// visualize the side message bar in shelter message 

function ChatWindow({ conv, currentUser, socketRef, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { if (!conv) return; loadMessages(); }, [conv?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg) => {
      if (msg.conversation_id === conv?.id) {
        setMessages((prev) => {
          // Replace temp message with real one
          const withoutTemp = prev.filter(
            (m) => !(String(m.id).startsWith("temp_") && m.content === msg.content)
          );
          if (withoutTemp.some((m) => m.id === msg.id)) return withoutTemp;
          return [...withoutTemp, msg];
        });
      }
    };
    socketRef.current.on("new_message", handler);
    return () => socketRef.current?.off("new_message", handler);
  }, [conv?.id, socketRef.current]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data.data);
      // ✅ Join room with fallback if socket not yet connected
      if (socketRef.current?.connected) {
        socketRef.current.emit("join_conversation", conv.id);// if it is already connected, join immediately
      } else {
        socketRef.current?.once("connect", () => {// if not connected yet, wait for connection before joining
          socketRef.current.emit("join_conversation", conv.id);
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    const content = input.trim();
    setInput("");

    // ✅ Show message immediately without waiting for socket echo
    const tempMsg = {
      id: `temp_${Date.now()}`,
      content,
      sender_id: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketRef.current.emit("send_message", { conversation_id: conv.id, content });
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const isMe = (msg) => msg.sender_id === currentUser?.id;
  const adopterName = `${conv.adopter?.first_name || ""} ${conv.adopter?.last_name || ""}`.trim() || "Unknown";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden", background: "#fff" }}>

      {/* Header — always visible */}
      <div style={{ flexShrink: 0, padding: "10px 16px", borderBottom: "1px solid #F3F4F6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
  className="msg-back-btn" 
  onClick={onBack} 
  style={{ 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    color: "#6B7280", 
    padding: "2px", 
    display: "flex",
    alignItems: "center", 
    justifyContent: "center" 
  }}
>
  <ArrowLeft size={20} color="#374151" />
</button>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#3182CE", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
            {adopterName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937", margin: 0 }}>{adopterName}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>Asking about <span style={{ color: "#3182CE" }}>{conv.pet?.name}</span></p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusBadge status={conv.status} />
          <button onClick={() => setReportOpen(true)} style={{ fontSize: "11px", color: "#F87171", border: "1px solid #FECACA", borderRadius: "8px", padding: "4px 8px", background: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
            🚩 Report
          </button>
        </div>
      </div>

      {/* Messages — only this area scrolls */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", background: "#F9FAFB", display: "flex", flexDirection: "column", gap: "8px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Loader2 size={20} className="animate-spin" style={{ color: "#D1D5DB" }} />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: "8px" }}>
            <PawPrint size={28} style={{ color: "#E5E7EB" }} />
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: isMe(msg) ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "6px" }}>
            {!isMe(msg) && (
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#3182CE", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                {adopterName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ maxWidth: "65%", borderRadius: "16px", padding: "8px 12px", background: isMe(msg) ? "#3182CE" : "#fff", color: isMe(msg) ? "#fff" : "#1F2937", borderBottomRightRadius: isMe(msg) ? "4px" : "16px", borderBottomLeftRadius: isMe(msg) ? "16px" : "4px", boxShadow: isMe(msg) ? "none" : "0 1px 2px rgba(0,0,0,0.06)", border: isMe(msg) ? "none" : "1px solid #F3F4F6" }}>
              {msg.file_url ? (
                <img src={msg.file_url} alt="attachment" style={{ borderRadius: "8px", maxWidth: "100%", maxHeight: "150px", objectFit: "cover" }} />
              ) : (
                <p style={{ fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
              )}
              <p style={{ fontSize: "10px", margin: "3px 0 0", color: isMe(msg) ? "rgba(255,255,255,0.6)" : "#9CA3AF", textAlign: "right" }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — always at bottom */}
      <div style={{ flexShrink: 0, borderTop: "1px solid #F3F4F6", padding: "10px 14px", background: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type a reply..."
          style={{ flex: 1, fontSize: "13px", background: "#F9FAFB", borderRadius: "20px", padding: "8px 14px", border: "1px solid #E5E7EB", outline: "none" }}
        />
        <button onClick={sendMessage} disabled={!input.trim()}
          style={{ background: input.trim() ? "#3182CE" : "#D1D5DB", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>
          <Send size={13} color="#fff" />
        </button>
      </div>

      {reportOpen && <ReportUserModal conversationId={conv.id} reportedUserId={conv.adopter_id} reportedName={adopterName} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);

  // ✅ FIX 1: use useAuth instead of UserService.getCurrentUser() (which is now async)
  const { currentUser } = useAuth();

  useEffect(() => {
    loadConversations();
    initSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  // ✅ Re-join conversation room whenever active conversation changes
  useEffect(() => {
    if (!activeConv?.id || !socketRef.current) return;
    socketRef.current.emit("join_conversation", activeConv.id);
  }, [activeConv?.id]);

const initSocket = () => {
  const socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"],
  });
  socket.on("connect", () => console.log("Shelter socket connected"));
  socket.on("connect_error", (err) => console.error("Socket error:", err.message));
  socket.on("reconnect", () => {
    if (activeConv?.id) {
      socket.emit("join_conversation", activeConv.id);
    }
  });
  socketRef.current = socket;  // ← only once, inside function
};                               // ← function closes here

  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data.data);
      if (res.data.data.length > 0) setActiveConv(res.data.data[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredConvs = conversations.filter((c) => {
    const petName = c.pet?.name?.toLowerCase() || "";
    const adopterName = `${c.adopter?.first_name || ""} ${c.adopter?.last_name || ""}`.trim().toLowerCase();
    const hasMessages = c.messages && c.messages.length > 0;
    const query = search.toLowerCase();
    return (petName.includes(query) || adopterName.includes(query)) && hasMessages;
  });

  return (
    <>
      <style>{`
        .msg-scroll::-webkit-scrollbar { display: none; }
        .conv-scroll::-webkit-scrollbar { display: none; }
        .msg-back-btn { display: none; }
        .msg-hamburger { display: none; }
        @media (max-width: 768px) {
         .msg-sidebar-wrapper { 
  position: fixed; top: 0; left: -260px; height: 100vh; z-index: 300;
  width: 260px; background: #fff;
  transition: left 0.25s ease;
}
.msg-sidebar-wrapper.open { 
  left: 0 !important;
  box-shadow: 4px 0 20px rgba(0,0,0,0.15);
}
       .msg-sidebar-wrapper.open { 
  display: flex !important; 
  position: fixed; top: 0; left: 0; height: 100vh; z-index: 300;
  width: 260px;
  box-shadow: 4px 0 20px rgba(0,0,0,0.15);
  background: #fff;
}
          .msg-conv-list { width: 100% !important; }
          .msg-conv-list.hide { display: none !important; }
          .msg-chat-panel { display: none !important; }
           .msg-chat-panel.show { display: flex !important; flex-direction: column; width: 100% !important; position: fixed; top: 100px; left: 0; right: 0; bottom: 0; z-index: 10; }
           .msg-chat-panel.show > div { height: 100% !important; }

          .msg-back-btn { display: flex !important; }
          .msg-hamburger { display: flex !important; }
        }
      `}</style>

      {/* Mobile overlay for sidebar */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 299 }} />
      )}

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F5F7FA", position: "fixed", width: "100%" }}>

        {/* Shelter Sidebar */}
        <div className={`msg-sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
          <ShelterSidebar />
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "100vh", position: "relative" }}>

          {/* Conversation List */}
          <div className={`msg-conv-list ${mobileView === "chat" ? "hide" : ""}`} style={{ width: "288px", background: "#fff", borderRight: "1px solid #F3F4F6", display: "flex", flexDirection: "column", flexShrink: 0 }}>

            {/* Header with hamburger */}
            <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <button className="msg-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}
               style={{ background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: "4px", padding: "2px", flexShrink: 0 }}>
                  {sidebarOpen ? <X size={20} color="#374151" /> : <Menu size={20} color="#374151" />}
                </button>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1B3A4B", margin: 0 }}>Messages</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F9FAFB", borderRadius: "8px", padding: "7px 12px" }}>
                <Search size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, fontSize: "12px", background: "transparent", border: "none", outline: "none", color: "#374151" }} />
              </div>
            </div>

            <div className="conv-scroll" style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
              {loading && <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Loader2 size={18} className="animate-spin" style={{ color: "#D1D5DB" }} /></div>}
              {!loading && filteredConvs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <MessageSquare size={28} style={{ color: "#E5E7EB", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>No conversations yet</p>
                </div>
              )}
              {filteredConvs.map((conv) => (
                <ConversationItem key={conv.id} conv={conv} isActive={activeConv?.id === conv.id}
                  onClick={() => { setActiveConv(conv); setMobileView("chat"); }} />
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className={`msg-chat-panel ${mobileView === "chat" ? "show" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {activeConv ? (
              <ChatWindow conv={activeConv} currentUser={currentUser} socketRef={socketRef} onBack={() => setMobileView("list")} />
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
                <div style={{ textAlign: "center" }}>
                  <MessageSquare size={40} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>Select a conversation</p>
                  <p style={{ fontSize: "12px", color: "#D1D5DB", marginTop: "4px" }}>Choose from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}