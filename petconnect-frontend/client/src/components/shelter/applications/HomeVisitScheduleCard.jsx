export default function HomeVisitScheduleCard({
  scheduleDate,
  scheduleSlot,
  onReschedule,
}) {
  // Nothing to render if no date has been set yet
  if (!scheduleDate) return null;

  const formattedDate = new Date(scheduleDate).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6 lg:col-span-2">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
          📅
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            Home visit scheduled
          </h3>
          <p className="text-sm text-gray-400">
            Adopter has been notified of the visit details below.
          </p>
        </div>
      </div>

      {/* ── Date + slot summary ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Date
          </p>
          <p className="text-sm font-bold text-gray-800">{formattedDate}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Time Slot
          </p>
          <p className="text-sm font-bold text-gray-800">
            {scheduleSlot || "—"}
          </p>
        </div>
      </div>

      {/* ── Reschedule link ── */}
      <button
        onClick={onReschedule}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl px-3 py-2 transition-colors"
      >
        Reschedule visit
      </button>
    </div>
  );
}
