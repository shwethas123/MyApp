import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AdoptionService from "../services/Adoptionservice.js";
import useAuth from "../hooks/AuthContext";

// Layout
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import PdfViewerModal from "../components/common/PdfViewerModal";

// Application-specific components
import ConfirmModal from "../components/shelter/applications/ConfirmModal";
import HomeVisitScheduleModal from "../components/shelter/applications/HomeVisitScheduleModal";
import HomeVisitScheduleCard from "../components/shelter/applications/HomeVisitScheduleCard";
import HomeVisitCard from "../components/shelter/applications/HomeVisitCard";
import HomeVisitOutcomeCard from "../components/shelter/applications/HomeVisitOutcomeCard";
import ApplicationApplicantCard from "../components/shelter/applications/ApplicationApplicantCard";
import ApplicationPetCard from "../components/shelter/applications/ApplicationPetCard";
// Config / constants
import {
  STATUS_CONFIG,
  PROGRESS_STEPS,
  STATUS_ORDER,
  getActionsForStatus,
} from "../constants/adoptionApplicationConfig";

// ─────────────────────────────────────────────────────────────────────────────

export default function ShelterApplicationDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const shelterId = currentUser?.shelter?.id;

  // ── Data ──────────────────────────────────────────────────────────────────
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Action feedback ───────────────────────────────────────────────────────
  const [updating, setUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null); // which button is spinning
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // ── Confirm modal (approve / reject) ─────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    status: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // ── Home visit upload ─────────────────────────────────────────────────────
  const [homeVisitSubmitting, setHomeVisitSubmitting] = useState(false);
  const [homeVisitSubmitted, setHomeVisitSubmitted] = useState(false);

  // ── Home visit outcome ────────────────────────────────────────────────────
  const [outcomeSubmitting, setOutcomeSubmitting] = useState(false);

  // ── Schedule modal ────────────────────────────────────────────────────────
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleSlot, setScheduleSlot] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // ── PDF viewer ────────────────────────────────────────────────────────────
  const [pdfUrl, setPdfUrl] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await AdoptionService.getShelterApplicationById(
        shelterId,
        applicationId,
      );
      const data = res.data.data;
      setApplication(data);

      // Restore schedule state from API data
      if (data?.home_visit_date) {
        setScheduleDate(data.home_visit_date.split("T")[0]);
        setScheduleSubmitted(true);
      }
      if (data?.home_visit_time_slot) {
        setScheduleSlot(data.home_visit_time_slot);
      }

      // Lock the HomeVisitCard unless we're waiting for a re-upload after a
      // first failed attempt
      const isFailedAwaitingReupload =
        data?.status === "home_visit" &&
        data?.home_visit_status === "failed" &&
        (data?.home_visit_attempt || 0) < 2;

      if (data?.status === "home_visit" && !isFailedAwaitingReupload) {
        setHomeVisitSubmitted(true);
      } else if (isFailedAwaitingReupload) {
        setHomeVisitSubmitted(false);
      }
    } catch (err) {
      setError("Failed to load application details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── API actions ───────────────────────────────────────────────────────────

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    setUpdatingStatus(newStatus);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      await AdoptionService.updateApplicationStatus(
        applicationId,
        newStatus,
        newStatus === "rejected" ? rejectionReason : undefined,
      );
      setApplication((prev) => ({ ...prev, status: newStatus }));
      setUpdateSuccess(
        `Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus} successfully!`,
      );
      setTimeout(() => setUpdateSuccess(null), 3000);
      setRejectionReason("");
    } catch (err) {
      setUpdateError("Failed to update status. Please try again.");
      setTimeout(() => setUpdateError(null), 3000);
      console.error(err);
    } finally {
      setUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const handleScheduleHomeVisit = async () => {
    if (!scheduleDate || !scheduleSlot) return false;
    setScheduleSubmitting(true);
    try {
      await AdoptionService.scheduleHomeVisit(applicationId, {
        home_visit_date: scheduleDate,
        home_visit_time_slot: scheduleSlot,
      });
      setScheduleSubmitted(true);
      setUpdateSuccess("Home visit scheduled! Adopter has been notified.");
      setTimeout(() => setUpdateSuccess(null), 3000);
      return true;
    } catch (err) {
      console.error("Schedule failed:", err?.response?.data || err.message);
      setUpdateError(
        err?.response?.data?.message ||
          "Failed to schedule home visit. Please try again.",
      );
      setTimeout(() => setUpdateError(null), 3000);
      return false;
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleHomeVisitSubmit = async (formData) => {
    setHomeVisitSubmitting(true);
    try {
      await AdoptionService.submitHomeVisit(applicationId, formData);
      // Refetch so Cloudinary URLs come back and lock the card correctly
      await fetchApplication();
      setHomeVisitSubmitted(true);
      setUpdateSuccess(
        "Home visit photos uploaded! Now mark the outcome below.",
      );
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err) {
      console.error("Home visit submit failed:", err);
      setUpdateError("Failed to submit home visit. Please try again.");
      setTimeout(() => setUpdateError(null), 3000);
    } finally {
      setHomeVisitSubmitting(false);
    }
  };

  const handleHomeVisitOutcome = async (outcome, notes) => {
    setOutcomeSubmitting(true);
    try {
      await AdoptionService.submitHomeVisitOutcome(applicationId, {
        outcome,
        notes,
      });
      await fetchApplication();
      if (outcome === "failed") setHomeVisitSubmitted(false); // unlock re-upload
      if (outcome === "passed") {
        setUpdateSuccess(
          "Home visit passed! Waiting for the adopter to proceed with payment.",
        );
        setTimeout(() => setUpdateSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Outcome submit failed:", err);
      setUpdateError("Failed to submit outcome. Please try again.");
      setTimeout(() => setUpdateError(null), 3000);
    } finally {
      setOutcomeSubmitting(false);
    }
  };

  // ── Schedule modal confirm handler ────────────────────────────────────────
  const handleScheduleModalConfirm = async () => {
    setScheduleModalOpen(false);
    if (isRescheduling) {
      // Only reschedule — don't change status or send the approval notification
      await handleScheduleHomeVisit();
      setIsRescheduling(false);
    } else {
      // Fresh approval: update status first, then schedule
      await handleStatusUpdate("approved");
      await handleScheduleHomeVisit();
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Loading / error screens ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <ShelterSidebar pendingCount={0} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-5xl animate-spin">🐾</div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen">
        <ShelterSidebar pendingCount={0} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate("/shelter/adoptions")}
              className="text-blue-600 text-sm underline"
            >
              ← Back to adoption requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { status, createdAt } = application;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const actions = getActionsForStatus(status);
  const currentStep = STATUS_ORDER.indexOf(status);
  const isTerminal = status === "completed" || status === "rejected";
  const missingUpi = status === "home_visit" && !application?.shelter?.upi_id;

  // ── Pending deadline banner values ────────────────────────────────────────
  const reviewDeadline = (() => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 10);
    return d;
  })();
  const daysUntilDeadline = Math.ceil(
    (reviewDeadline - new Date()) / (1000 * 60 * 60 * 24),
  );
  const deadlineLabel = reviewDeadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ShelterSidebar pendingCount={0} />

      <div className="flex-1 overflow-y-auto mt-[44px] lg:mt-0">
        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0 sm:justify-between sticky top-0 z-10">
          <button
            onClick={() => navigate("/shelter/adoptions")}
            className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            ←{" "}
            <span className="hidden sm:inline">Back to adoption requests</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">
              Application ID: #{application.id} • {formatDate(createdAt)}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
              />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          {/* ── Page heading + action buttons ── */}
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Adoption management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review applicant details and take action
              </p>
            </div>

            {!isTerminal && (
              <div className="flex flex-wrap items-center gap-2">
                {actions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() =>
                      setConfirmModal({ open: true, status: action.value })
                    }
                    disabled={updating}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${action.style}`}
                  >
                    {updating && updatingStatus === action.value
                      ? "Updating..."
                      : action.label}
                  </button>
                ))}
              </div>
            )}

            {status === "completed" && (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold w-fit">
                Adoption complete
              </span>
            )}
            {status === "rejected" && (
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold w-fit">
                Application rejected
              </span>
            )}
          </div>

          {/* ── Contextual banners ── */}

          {/* Missing UPI warning */}
          {missingUpi && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-3 rounded-xl mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  You haven't added a UPI ID yet. Adopters won't know where to
                  pay the adoption fee.
                </span>
              </div>
              <button
                onClick={() => navigate("/shelter/profile")}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors"
              >
                Add UPI ID →
              </button>
            </div>
          )}

          {/* Payment received banner */}
          {status === "payment_pending" && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-teal-800">
                Payment received from {application.applicant?.first_name}!
              </p>
              <p className="text-xs text-teal-600">
                {application.pet?.name}'s adoption fee has been paid via{" "}
                <strong>
                  {application?.payment_method || "unknown method"}
                </strong>
                . Click "Complete Adoption" to finalise.
              </p>
            </div>
          )}

          {/* Completed banner */}
          {status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-green-800">
                Payment received from {application.applicant?.first_name}!
              </p>
              <p className="text-xs text-green-600">
                {application.pet?.name}'s adoption fee has been paid via{" "}
                {application?.payment_method || "the adopter"}. The adoption is
                now complete.
              </p>
            </div>
          )}

          {/* Pending review deadline banner */}
          {status === "pending" && (
            <div
              className={`border rounded-xl px-4 py-3 mb-4 flex items-center gap-3 ${
                daysUntilDeadline <= 3
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <span className="text-lg">
                {daysUntilDeadline <= 3 ? "🚨" : "⏰"}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {daysUntilDeadline <= 3
                    ? `Urgent: Only ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"} left to review!`
                    : `Review by ${deadlineLabel}`}
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  This application will be automatically cancelled on{" "}
                  <strong>{deadlineLabel}</strong> if no action is taken.
                </p>
              </div>
            </div>
          )}

          {/* API success / error feedback */}
          {updateSuccess && (
            <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-xl mb-4 border border-green-200">
              {updateSuccess}
            </div>
          )}
          {updateError && (
            <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-4 border border-red-200">
              {updateError}
            </div>
          )}

          {/* ── Progress bar (hidden for rejected) ── */}
          {status !== "rejected" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4">
                Adoption Process
              </p>
              <div className="relative flex items-start justify-between">
                {/* Grey baseline */}
                <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />
                {/* Blue progress fill */}
                <div
                  className="absolute top-4 h-0.5 bg-blue-600 z-0 transition-all duration-500"
                  style={{
                    left: "10%",
                    width:
                      status === "completed"
                        ? "80%"
                        : currentStep === 0
                          ? "0%"
                          : `${(currentStep / (PROGRESS_STEPS.length - 1)) * 80}%`,
                  }}
                />
                {PROGRESS_STEPS.map((step, idx) => {
                  const done =
                    STATUS_ORDER.indexOf(status) > idx ||
                    status === "completed";
                  const active = STATUS_ORDER.indexOf(status) === idx;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center z-10 flex-1 min-w-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 ${
                          done
                            ? "bg-blue-600 border-blue-600 text-white"
                            : active
                              ? "bg-white border-blue-600 text-blue-600"
                              : "bg-white border-gray-200 text-gray-400"
                        }`}
                      >
                        {done ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-[9px] sm:text-[11px] font-semibold text-center leading-tight px-1 ${
                          active
                            ? "text-blue-600"
                            : done
                              ? "text-gray-700"
                              : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Main 2-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applicant info */}
            <ApplicationApplicantCard
              application={application}
              onViewPdf={(url) => setPdfUrl(url)}
            />

            {/* Pet info */}
            <ApplicationPetCard pet={application.pet} />

            {/* Scheduled visit summary — shown when approved/home_visit and already scheduled */}
            {(status === "approved" || status === "home_visit") &&
              scheduleSubmitted &&
              application?.home_visit_status !== "passed" &&
              !(
                application?.home_visit_status === "failed" &&
                (application?.home_visit_attempt || 0) >= 2
              ) && (
                <HomeVisitScheduleCard
                  scheduleDate={scheduleDate}
                  scheduleSlot={scheduleSlot}
                  onReschedule={() => {
                    setIsRescheduling(true);
                    setScheduleModalOpen(true);
                  }}
                />
              )}

            {/* Home visit photo upload card */}
            {(status === "approved" ||
              (status === "home_visit" &&
                application.home_visit_status === "failed" &&
                (application.home_visit_attempt || 0) < 2) ||
              (status === "home_visit" &&
                application.home_visit_status === null)) && (
              <HomeVisitCard
                onSubmit={handleHomeVisitSubmit}
                submitting={homeVisitSubmitting}
                alreadySubmitted={homeVisitSubmitted}
                existingPhotos={application.home_visit_photos || []}
              />
            )}

            {/* Home visit outcome card */}
            {status === "home_visit" &&
              application?.home_visit_status !== "passed" && (
                <HomeVisitOutcomeCard
                  application={application}
                  onOutcome={handleHomeVisitOutcome}
                  submitting={outcomeSubmitting}
                  alreadySubmitted={homeVisitSubmitted}
                />
              )}
          </div>
        </div>
      </div>

      {/* ── Overlays / modals (rendered outside the scroll container) ── */}

      <HomeVisitScheduleModal
        isOpen={scheduleModalOpen}
        scheduleDate={scheduleDate}
        scheduleSlot={scheduleSlot}
        onDateChange={setScheduleDate}
        onSlotChange={setScheduleSlot}
        onConfirm={handleScheduleModalConfirm}
        submitting={scheduleSubmitting}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        title={
          confirmModal.status === "rejected"
            ? "Reject application?"
            : confirmModal.status==="completed"
            ? "Complete adoption?"
            : "Approve application?"
        }
        message={
          confirmModal.status === "rejected"
            ? "This will reject the adoption application and make the pet available again. This action cannot be undone."
            : confirmModal.status === "completed"
            ? "This will complete the adoption process."
            : "This will approve the adoption application and move it to the next stage."
        }
        confirmLabel={
          confirmModal.status === "rejected" ? "Yes, reject" : confirmModal.status === "completed" ? "Yes, complete" : "Yes, approve"
        }
        confirmColor={
          confirmModal.status === "rejected"
            ? "bg-red-500 hover:bg-red-600"
            : confirmModal.status === "completed"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
        isRejection={confirmModal.status === "rejected"}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onConfirm={() => {
          if (confirmModal.status === "approved") {
            // Open schedule modal before changing status
            setConfirmModal({ open: false, status: null });
            setScheduleModalOpen(true);
          } else if (confirmModal.status === "completed") {
            // For completing adoption, we can directly update status without extra input
            handleStatusUpdate("completed");
            setConfirmModal({ open: false, status: null });
          }
          else {
            handleStatusUpdate(confirmModal.status);
            setConfirmModal({ open: false, status: null });
          }
        }}
        onCancel={() => {
          setConfirmModal({ open: false, status: null });
          setRejectionReason("");
        }}
      />

      {pdfUrl && (
        <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </div>
  );
}
