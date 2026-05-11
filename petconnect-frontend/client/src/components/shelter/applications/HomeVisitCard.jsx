import { useState, useRef } from "react";

export default function HomeVisitCard({
  onSubmit,
  submitting,
  alreadySubmitted,
  existingPhotos = [],
}) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState([null, null, null]);
  const [documentsVerified, setDocumentsVerified] = useState(false);
  const [inlineError, setInlineError] = useState("");

  // Photo picker modal (choose between camera and file upload)
  const [photoPickerIndex, setPhotoPickerIndex] = useState(null); // slot index or null

  // Camera modal
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraSlotIndex, setCameraSlotIndex] = useState(null);
  const [cameraAccessError, setCameraAccessError] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  // ── Camera helpers ─────────────────────────────────────────────────────────

  const openCamera = async (slotIndex) => {
    setCameraSlotIndex(slotIndex);
    setPhotoPickerIndex(null); // close the picker modal first
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      // Small timeout so the video element has mounted before we attach the stream
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraAccessError(true);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraSlotIndex(null);
    setCameraAccessError(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File(
        [blob],
        `home-visit-photo-${cameraSlotIndex + 1}.jpg`,
        { type: "image/jpeg" },
      );
      setPhotos((prev) => {
        const updated = [...prev];
        updated[cameraSlotIndex] = file;
        return updated;
      });
      closeCamera();
    }, "image/jpeg");
  };

  // ── Photo slot helpers ─────────────────────────────────────────────────────

  const handleFileSelected = (slotIndex, file) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[slotIndex] = file;
      return updated;
    });
    setPhotoPickerIndex(null);
  };

  const removePhoto = (slotIndex) => {
    if (fileInputRefs[slotIndex].current) {
      fileInputRefs[slotIndex].current.value = "";
    }
    setPhotos((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const showInlineError = (message) => {
    setInlineError(message);
    setTimeout(() => setInlineError(""), 3000);
  };

  const handleSubmit = () => {
    const filledPhotos = photos.filter(Boolean);
    if (filledPhotos.length === 0) {
      showInlineError("Please upload at least 1 photo of the home.");
      return;
    }
    if (!documentsVerified) {
      showInlineError("Please confirm documents have been verified.");
      return;
    }
    setInlineError("");
    const formData = new FormData();
    filledPhotos.forEach((photo) =>
      formData.append("home_visit_photos", photo),
    );
    formData.append("documents_verified", "true");
    onSubmit(formData);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 sm:p-6 lg:col-span-2">
      {/* ── Photo picker overlay (Camera vs Upload choice) ── */}
      {photoPickerIndex !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setPhotoPickerIndex(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">
                Add photo {photoPickerIndex + 1}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Choose how you'd like to add this photo
              </p>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {/* Camera option */}
              <button
                type="button"
                onClick={() => openCamera(photoPickerIndex)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📷</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Take a photo
                  </p>
                  <p className="text-xs text-gray-400">
                    Use your camera to capture
                  </p>
                </div>
              </button>
              {/* File upload option */}
              <button
                type="button"
                onClick={() => fileInputRefs[photoPickerIndex].current?.click()}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🖼️</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Upload from device
                  </p>
                  <p className="text-xs text-gray-400">
                    Choose from your gallery or files
                  </p>
                </div>
              </button>
            </div>
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => setPhotoPickerIndex(null)}
                className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera modal ── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 py-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm sm:max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                📷 Take a photo
              </h3>
              <button
                onClick={closeCamera}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-black w-full">
              {cameraAccessError ? (
                /* Permission denied state */
                <div className="flex flex-col items-center justify-center px-6 py-10 bg-gray-50 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Camera Access Denied
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Please allow camera access in your browser settings and try
                    again.
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-left w-full">
                    <p className="text-xs font-bold text-gray-600 mb-2">
                      How to enable:
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Click the 🔒 lock icon or ℹ️ info icon in your browser's
                      address bar → Site settings → Camera → Allow
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ maxHeight: "60vh", objectFit: "cover" }}
                />
              )}
              {!cameraAccessError && (
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Photo {cameraSlotIndex + 1} of 3
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 px-4 py-4">
              <button
                onClick={closeCamera}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {cameraAccessError ? "Close" : "Cancel"}
              </button>
              {!cameraAccessError && (
                <button
                  onClick={captureSnapshot}
                  className="flex-1 px-6 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center gap-2"
                >
                  <span>📸</span> Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Card header ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg flex-shrink-0">
          🏠
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Home visit details
          </h3>
          <p className="text-sm text-gray-400">
            Upload photos and confirm document verification to mark home visit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Photo slots ── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Home Photos <span className="text-red-400">*</span>{" "}
            <span className="text-gray-400 font-normal ml-1">(up to 3)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                {/* Already-uploaded photo from backend (locked state) */}
                {alreadySubmitted && existingPhotos[i] ? (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-green-200">
                    <img
                      src={existingPhotos[i]}
                      className="w-full h-full object-cover"
                      alt={`Home photo ${i + 1}`}
                    />
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                ) : photos[i] ? (
                  /* Newly selected photo (preview before submit) */
                  <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(photos[i])}
                      className="w-full h-full object-cover"
                      alt={`Home photo ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50"
                    >
                      <span className="text-red-400 text-xs">✕</span>
                    </button>
                  </div>
                ) : (
                  /* Empty slot — click to open picker */
                  <div
                    onClick={() => !alreadySubmitted && setPhotoPickerIndex(i)}
                    className={`h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all ${
                      alreadySubmitted
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:border-purple-300 hover:bg-purple-50/30"
                    }`}
                  >
                    <span className="text-2xl text-gray-300">🏠</span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      Add photo
                    </span>
                  </div>
                )}

                {/* Hidden file input per slot */}
                <input
                  ref={fileInputRefs[i]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files[0] &&
                    handleFileSelected(i, e.target.files[0])
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Document verification + submit ── */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Document verification
            </p>
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
              <input
                type="checkbox"
                checked={alreadySubmitted ? true : documentsVerified}
                onChange={(e) =>
                  !alreadySubmitted && setDocumentsVerified(e.target.checked)
                }
                disabled={alreadySubmitted}
                className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">
                I confirm that I have{" "}
                <span className="font-semibold">physically verified</span> all
                documents submitted by the adopter during the home visit.
              </span>
            </label>
          </div>

          {/* Inline validation error */}
          {inlineError && (
            <p className="text-xs text-red-500 mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {inlineError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || alreadySubmitted}
            className="mt-4 w-full px-5 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {alreadySubmitted
              ? "Home visit marked "
              : submitting
                ? "Saving..."
                : "Mark home visit "}
          </button>
        </div>
      </div>
    </div>
  );
}
