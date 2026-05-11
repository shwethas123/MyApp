import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import api from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";
import UserService from "../services/UserService";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import AdoptionService from "../services/Adoptionservice";
import PaymentModal from "./PaymentModal";
import ReportUserModal from "../components/common/ReportUserModal";

// ✅ Module-level socket — survives re-renders
let globalSocket = null;

// ─── Progress Steps Config ────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Application submitted",
    description: "Your application is under review by the shelter",
    icon: "shield",
  },
  {
    id: 2,
    title: "Shelter approved",
    description: "Shelter has reviewed and approved your application",
    icon: "home",
  },
  {
    id: 3,
    title: "Home visit",
    description: "Shelter schedules and completes a home visit",
    icon: "home",
  },
  {
    id: 4,
    title: "Final adoption",
    description: "Sign contract and pay fee to complete adoption",
    icon: "document",
  },
];

const STATUS_PROGRESS = {
  pending: {
    step: 1,
    progress: 25,
    label: "Under review",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  under_review: {
    step: 1,
    progress: 25,
    label: "Under review",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  approved: {
    step: 2,
    progress: 50,
    label: "Approved",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  home_visit: {
    step: 3,
    progress: 75,
    label: "Home visit",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  payment_pending: {
    step: 4,
    progress: 90,
    label: "Payment completed",
    color: "text-teal-600 bg-teal-50 border-teal-200",
  },
  completed: {
    step: 4,
    progress: 100,
    label: "Adopted! 🎉",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  rejected: {
    step: 0,
    progress: 0,
    label: "Rejected",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  dissolved: {
    step: 0,
    progress: 0,
    label: "Cancelled",
    color: "text-gray-500 bg-gray-50 border-gray-200",
  },
};

const STATUS_MESSAGE = {
  pending:
    "Your application has been submitted! The shelter is reviewing your details. This typically takes 5–10 business days.",
  under_review:
    "Your application has been submitted! The shelter is reviewing your details. This typically takes 5–10 business days.",
  approved:
    "Great news! The shelter has approved your application. They will contact you to schedule a home visit.",
  home_visit:
    "Your home visit has been scheduled by the shelter. Please be avialable at home during the scheduled time slot.",
  payment_pending:
    "Your payment has been received! The shelter will confirm and complete your adoption shortly.",
  completed:
    "Congratulations! 🎉 The adoption is complete. Welcome to your new furry family member!",
  rejected:
    "Unfortunately, your application was not approved at this time. Please contact the shelter for more information.",
  dissolved:
    "Your application was automatically cancelled because the shelter did not respond within 10 days. Please browse other pets.",
};

const icons = {
  shield: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  home: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  document: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  paw: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
      <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
      <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
      <path d="M7 10 C4 10 3 13 4.5 15.5 C5.5 17.5 8.5 18.5 9.5 14.5 C10 13 11 13 11 14.5 C12 18.5 15 17.5 16 15.5 C17.5 13 17 10 14 10 C12 10 11 11 9.5 11 C8 11 9 10 7 10Z" />
    </svg>
  ),
};

function DocItem({ label, url }) {
  const isPdf =
    url?.includes("/raw/upload/") || url?.toLowerCase().endsWith(".pdf");

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const ext = isPdf ? "pdf" : "jpg";
      link.download = `${label.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {isPdf ? (
            <svg
              className="w-4 h-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
      </div>
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg py-2 transition-colors"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download
      </button>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function StepItem({ step, activeStep, isCompleted }) {
  const done = isCompleted || step.id < activeStep;
  const active = step.id === activeStep && !isCompleted;
  const upcoming = step.id > activeStep && !isCompleted;
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}
      >
        {done ? (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          step.id
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-semibold ${upcoming ? "text-gray-400" : "text-gray-800"}`}
        >
          {step.title}
        </p>
        <p
          className={`text-xs mt-0.5 ${upcoming ? "text-gray-300" : "text-gray-500"}`}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ── CHAT POPUP ─────────────────────────────────────────────────────────────
// Replace the entire ChatPopup function in ApplicationDetailsPage with this:
function ChatPopup({
  pet,
  onClose,
  socketRef,
  chatOpenRef,
  setUnreadCount,
  shelterOwnerId,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // Add this state at the top of ChatPopup (with other useState declarations):
  const [reportOpen, setReportOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Small delay to ensure parent's socket useEffect has run first
    const timer = setTimeout(() => initChat(), 100);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (globalSocket && !socketRef.current) socketRef.current = globalSocket;
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = (msg) => {
      setMessages((prev) => {
        // Remove temp message that matches this content (sent by me)
        const withoutTemp = prev.filter(
          (m) =>
            !(
              String(m.id).startsWith("temp_") &&
              m.content === msg.content &&
              m.sender_id === msg.sender_id
            ),
        );
        if (withoutTemp.some((m) => m.id === msg.id)) return withoutTemp;
        return [...withoutTemp, msg];
      });
    };
    socket.off("new_message", handler);
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socketRef.current]);

  const initChat = async () => {
    try {
      if (!socketRef.current && globalSocket) {
        socketRef.current = globalSocket;
      }

      const res = await api.post("/conversations/check", { pet_id: pet.id });

      if (res.data.data) {
        const convId = res.data.data.id;
        setConversationId(convId);
        const historyRes = await api.get(`/conversations/${convId}/messages`);
        setMessages(historyRes.data.data); // ← loads ALL history every time

        const joinRoom = (socket, id) => {
          if (socket.connected) socket.emit("join_conversation", id);
          else
            socket.once("connect", () => socket.emit("join_conversation", id));
        };

        if (socketRef.current) {
          joinRoom(socketRef.current, convId);
        } else {
          setTimeout(() => {
            if (socketRef.current) joinRoom(socketRef.current, convId);
          }, 500);
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
      if (!convId) {
        const res = await api.post("/conversations", { pet_id: pet.id });
        convId = res.data.data.id;
        setConversationId(convId);
        const socket = socketRef.current;
        if (socket) {
          if (socket.connected) socket.emit("join_conversation", convId);
          else
            socket.once("connect", () =>
              socket.emit("join_conversation", convId),
            );
        }
      }
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
      setSending(false);
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
          {conversationId && (
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs text-red-300 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            >
              🚩 Report
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
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
          reportedUserId={shelterOwnerId}
          reportedName={pet?.shelter?.name}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationDetailsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const isCompletingPayment = useRef(false);
  const chatOpenRef = useRef(false);
  const [paymentDone, setPaymentDone] = useState(
    location.state?.paymentSuccess || false,
  );
  const socketRef = useRef(null);

  //  Keep chatOpenRef in sync
  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  // Clear the location state so refresh doesn't re-show banner
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      navigate(`/my-applications/${applicationId}`, {
        replace: true,
        state: {},
      });
    }
  }, []);

  useEffect(() => {
    if (!application?.pet?.id) return;
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

    api
      .post("/conversations/check", { pet_id: application.pet.id })
      .then((res) => {
        if (res.data.data) {
          const convId = res.data.data.id;
          socket.on("connect", () => socket.emit("join_conversation", convId));
          if (socket.connected) socket.emit("join_conversation", convId);
        }
      })
      .catch(() => {});

    socket.on("new_message", (msg) => {
      if (msg.sender_id !== currentUser?.id && !chatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    socket.on("reconnect", () => {
  api.post("/conversations/check", { pet_id: application.pet.id })
    .then((res) => {
      if (res.data.data) {
        const convId = res.data.data.id;
        socket.emit("join_conversation", convId);
      }
    })
    .catch(() => {});
});

    return () => {
      socket.disconnect();
      globalSocket = null;
      socketRef.current = null;
    };
  }, [application?.pet?.id]);

  const handlePaymentSuccess = async (method) => {
    isCompletingPayment.current = true;
    setPaymentOpen(false);
    try {
      await AdoptionService.completePayment(applicationId, method);
      await fetchApplication();
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 4000);
    } catch (err) {
      console.error("Payment completion error:", err);
    }
    isCompletingPayment.current = false;
  };

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await AdoptionService.getApplicationById(applicationId);
      setApplication(response.data.data || response.data);
    } catch (err) {
      setError("Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "Application not found."}
          </p>
          <button
            onClick={() => navigate("/my-applications")}
            className="text-blue-600 underline text-sm"
          >
            ← Back to my applications
          </button>
        </div>
      </div>
    );
  }

  const { pet, shelter, status, createdAt, id } = application;
  console.log("shelter:", shelter);
  const shelterOwnerId =
    shelter?.owner_id || shelter?.user_id || application?.shelter?.owner_id;
  const statusKey = status?.toLowerCase().replace(" ", "_") || "pending";
  const statusConfig = STATUS_PROGRESS[statusKey] || STATUS_PROGRESS.pending;
  const shelterRevealed = true;
  const isCompleted = statusKey === "completed";
  const isRejected = statusKey === "rejected";
  const isHomeVisit = statusKey === "home_visit";
  const isPaymentPending = statusKey === "payment_pending";
  // Adjust progress for home visit failures
  const homeVisitFailed =
    isHomeVisit && application?.home_visit_status === "failed";
  const progressValue = homeVisitFailed
    ? 60 // failed — stuck, not moving forward
    : STATUS_PROGRESS[statusKey]?.progress || 0;
  const isDissolved = statusKey === "dissolved";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const downloadCertificate = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await AdoptionService.downloadCertificate(applicationId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = `PetConnect-Certificate-PC-${String(applicationId).padStart(6, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Certificate download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate("/my-applications")}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            My applications
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">
            {pet?.name}'s application
          </span>
        </div>
      </div>

      {/* Payment Success Banner */}
      {paymentDone && (
        <div className="bg-green-50 border border-green-200 px-6 py-4 flex items-center gap-3">
          <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">
                Payment confirmed!
              </p>
              <p className="text-xs text-green-600">
                The shelter has been notified. Your adoption certificate is
                ready to download below.
              </p>
            </div>
            <button
              onClick={() => setPaymentDone(false)}
              className="text-green-400 hover:text-green-600"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 bg-gray-200">
            {pet?.images?.[0] ? (
              <img
                src={
                  pet.images?.[0]?.file_url ||
                  "https://placehold.co/400x250?text=No+Photo"
                }
                alt={pet?.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-blue-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 10c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm-4 9c0-2.21 3.582-4 8-4s8 1.79 8 4v1H3v-1z" />
                </svg>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-extrabold text-white">
                  {pet?.name}
                </h2>
                {pet?.breed && (
                  <span className="mb-1 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {pet.breed}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Application status
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Application ID: {id} • Submitted {formatDate(createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${homeVisitFailed ? "text-red-600 bg-red-50 border-red-200" : statusConfig.color}`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  {homeVisitFailed ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : isRejected ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : isHomeVisit && !application?.home_visit_status ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  ) : (
                    <polyline points="20 6 9 17 4 12" />
                  )}
                </svg>
                {homeVisitFailed
                  ? application.home_visit_attempt >= 2
                    ? "Visit failed — Admin review"
                    : "Visit failed — 1 chance left"
                  : isHomeVisit && !application?.home_visit_status
                    ? "Home visit pending"
                    : statusConfig.label}
              </span>
            </div>

            {!isRejected && !isDissolved && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Processing progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {progressValue}% Complete
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            )}

            <div
              className={`flex gap-3 p-4 rounded-xl ${isRejected ? "bg-red-50" : isDissolved ? "bg-gray-50" : "bg-blue-50"}`}
            >
              <svg
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isRejected ? "text-red-500" : isDissolved ? "text-gray-400" : "text-blue-500"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-gray-700">
                {isHomeVisit && homeVisitFailed
                  ? application.home_visit_attempt >= 2
                    ? "Your home visit failed twice. Your case is under admin review and your account may be restricted."
                    : "Your home visit did not pass. You have been given one more chance. Prepare better for the next visit."
                  : isHomeVisit && application?.home_visit_status === "passed"
                    ? "Your home visit passed! Please proceed to complete the adoption by paying the fee."
                    : STATUS_MESSAGE[statusKey] || STATUS_MESSAGE.pending}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">{icons.paw}</span>Pet details
              </h3>
              <InfoRow label="Breed" value={pet?.breed || "—"} />
              <InfoRow
                label="Age"
                value={
                  pet?.age
                    ? `${pet.age} Year${pet.age > 1 ? "s" : ""} Old`
                    : "—"
                }
              />
              <InfoRow label="Gender" value={pet?.gender || "—"} />
              {pet?.color && <InfoRow label="Color" value={pet.color} />}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 ">
                <svg
                  className="w-5 h-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                About {pet?.name?.toLowerCase()}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {pet?.description ||
                  `${pet?.name} is looking for a loving forever home. Contact the shelter for more information.`}
              </p>
            </div>
          </div>

          {/* Documents Card */}
          {application?.status === "completed" &&
            (pet?.health_record_url ||
              pet?.vaccination_record_url ||
              pet?.sterilization_certificate_url) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Pet documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pet?.health_record_url && (
                    <DocItem
                      label="Health record"
                      url={pet.health_record_url}
                    />
                  )}
                  {pet?.vaccination_record_url && (
                    <DocItem
                      label="Vaccination record"
                      url={pet.vaccination_record_url}
                    />
                  )}
                  {pet?.sterilization_certificate_url && (
                    <DocItem
                      label="Sterilization certificate"
                      url={pet.sterilization_certificate_url}
                    />
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {shelterRevealed && shelter ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Shelter Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {shelter.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shelter.city}
                      {shelter.state ? `, ${shelter.state}` : ""}
                    </p>
                  </div>
                </div>
                {shelter.contact_phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">
                      {shelter.contact_phone}
                    </p>
                  </div>
                )}
                {shelter.contact_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 break-all">
                      {shelter.contact_email}
                    </p>
                  </div>
                )}
                {shelter.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">{shelter.address}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {isCompleted ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 font-medium text-center">
                    Adoption complete! Welcome your new family member.
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium text-center">
                    Contact the shelter for any queries.
                  </div>
                )}
              </div>
            </div>
          ) : !isRejected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Shelter Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <p className="text-xs text-gray-500 font-medium">
                  Shelter details will be revealed once your application is
                  approved.
                </p>
              </div>
            </div>
          ) : null}

          {/* Home Visit Date — show when approved with scheduled date OR during home_visit */}
          {(statusKey === "approved" && application.home_visit_date) ||
          (isHomeVisit &&
            application.home_visit_date &&
            application.home_visit_status !== "passed" &&
            !((application.home_visit_attempt || 0) >= 2)) ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Home visit scheduled
                  </h3>
                  <p className="text-xs text-gray-500">
                    Please be available during this time slot
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-blue-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </span>
                  <span className="text-sm text-gray-800">
                    {new Date(application.home_visit_date).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Time Slot
                  </span>
                  <span className="text-sm font-semibold text-blue-700">
                    {application.home_visit_time_slot || "To be confirmed"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Home Visit Date + Warning/Pay Fee — home_visit only */}
          {isHomeVisit && (
            <div className="space-y-4">
              {/* 1st failure warning */}
              {application.home_visit_status === "failed" &&
                (application.home_visit_attempt || 0) === 1 && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-900">
                          Home visit failed — Attempt 1
                        </h3>
                        <p className="text-xs text-amber-700">
                          You have been given one more chance
                        </p>
                      </div>
                    </div>
                    {application.home_visit_notes && (
                      <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Shelter Feedback
                        </p>
                        <p className="text-sm text-gray-700">
                          {application.home_visit_notes}
                        </p>
                      </div>
                    )}
                    <div className="bg-amber-100 rounded-xl px-4 py-3 border border-amber-200">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        ⚠️ <strong>Please note:</strong> If your second home
                        visit also fails, your adoption application will be
                        cancelled and your account will be flagged for admin
                        review, which <strong>may result in a ban</strong>.
                      </p>
                    </div>
                  </div>
                )}

              {/* 2nd failure — admin review */}
              {application.home_visit_status === "failed" &&
                (application.home_visit_attempt || 0) >= 2 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">❌</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-red-900">
                          Home visit failed — Final
                        </h3>
                        <p className="text-xs text-red-700">
                          Your case is under admin review
                        </p>
                      </div>
                    </div>
                    {application.home_visit_notes && (
                      <div className="bg-white rounded-xl border border-red-200 px-4 py-3 mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Shelter Feedback
                        </p>
                        <p className="text-sm text-gray-700">
                          {application.home_visit_notes}
                        </p>
                      </div>
                    )}
                    <div className="bg-red-100 rounded-xl px-4 py-3 border border-red-200">
                      <p className="text-xs text-red-800 leading-relaxed">
                        ❌ Your home visit has failed twice. An admin will
                        review your case and may{" "}
                        <strong>restrict or ban your account</strong>. You will
                        be notified of the outcome.
                      </p>
                    </div>
                  </div>
                )}

              {/* Passed — show pay fee card */}
              {application.home_visit_status === "passed" && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Home visit complete!
                      </h3>
                      <p className="text-xs text-gray-500">
                        One last step — pay the adoption fee
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Your home visit has been approved. Complete the adoption by
                    paying the fee to officially welcome{" "}
                    <span className="font-semibold text-blue-700">
                      {pet?.name}
                    </span>{" "}
                    into your family.
                  </p>
                  <button
                    onClick={() => setPaymentOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md shadow-blue-200"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Complete adoption — Pay fee
                  </button>
                </div>
              )}

              {/* No outcome yet — waiting */}
              {!application.home_visit_status && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Home visit in progress
                      </h3>
                      <p className="text-xs text-gray-500">
                        The shelter is reviewing the visit outcome. You'll be
                        notified soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ask Shelter button with unread badge */}
          {!isRejected && !isDissolved && (
            <button
              onClick={() => {
                setChatOpen(true);
                chatOpenRef.current = true;
                setUnreadCount(0);
              }}
              className="relative flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors text-sm"
            >
              <MessageCircle size={16} />
              Ask shelter
              {unreadCount > 0 && !chatOpen && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {!isRejected && !isDissolved && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">
                Next steps
              </h3>
              <div className="space-y-5">
                {STEPS.map((step, idx) => (
                  <div key={step.id}>
                    <StepItem
                      step={step}
                      activeStep={statusConfig.step}
                      isCompleted={isCompleted}
                    />
                    {idx < STEPS.length - 1 && (
                      <div className="ml-4 mt-1 mb-1 w-px h-4 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Certificate — only when completed */}
          {isCompleted && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Adoption certificate
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Download your official PetConnect adoption certificate as a PDF
                keepsake.
              </p>
              <button
                onClick={downloadCertificate}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Downloading
                    Certificate...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download certificate (PDF)
                  </>
                )}
              </button>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm font-semibold text-red-700 mb-1">
                Application not approved
              </p>
              {application?.rejection_reason ? (
                <div className="bg-white border border-red-100 rounded-xl px-4 py-3 mb-4 text-left">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1 ">
                    Reason from shelter
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {application.rejection_reason}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-500 mb-4">
                  Please contact the shelter for more information.
                </p>
              )}
              <button
                onClick={() => navigate("/browse")}
                className="text-xs bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Browse other pets
              </button>
            </div>
          )}

          {isDissolved && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Application cancelled
              </p>
              <p className="text-xs text-gray-400 mb-4">
                This application was automatically cancelled because the shelter
                did not respond within 10 days.
              </p>
              <button
                onClick={() => navigate("/browse")}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Browse other pets
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: chatOpen ? "block" : "none" }}>
        {pet && (
          <ChatPopup
            key={pet?.id}
            pet={{ ...pet, shelter }}
            shelterOwnerId={shelterOwnerId}
            onClose={() => {
              setChatOpen(false);
              chatOpenRef.current = false;
            }}
            socketRef={socketRef}
            chatOpenRef={chatOpenRef}
            setUnreadCount={setUnreadCount}
          />
        )}
      </div>

      {paymentOpen && pet && (
        <PaymentModal
          pet={pet}
          shelter={shelter}
          onClose={() => setPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {/* Payment Success Popup */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounce-once">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment successful! 🎉
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Your adoption fee has been received.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The shelter will confirm and complete your adoption shortly.
            </p>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Done 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
