import { useState } from "react";

export default function HomeVisitOutcomeCard({
  application,
  onOutcome,
  submitting,
  alreadySubmitted,
}) {
  const [activeModal, setActiveModal] = useState(null); // "passed" | "failed" | null
  const [failureNotes, setFailureNotes] = useState("");

  const attempt = application.home_visit_attempt || 0;
  const visitStatus = application.home_visit_status;

  // ── Guard: nothing to render when already passed ──────────────────────────
  if (visitStatus === "passed") return null;

  // ── C: Failed twice — show advisory banner only ───────────────────────────
  if (visitStatus === "failed" && attempt >= 2) {
    return (
      <div className="lg:col-span-2 bg-red-50 rounded-2xl border border-red-200 p-6">
        <h3 className="text-lg font-bold text-red-800 mb-2">
          Home visit failed twice
        </h3>
        <p className="text-sm text-red-700">
          The adopter has failed the home visit twice. You can reject the
          application.
        </p>
        {application.home_visit_notes && (
          <div className="mt-3 bg-white rounded-xl p-3 border border-red-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Your notes
            </p>
            <p className="text-sm text-gray-700">
              {application.home_visit_notes}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── B: Failed once — 2nd-attempt flow ────────────────────────────────────
  if (visitStatus === "failed" && attempt === 1) {
    return (
      <div className="lg:col-span-2 bg-amber-50 rounded-2xl border border-amber-200 p-6">
        <h3 className="text-lg font-bold text-amber-800 mb-1">
          Home visit failed — Attempt 1
        </h3>
        <p className="text-sm text-amber-700 mb-3">
          The adopter has been warned and given a second chance. Re-upload
          photos once the second visit is done, then mark the outcome below.
        </p>

        {application.home_visit_notes && (
          <div className="bg-white rounded-xl p-3 border border-amber-100 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Previous notes
            </p>
            <p className="text-sm text-gray-700">
              {application.home_visit_notes}
            </p>
          </div>
        )}

        {/* Remind shelter to upload new photos first */}
        {!alreadySubmitted && (
          <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Please upload new photos and mark the home visit before recording
            the outcome.
          </p>
        )}

        <p className="text-xs font-semibold text-gray-600 tracking-wide mb-3">
          Mark 2nd visit outcome
        </p>

        <div className="flex gap-3">
          <button
            disabled={!alreadySubmitted || submitting}
            onClick={() => onOutcome("passed", "")}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pass home visit
          </button>
          <button
            disabled={!alreadySubmitted || submitting}
            onClick={() => setActiveModal("failed")}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Fail home visit
          </button>
        </div>

        {/* Fail modal for 2nd attempt */}
        {activeModal === "failed" && (
          <FailConfirmModal
            heading="Mark as failed?"
            description="The adopter will be warned and admin will also be notified."
            notes={failureNotes}
            onNotesChange={setFailureNotes}
            submitting={submitting}
            onConfirm={() => onOutcome("failed", failureNotes)}
            onCancel={() => {
              setActiveModal(null);
              setFailureNotes("");
            }}
          />
        )}
      </div>
    );
  }

  // ── A: First attempt — no outcome yet ────────────────────────────────────
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
          🏠
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Home visit outcome
          </h3>
          <p className="text-sm text-gray-400">
            Mark whether the home visit passed or failed. This is attempt{" "}
            {attempt + 1}.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setActiveModal("passed")}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Pass home visit
        </button>
        <button
          onClick={() => setActiveModal("failed")}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Fail home visit
        </button>
      </div>

      {/* Pass confirmation modal */}
      {activeModal === "passed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Confirm pass?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              The adopter will be notified and can proceed to payment.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => {
                  setActiveModal(null);
                  onOutcome("passed", "");
                }}
                className="px-5 py-2.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 font-semibold"
              >
                {submitting ? "Saving..." : " Pass"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail confirmation modal */}
      {activeModal === "failed" && (
        <FailConfirmModal
          heading="Mark as failed?"
          description="The adopter will be warned and given one more chance. Admin will also be notified."
          notes={failureNotes}
          onNotesChange={setFailureNotes}
          submitting={submitting}
          onConfirm={() => onOutcome("failed", failureNotes)}
          onCancel={() => {
            setActiveModal(null);
            setFailureNotes("");
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FailConfirmModal (private — only used inside HomeVisitOutcomeCard)
//
// Shared modal for recording a "failed" outcome. Requires the shelter to
// provide a reason (notes) before confirming.
// ─────────────────────────────────────────────────────────────────────────────
function FailConfirmModal({
  heading,
  description,
  notes,
  onNotesChange,
  submitting,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{heading}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            Notes <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. House too small, unsafe environment for pets..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
          {!notes.trim() && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a reason for failing.
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={submitting || !notes.trim()}
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50 font-semibold"
          >
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
