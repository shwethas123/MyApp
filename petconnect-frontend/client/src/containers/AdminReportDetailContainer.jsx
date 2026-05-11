// src/containers/AdminReportDetailContainer.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../services/Apiservices";
import AdminReportDetail from "../components/AdminReportDetail";

const AdminReportDetailContainer = () => {
  const { id } = useParams();

  const [report, setReport]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [actionLoading, setAL]      = useState(false);
  const [messages, setMessages]     = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote]     = useState("");
  const [resolveError, setResolveError]         = useState("");

  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason]       = useState("");
  const [banNote, setBanNote]           = useState("");
  const [banError, setBanError]         = useState("");

  const showToast = (msg, color = "#22c55e") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = async (reporterId, reportedId) => {
    setMsgLoading(true);
    try {
      const res = await ApiService.get(`/admin/conversations/${reporterId}/${reportedId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMsgLoading(false);
    }
  };

  // Single fetchReport — no duplicate
  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await ApiService.get(`/admin/reports/${id}`);
      const reportData = res.data.data;
      setReport(reportData);

      if (reportData?.reporter?.id && reportData?.reportedUser?.id) {
        await fetchMessages(reportData.reporter.id, reportData.reportedUser.id);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load report.", "#EF4444");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [id]);

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      setResolveError("Please describe how the issue was resolved.");
      return;
    }
    setAL(true);
    try {
      await ApiService.patch(`/admin/reports/${id}`, {
        status: "resolved",
        resolution_note: resolutionNote.trim(),
      });
      showToast("✅ Report marked as resolved!");
      setShowResolveModal(false);
      setResolutionNote("");
      setResolveError("");
      await fetchReport();
    } catch (err) {
      console.error(err);
      showToast("Failed to resolve report.", "#EF4444");
    } finally {
      setAL(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      setBanError("Please provide a reason for banning this user.");
      return;
    }
    setAL(true);
    try {
      await ApiService.post(`/admin/reports/${id}/ban`, {
        reason: banReason.trim(),
        resolution_note: banNote.trim() || `User banned: ${banReason.trim()}`,
      });
      showToast("🚫 User banned and added to blacklist!", "#EF4444");
      setShowBanModal(false);
      setBanReason("");
      setBanNote("");
      setBanError("");
      await fetchReport();
    } catch (err) {
      console.error(err);
      showToast("Failed to ban user.", "#EF4444");
    } finally {
      setAL(false);
    }
  };

  return (
    <AdminReportDetail
      id={id}
      report={report}
      loading={loading}
      toast={toast}
      actionLoading={actionLoading}
      messages={messages}
      msgLoading={msgLoading}
      // Resolve modal
      showResolveModal={showResolveModal}
      resolutionNote={resolutionNote}
      resolveError={resolveError}
      onOpenResolveModal={() => setShowResolveModal(true)}
      onCloseResolveModal={() => {
        setShowResolveModal(false);
        setResolutionNote("");
        setResolveError("");
      }}
      onResolutionNoteChange={(val) => {
        setResolutionNote(val);
        setResolveError("");
      }}
      onResolve={handleResolve}
      // Ban modal
      showBanModal={showBanModal}
      banReason={banReason}
      banNote={banNote}
      banError={banError}
      onOpenBanModal={() => setShowBanModal(true)}
      onCloseBanModal={() => {
        setShowBanModal(false);
        setBanReason("");
        setBanNote("");
        setBanError("");
      }}
      onBanReasonChange={(val) => {
        setBanReason(val);
        setBanError("");
      }}
      onBanNoteChange={(val) => setBanNote(val)}
      onBan={handleBan}
    />
  );
};

export default AdminReportDetailContainer;