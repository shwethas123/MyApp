import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import PetService from "../services/PetService";
// import UserService from "../services/UserService";
import api from "../services/Apiservices";
import ReportUserModal from "../components/common/ReportUserModal";
import useWishlist from "../hooks/useWishList";
import useAuth from "../hooks/AuthContext";
import useAdopterOnly from "../hooks/useAdopterOnly";
import PdfViewerModal from "../components/common/PdfViewerModal";
let globalSocket = null;

function PetImageSlider({ images = [], petName }) {
  const [current, setCurrent] = useState(0);
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const total = sorted.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    if (total <= 1) return; // don't auto-slide if only 1 image
    const timer = setInterval(() => setCurrent((c) => (c + 1) % total), 2000);
    return () => clearInterval(timer); // cleanup: stop timer when component unmounts
  }, [total, current]);

  if (total === 0)
    return (
      <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">No photos available</p>
      </div>
    );

  return (
    <div className="relative">
      <div className="relative w-full h-80 rounded-2xl overflow-hidden">
        <img
          src={sorted[current].file_url}
          alt={`${petName} photo ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {current + 1} / {total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-2 mt-2">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrent(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${index === current ? "border-blue-500" : "border-transparent hover:border-blue-300"}`}
            >
              <img
                src={img.file_url}
                alt={`${petName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ── AI PET CHAT ─────────────────────────────────────────────────────────────
function PetAIChat({ petId, petName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/pets/${petId}/chat`, {
        message: userMsg.content,
        history: messages,
      });
      setMessages([
        ...updatedHistory,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages([
        ...updatedHistory,
        { role: "assistant", content: "Sorry, I couldn't respond. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 border border-blue-100 rounded-xl overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Ask AI about {petName}
            </p>
            <p className="text-xs text-blue-500">
              Instant answers about this pet
            </p>
          </div>
        </div>
        <span className="text-blue-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {/* Messages */}
          <div
            className="h-56 overflow-y-auto px-4 py-3 space-y-2 bg-white"
            style={{ scrollbarWidth: "none" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-2xl mb-1">🐾</p>
                <p className="text-xs text-gray-400">
                  Ask me anything about {petName}!
                </p>
                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {[
                    `Is ${petName} good with kids?`,
                    "What are the adoption requirements?",
                    "How old is this pet?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-blue-50 bg-white">
            <input
              className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={`Ask about ${petName}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors disabled:opacity-40 shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── CHAT POPUP ─────────────────────────────────────────────────────────────
function ChatPopup({ pet, onClose, socketRef, chatOpenRef, setUnreadCount }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket listener — re-attaches when socket becomes available ──
  useEffect(() => {
    if (globalSocket && !socketRef.current) {
      socketRef.current = globalSocket;
    }
    const socket = socketRef?.current;
    if (!socket) return;

    const handler = (msg) => {
      setMessages((prev) => {
        //When the server emits back the real message, the handler in useEffect swaps the fake one out for the real one.
        // Replace temp message with real one, or add if new
        const withoutTemp = prev.filter(
          (m) =>
            !(String(m.id).startsWith("temp_") && m.content === msg.content),
        );
        if (withoutTemp.some((m) => m.id === msg.id)) return withoutTemp;
        return [...withoutTemp, msg];
      });
    };

    socket.off("new_message", handler);
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socketRef.current]); // re-run when socket is ready

  const initChat = async () => {
    try {
      if (globalSocket && !socketRef.current) {
        socketRef.current = globalSocket;
      }

      const res = await api.post("/conversations/check", { pet_id: pet.id });

      if (res.data.data) {
        const convId = res.data.data.id;
        setConversationId(convId);
        const historyRes = await api.get(`/conversations/${convId}/messages`);
        setMessages(historyRes.data.data);

        const socket = socketRef.current;
        if (socket) {
          if (socket.connected) {
            socket.emit("join_conversation", convId);
          } else {
            socket.once("connect", () =>
              socket.emit("join_conversation", convId),
            ); //only fires one time
          }
        }
      }
    } catch (err) {
      console.error("Chat init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    try {
      let convId = conversationId;

      // ✅ Only create conversation when first message is sent
      if (!convId) {
        const res = await api.post("/conversations", { pet_id: pet.id });
        convId = res.data.data.id;
        setConversationId(convId);

        const socket = socketRef.current;
        if (socket) {
          if (socket.connected) {
            socket.emit("join_conversation", convId);
          } else {
            socket.once("connect", () =>
              socket.emit("join_conversation", convId),
            );
          }
        }
      }

      // ✅ Optimistic update — message appears immediately
      const tempMsg = {
        id: `temp_${Date.now()}`,
        content,
        sender_id: currentUser?.id,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      socketRef.current?.emit("send_message", {
        conversation_id: convId,
        content,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false); // handler function will swap this message with the real one from the server, so we don't need to do anything else here
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMe = (msg) =>
    msg.sender_id === currentUser?.id || msg.sender?.id === currentUser?.id;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
      style={{ height: "460px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {pet.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{pet.name}</p>
            <p className="text-xs text-blue-100">
              {pet.shelter?.name || "Shelter"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setReportOpen(true)}
            className="text-xs text-red-300 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          >
            🚩 Report
          </button>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
        style={{ scrollbarWidth: "none" }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl mb-2">🐾</div>
              <p className="text-xs text-gray-400">
                Say hello to ask about {pet.name}!
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${isMe(msg) ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-3 py-2 ${isMe(msg) ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}
            >
              {msg.file_url ? (
                <img
                  src={msg.file_url}
                  alt="attachment"
                  className="rounded-lg max-w-full max-h-40 object-cover"
                />
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              <p
                className={`text-[10px] mt-1 ${isMe(msg) ? "text-blue-200" : "text-gray-400"}`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors disabled:opacity-40 shrink-0"
        >
          <Send size={14} />
        </button>
      </div>

      {reportOpen && (
        <ReportUserModal
          conversationId={conversationId}
          reportedUserId={pet?.shelter?.owner_id}
          reportedName={pet?.shelter?.name}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
const PetDetailPage = () => {
  const isAllowed = useAdopterOnly();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const {
    wishlisted,
    toggle,
    loading: wishlistLoading,
    canWishlist,
  } = useWishlist(id);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const convIdRef = useRef(null);
  const chatOpenRef = useRef(false);
  const { isAuthenticated, currentUser } = useAuth();
  const [pdfUrl, setPdfUrl] = useState(null);

  // ✅ Keep chatOpenRef in sync
  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  const handleAdopt = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/pets/${id}` } });
      return;
    }
    navigate(`/pets/${id}/apply`);
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/pets/${id}` } });
      return;
    }
    if (currentUser?.role === "shelter" || currentUser?.role === "admin") {
      alert("Shelter accounts cannot send adoption inquiries.");
      return;
    }
    setChatOpen(true);
    chatOpenRef.current = true;
    setUnreadCount(0);
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const result = await PetService.getPetById(id);
        console.log("pet result:", result);
        setPet(result.data);
        // Auto-open chat if redirected from notification
        const params = new URLSearchParams(window.location.search);
        if (params.get("chat") === "true") {
          if (currentUser?.role === "adopter") {
            setChatOpen(true);
            chatOpenRef.current = true;
          }
        }
      } catch {
        setError("Failed to load pet details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // ✅ Single socket using module-level globalSocket
  useEffect(() => {
    if (!pet?.id) return;

    // ✅ If already connected, just sync the ref and return
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      return;
    }

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    globalSocket = socket;
    socketRef.current = socket;

    // ✅ Only call conversations/check if user is logged in
    if (isAuthenticated) {
      api
        .post("/conversations/check", { pet_id: pet.id })
        .then((res) => {
          if (res.data.data) {
            const convId = res.data.data.id;
            convIdRef.current = convId;
            socket.on("connect", () =>
              socket.emit("join_conversation", convId),
            );
            if (socket.connected) socket.emit("join_conversation", convId);
          }
        })
        .catch(() => {});
    }

    socket.on("new_message", (msg) => {
      if (msg.sender_id !== currentUser?.id) {
        if (!chatOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });
    socket.on("reconnect", () => {
  if (convIdRef.current) {
    socket.emit("join_conversation", convIdRef.current);
  }
  if (convIdRef.current) {
    api.get(`/conversations/${convIdRef.current}/messages`).then(() => {});
  }
});

    return () => {
      socket.disconnect();
      globalSocket = null;
      socketRef.current = null;
    };
  }, [pet?.id]); // ✅ primitive dependency — won't re-run on object reference change

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐾</div>
          <p className="text-gray-500 text-sm">Loading pet details...</p>
        </div>
      </div>
    );

  if (error || !pet)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Oops, something went wrong
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This pet listing may have been removed or is no longer available.
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            ← Back to Browse Pets
          </button>
        </div>
      </div>
    );
  if (!isAllowed) return null;
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT — Pet Image */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <PetImageSlider images={pet.images} petName={pet.name} />
                <button
                  onClick={canWishlist ? toggle : undefined}
                  disabled={wishlistLoading}
                  title={
                    !canWishlist
                      ? "Login as adopter to save"
                      : wishlisted
                        ? "Remove from wishlist"
                        : "Save to wishlist"
                  }
                  className={`absolute top-3 right-3 bg-white rounded-full p-2 shadow transition-colors ${canWishlist ? "hover:text-red-500 cursor-pointer" : "cursor-default opacity-60"} ${wishlistLoading ? "opacity-50" : ""}`}
                >
                  <Heart
                    size={18}
                    className="transition-colors"
                    fill={wishlisted ? "#ef4444" : "none"}
                    stroke={wishlisted ? "#ef4444" : "#9ca3af"}
                  />
                </button>
              </div>
              <div className="mt-6">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400  tracking-wide mb-2">
                    Shelter information
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {pet.shelter?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {pet.shelter?.name || "Unknown Shelter"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pet.shelter?.city}, {pet.shelter?.state}-
                        {pet.shelter?.zipcode}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pet.shelter?.contact_email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pet.shelter?.contact_phone}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400  tracking-wide mb-1">
                    Adoption fee
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pet.adoption_fee ? `₹${pet.adoption_fee}` : "Free"}
                  </p>
                </div>

                {/* ✅ AI Chatbot — sits below adoption fee on left panel */}
                <div className="mt-4">
                  <PetAIChat petId={pet.id} petName={pet.name} />
                </div>

              </div>
            </div>

            {/* RIGHT — Pet Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {pet.gender?.charAt(0).toUpperCase() + pet.gender?.slice(1)}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                {pet.breed} • {pet.age} {pet.age === 1 ? "Year" : "Years"} old
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quick facts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Temperament", value: pet.temperament },
                    {
                      label: "Vaccinated",
                      value: pet.vaccinated ? "Yes, Up-to-date" : "No",
                    },
                    {
                      label: "Sterilized",
                      value: pet.sterilized?.replace("_", " "),
                    },
                    {
                      label: "Health record",
                      value: pet.health_status,
                      url: pet.health_record_url,
                    },
                    ...(pet.vaccinated
                      ? pet.vaccination_record_url
                        ? [
                            {
                              label: "Vaccination record",
                              value: "View Record",
                              url: pet.vaccination_record_url,
                            },
                          ]
                        : []
                      : pet.vaccination_notes
                        ? [
                            {
                              label: "Vaccination Requirements",
                              value: pet.vaccination_notes,
                            },
                          ]
                        : []),
                    ...(pet.sterilized &&
                    pet.sterilized !== "not_sterilized" &&
                    pet.sterilization_certificate_url
                      ? [
                          {
                            label: "Sterilization Certificate",
                            value: "View Certificate",
                            url: pet.sterilization_certificate_url,
                          },
                        ]
                      : []),
                    { label: "Social friendly", value: pet.good_with_kids === true ? "Yes" : pet.good_with_kids === false ? "No" : "—" },
                    { label: "Special needs", value: pet.special_needs ? "Yes" : "No" },
                  ].map(({ label, value, url }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400  tracking-wide mb-1">
                        {label}
                      </p>
                      {url ? (
                        <button
                          onClick={() => {
                            const isPdf =
                              url?.includes("/raw/upload/") ||
                              url?.toLowerCase().endsWith(".pdf");
                            if (isPdf) {
                              setPdfUrl(url);
                            } else {
                              window.open(url, "_blank");
                            }
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline capitalize text-left"
                        >
                          {value || "View Record"} ↗
                        </button>
                      ) : (
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {value || "—"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {pet.rescue_story && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Short description
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{pet.rescue_story}"
                    </p>
                  </div>
                </div>
              )}
       {pet.prerequisites?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Adoption guidelines
                  </h3>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <ul className="space-y-2">
                      {pet.prerequisites.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-amber-500 font-bold mt-0.5 shrink-0">
                            •
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            

              <div className="flex gap-3">
                <button
                  onClick={handleAdopt}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Apply for adoption →
                </button>
                <button
                  onClick={handleChat}
                  className="relative flex items-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors text-sm"
                >
                  <MessageCircle size={16} />
                  Ask
                  {unreadCount > 0 && !chatOpen && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Always mounted — socket listener stays alive */}
      <div style={{ display: chatOpen ? "block" : "none" }}>
        <ChatPopup
          key={pet?.id}
          pet={pet}
          onClose={() => {
            setChatOpen(false);
            chatOpenRef.current = false;
          }}
          socketRef={socketRef}
          chatOpenRef={chatOpenRef}
          setUnreadCount={setUnreadCount}
        />
      </div>
      {pdfUrl && (
        <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </div>
  );
};

export default PetDetailPage;
