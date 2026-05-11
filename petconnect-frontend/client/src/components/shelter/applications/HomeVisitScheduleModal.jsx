import { useState } from "react";
import { HOME_VISIT_TIME_SLOTS } from "../../../constants/adoptionApplicationConfig";

export default function HomeVisitScheduleModal({
  isOpen,
  scheduleDate,
  scheduleSlot,
  onDateChange,
  onSlotChange,
  onConfirm,
  submitting,
}) {
  const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time
  const [dateError, setDateError] = useState("");

  const hasValidValues = scheduleDate && scheduleSlot && !dateError;

  if (!isOpen) return null;

  const handleDateChange = (value) => {
    if (value && value < today) {
      setDateError("Home visit date cannot be in the past.");
    } else {
      setDateError("");
    }
    onDateChange(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
              📅
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Schedule home visit
              </h3>
              <p className="text-sm text-gray-400">
                Pick a date and time slot — the adopter will be notified
                instantly.
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">
          {/* Date picker */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
              Visit Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={today}
              lang="en-GB"
              value={scheduleDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                dateError
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-200 focus:ring-blue-300"
              }`}
            />
            {dateError && (
              <p className="text-xs text-red-500 font-semibold mt-1.5">
                ⚠️ {dateError}
              </p>
            )}
          </div>

          {/* Time slot grid */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
              Time Slot <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HOME_VISIT_TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={`text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all text-left ${
                    scheduleSlot === slot
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Preview summary — only visible when both fields are filled */}
          {hasValidValues && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">🗓️</span>
              <p className="text-sm text-blue-800 font-medium">
                {new Date(scheduleDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · <span className="font-bold">{scheduleSlot}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6">
          <button
            onClick={onConfirm}
            disabled={!hasValidValues || submitting}
            className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Scheduling..." : "Notify adopter"}
          </button>
        </div>
      </div>
    </div>
  );
}
