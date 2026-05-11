// src/components/AdminReportDetail.jsx
import {
  ShieldCheck, Ban, Loader2, AlertTriangle, CheckCircle,
} from "lucide-react";
import AdminSidebar from "./common/Adminsidebar";

// ── Small reusable display pieces ────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    pending:   { bg: "#FFF3CD", color: "#856404" },
    reviewed:  { bg: "#CCE5FF", color: "#004085" },
    resolved:  { bg: "#D4EDDA", color: "#155724" },
    dismissed: { bg: "#E2E3E5", color: "#383D41" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
      {status}
    </span>
  );
};

const AccountBadge = ({ status }) => {
  const styles = {
    Active:  { bg: "#D1FAE5", color: "#065F46" },
    Pending: { bg: "#FFF3CD", color: "#856404" },
    Banned:  { bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = styles[status] || styles.Pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700 }}>
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
    <span style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "capitalize", letterSpacing: "0.06em" }}>
      {label}
    </span>
    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
      {value || "—"}
    </span>
  </div>
);

const SectionDivider = ({ title }) => (
  <div style={{ borderTop: "1px solid #F3F4F6", margin: "8px 0 20px" }}>
    <p style={{ fontSize: "10px", fontWeight: 700, color: "#1B3A4B", textTransform: "capitalize", letterSpacing: "0.07em", marginTop: "20px", marginBottom: "16px" }}>
      {title}
    </p>
  </div>
);

// ── Confirm modal — receives children for extra form fields ───────────────────

const ConfirmModal = ({ message, onConfirm, onCancel, confirmLabel = "Confirm", confirmColor = "#EF4444", children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: "20px" }}>
    <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
      <p style={{ fontSize: "15px", color: "#111827", marginBottom: "16px", fontWeight: 600 }}>{message}</p>
      {children}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
        <button
          onClick={onCancel}
          style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#374151", fontWeight: 500 }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{ padding: "9px 20px", borderRadius: "8px", border: "none", background: confirmColor, cursor: "pointer", fontSize: "13px", color: "#fff", fontWeight: 700 }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ── Helper: format a date string safely ──────────────────────────────────────
// Sequelize with underscored:true returns createdAt (camelCase) in JS objects
// even though the DB column is created_at. Handle both just in case.
const formatDate = (dateVal, opts = { month: "long", day: "numeric", year: "numeric" }) => {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-US", opts);
};

// ── Pure presentational component ────────────────────────────────────────────

const AdminReportDetail = ({
  id,
  report,
  loading,
  toast,
  actionLoading,
  // Resolve modal props
  showResolveModal,
  resolutionNote,
  resolveError,
  onOpenResolveModal,
  onCloseResolveModal,
  onResolutionNoteChange,
  onResolve,
  // Ban modal props
  showBanModal,
  banReason,
  banNote,
  banError,
  onOpenBanModal,
  onCloseBanModal,
  onBanReasonChange,
  onBanNoteChange,
   messages,       
  msgLoading,  
  onBan,
}) => {
  const isResolved      = report?.status === "resolved";
  const isDismissed     = report?.status === "dismissed";
  const isBanned        = report?.reportedUser?.account_status === "Banned";
  const actionsDisabled = isResolved || isDismissed || actionLoading;

  // Sequelize returns createdAt (camelCase) for JS objects even with underscored:true
  // Support both formats defensively
  const reportDate   = report?.createdAt   ?? report?.created_at;
  const reporterDate = report?.reporter?.createdAt  ?? report?.reporter?.created_at;
  const reportedDate = report?.reportedUser?.createdAt ?? report?.reportedUser?.created_at;

  return (
    <>
      <style>{`
        .rd-page { display: flex; min-height: 100vh; font-family: 'DM Sans','Segoe UI',sans-serif; background: #F3F4F6; }
        .rd-main  { flex: 1; padding: 28px; overflow-y: auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .rd-main { padding: 16px; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: toast.color, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Resolve Modal ─────────────────────────────────────────────────── */}
      {showResolveModal && (
        <ConfirmModal
          message="How was this issue resolved?"
          confirmLabel={actionLoading ? "Saving..." : "Mark Resolved"}
          confirmColor="#10B981"
          onConfirm={onResolve}
          onCancel={onCloseResolveModal}
        >
          <textarea
            value={resolutionNote}
            onChange={(e) => onResolutionNoteChange(e.target.value)}
            placeholder="Describe how the issue was resolved (required)..."
            rows={4}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: resolveError ? "1.5px solid #DC2626" : "1.5px solid #D1D5DB", fontSize: "13px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {resolveError && (
            <p style={{ color: "#DC2626", fontSize: "12px", margin: "4px 0 0" }}>⚠ {resolveError}</p>
          )}
        </ConfirmModal>
      )}

      {/* ── Ban Modal ─────────────────────────────────────────────────────── */}
      {showBanModal && (
        <ConfirmModal
          message={`Ban ${report?.reportedUser?.first_name} ${report?.reportedUser?.last_name}? They will be blacklisted and unable to login.`}
          confirmLabel={actionLoading ? "Banning..." : "Ban User"}
          confirmColor="#EF4444"
          onConfirm={onBan}
          onCancel={onCloseBanModal}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "capitalize", letterSpacing: "0.05em" }}>Ban Reason *</label>
              <input
                value={banReason}
                onChange={(e) => onBanReasonChange(e.target.value)}
                placeholder="e.g. Harassment, Spam, Abuse..."
                style={{ width: "100%", marginTop: "6px", padding: "9px 12px", borderRadius: "8px", border: banError ? "1.5px solid #DC2626" : "1.5px solid #D1D5DB", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              {banError && (
                <p style={{ color: "#DC2626", fontSize: "12px", margin: "4px 0 0" }}>⚠ {banError}</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "capitalize", letterSpacing: "0.05em" }}>Resolution Note (optional)</label>
              <textarea
                value={banNote}
                onChange={(e) => onBanNoteChange(e.target.value)}
                placeholder="Any additional notes for this resolution..."
                rows={3}
                style={{ width: "100%", marginTop: "6px", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #D1D5DB", fontSize: "13px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </ConfirmModal>
      )}

      <div className="rd-page">
        <AdminSidebar />

        <div className="rd-main">

          {/* Page heading */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>Report #{id}</h2>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6B7280" }}>Full report details and actions</p>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
              <Loader2 size={28} color="#4F46E5" style={{ animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : !report ? (
            <div style={{ textAlign: "center", padding: "80px", color: "#9CA3AF" }}>Report not found.</div>
          ) : (
            <div style={{ width: "100%" }}>
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px" }}>

                {/* ── Header row: status + action buttons ─────────────── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <AlertTriangle size={20} color="#F59E0B" />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Report Status</div>
                      <div style={{ marginTop: "4px" }}><StatusBadge status={report.status} /></div>
                    </div>
                  </div>

                  {!isResolved && !isDismissed && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {!isBanned && (
                        <button
                          disabled={actionsDisabled}
                          onClick={onOpenBanModal}
                          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: actionsDisabled ? "#F3F4F6" : "#FEE2E2", color: actionsDisabled ? "#9CA3AF" : "#DC2626", border: "none", borderRadius: "10px", cursor: actionsDisabled ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700 }}>
                          <Ban size={14} /> Block
                        </button>
                      )}
                      <button
                        disabled={actionsDisabled}
                        onClick={onOpenResolveModal}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: actionsDisabled ? "#F3F4F6" : "#D1FAE5", color: actionsDisabled ? "#9CA3AF" : "#065F46", border: "none", borderRadius: "10px", cursor: actionsDisabled ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Resolve
                      </button>
                    </div>
                  )}

                  {(isResolved || isDismissed) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isResolved ? "#065F46" : "#6B7280", fontSize: "13px", fontWeight: 600 }}>
                      <CheckCircle size={16} />
                      {isResolved ? "This report has been resolved." : "This report was dismissed."}
                    </div>
                  )}
                </div>

                {/* ── Report Details ───────────────────────────────────── */}
                <SectionDivider title="Report Details" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <InfoRow label="Reason"         value={report.reason} />
                  <InfoRow label="Report ID"       value={`#${report.id}`} />
                  {/* FIX: use formatDate helper which handles both createdAt and created_at */}
                  <InfoRow label="Submitted"       value={formatDate(reportDate)} />
                  <InfoRow label="Conversation ID" value={report.conversation_id ? `#${report.conversation_id}` : "—"} />
                </div>

                {/* Description — always render the block; show placeholder if empty */}
                <div style={{ marginTop: "16px", padding: "14px", background: "#F9FAFB", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "", letterSpacing: "0.07em", margin: "0 0 8px" }}>
                    Description
                  </p>
                  {/* FIX: always render block; show "No description provided" instead of hiding it */}
                  <p style={{ fontSize: "13px", color: report.details ? "#374151" : "#9CA3AF", margin: 0, lineHeight: 1.6, fontStyle: report.details ? "normal" : "italic" }}>
                    {report.details || "No description provided."}
                  </p>
                </div>

                {/* Resolution Note — shown after resolve */}
                {report.resolution_note && (
                  <div style={{ marginTop: "16px", padding: "14px", background: "#D1FAE5", borderRadius: "8px", border: "1px solid #6EE7B7" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
                      Resolution note
                    </p>
                    <p style={{ fontSize: "13px", color: "#065F46", margin: 0, lineHeight: 1.6 }}>
                      {report.resolution_note}
                    </p>
                  </div>
                )}

                {/* ── Reported By ──────────────────────────────────────── */}
                <SectionDivider title="Reported By" />
                <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "18px", border: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#4F46E5", flexShrink: 0 }}>
                      {report.reporter?.first_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                        {report.reporter?.first_name} {report.reporter?.last_name}
                      </div>
                      <AccountBadge status={report.reporter?.account_status} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <InfoRow label="Email"  value={report.reporter?.email} />
                    <InfoRow label="Phone"  value={report.reporter?.phone} />
                    <InfoRow label="Role"   value={report.reporter?.roleDetails?.name} />
                    {/* FIX: use formatDate helper */}
                    <InfoRow label="Joined" value={formatDate(reporterDate, { month: "short", day: "numeric", year: "numeric" })} />
                  </div>
                </div>

                {/* ── Reported User ────────────────────────────────────── */}
                <SectionDivider title="Reported User" />
                <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "18px", border: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#DC2626", flexShrink: 0 }}>
                      {report.reportedUser?.first_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                        {report.reportedUser?.first_name} {report.reportedUser?.last_name}
                      </div>
                      <AccountBadge status={report.reportedUser?.account_status} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <InfoRow label="Email"  value={report.reportedUser?.email} />
                    <InfoRow label="Phone"  value={report.reportedUser?.phone} />
                    <InfoRow label="Role"   value={report.reportedUser?.roleDetails?.name} />
                    {/* FIX: use formatDate helper */}
                    <InfoRow label="Joined" value={formatDate(reportedDate, { month: "short", day: "numeric", year: "numeric" })} />
                  </div>
                  {isBanned && (
                    <div style={{ marginTop: "14px", padding: "10px 14px", background: "#FEE2E2", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Ban size={14} color="#DC2626" />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626" }}>This user is currently banned</span>
                    </div>
                  )}
                </div>
                  <div style={{
                  background: "#F9FAFB", borderRadius: "12px",
                  padding: "20px", border: "1px solid #F3F4F6",
                  marginTop: "24px"
                }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                    💬 Message History
                  </h3>
                  <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6B7280" }}>
                    Conversation between the reporter and reported user.
                  </p>
                  {msgLoading ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}>
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{
                      textAlign: "center", padding: "24px",
                      background: "#fff", borderRadius: "12px",
                      color: "#9CA3AF", fontSize: "14px",
                      border: "1px solid #F3F4F6"
                    }}>
                      No messages found between these users.
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: "400px", overflowY: "auto",
                      display: "flex", flexDirection: "column", gap: "10px",
                      padding: "4px 2px"
                    }}>
                      {messages.map((msg) => {
                        const isReporter = msg.sender_id === report?.reporter?.id;
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              flexDirection: isReporter ? "row" : "row-reverse",
                              gap: "10px", alignItems: "flex-end"
                            }}
                          >
                            <div style={{
                              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                              background: isReporter ? "#EEF2FF" : "#FEE2E2",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "11px", fontWeight: 700,
                              color: isReporter ? "#4F46E5" : "#EF4444"
                            }}>
                              {msg.sender?.first_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div style={{ maxWidth: "65%" }}>
                              <div style={{
                                fontSize: "11px", color: "#9CA3AF", marginBottom: "3px",
                                textAlign: isReporter ? "left" : "right"
                              }}>
                                {msg.sender?.first_name} {msg.sender?.last_name}
                                {" · "}
                                {new Date(msg.created_at ?? msg.createdAt).toLocaleString("en-US", {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit"
                                })}
                              </div>
                              <div style={{
                                background: isReporter ? "#EEF2FF" : "#FEE2E2",
                                color: isReporter ? "#1E1B4B" : "#7F1D1D",
                                borderRadius: isReporter ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                                padding: "10px 14px",
                                fontSize: "13px", lineHeight: "1.5",
                                wordBreak: "break-word",
                                userSelect: "none",
                                pointerEvents: "none",
                              }}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{
                    marginTop: "12px", display: "flex", alignItems: "center",
                    gap: "6px", color: "#9CA3AF", fontSize: "12px"
                  }}>
                    <span>🔒</span> Read-only view — Admin cannot send messages.
                  </div>
                </div> 

              </div>{/* end single card */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReportDetail;