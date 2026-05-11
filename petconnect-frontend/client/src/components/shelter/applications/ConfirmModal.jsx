import { useState } from "react";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  confirmColor,
  isRejection,
  rejectionReason,
  onReasonChange,
}) {
  // touched state tracks whether the shelter tried to confirm without filling the reason
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const reasonMissing =
    isRejection && (!rejectionReason || !rejectionReason.trim());

  const handleConfirm = () => {
    if (reasonMissing) {
      setTouched(true);
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
    setTouched(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        {/* Heading */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        {/* Rejection reason — only shown when isRejection === true */}
        {isRejection && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 tracking-wide mb-1.5 block">
              Reason for rejection <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => {
                onReasonChange(e.target.value);
                if (touched) setTouched(false);
              }}
              placeholder="e.g. Living situation not suitable, insufficient experience..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            {touched && reasonMissing && (
              <p className="text-xs text-red-500 font-semibold mt-1">
                Please enter a reason before rejecting.
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm text-white rounded-xl transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
