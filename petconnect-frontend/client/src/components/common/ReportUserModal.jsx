import { useState } from "react";
import { X, Flag, Loader2 } from "lucide-react";
import api from "../../services/Apiservices";

const REPORT_REASONS = [
  "Inappropriate messages",
  "Spam or scam",
  "Abusive or threatening behavior",
  "Fake profile or impersonation",
  "Harassment",
  "Other",
];

/**
 * ReportUserModal — reusable report modal
 *
 * Props:
 *  conversationId  {number}   – the conversation being reported
 *  reportedUserId  {number}   – the user being reported
 *  reportedName    {string}   – display name of reported user
 *  onClose         {fn}       – called when modal is dismissed
 *  onSuccess       {fn}       – optional callback after successful submit
 */
export default function ReportUserModal({
  conversationId,
  reportedUserId,
  reportedName = "this user",
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [confirmGenuine, setConfirmGenuine] = useState(false);
  const [confirmData, setConfirmData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    reason && confirmGenuine && confirmData && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      
      await api.post("/reports", {
        conversation_id: conversationId,
        reported_user_id: reportedUserId,
        reason,
        details,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      console.error("Report error:", err);
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">Report User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          // ── Success State ──
          <div className="px-5 py-10 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Report Submitted</p>
            <p className="text-xs text-gray-400 mb-5">
              Our Trust & Safety team will review your report shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          // ── Form ──
          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-gray-500">
              Please provide details about the issue. Our Trust & Safety team will review your report shortly.
            </p>

            {/* Reason */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Reason for Report <span className="text-red-400">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 bg-white"
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Please provide specific details about the behavior or information you are reporting..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 resize-none placeholder-gray-300"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmGenuine}
                  onChange={(e) => setConfirmGenuine(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs text-gray-600">
                  I confirm that this report is genuine and not submitted for malicious purposes.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmData}
                  onChange={(e) => setConfirmData(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs text-gray-600">
                  I understand that recent messages and relevant data will be included in this report for review.
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors disabled:opacity-40"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}