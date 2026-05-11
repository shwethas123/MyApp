
import { X,Loader2 } from "lucide-react";
import { useState } from "react";

// ── PAYMENT MODAL ──────────────────────────────────────────────────────────
function PaymentModal({ pet, shelter, onClose, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [errors, setErrors] = useState({});

  const ADOPTION_FEE = pet?.adoption_fee || 0;

  const validate = () => {
    const e = {};
    if (!selectedMethod) {
      e.method = "Please select a payment method.";
      setErrors(e);
      return false;
    }
    if (selectedMethod === "upi") {
      if (!upiId.includes("@")) e.upiId = "Enter a valid UPI ID (e.g. name@upi).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2200));
    setProcessing(false);
    setPaid(true);
    setTimeout(() => onSuccess && onSuccess(selectedMethod), 100);
  };

  const methods = [
    {
      id: "upi",
      label: "UPI",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      id: "cash",
      label: "Cash",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
    },
  ];

  if (paid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            {selectedMethod === "cash" ? "Cash payment confirmed!" : "Payment successful!"}
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            You've officially adopted <span className="font-bold text-blue-600">{pet?.name}</span>! 🎉
          </p>
          <p className="text-xs text-gray-400">Your adoption certificate will be ready shortly.</p>
        {/* Payment method info */}
          {selectedMethod === "cash" && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs text-amber-700 leading-relaxed">
                Please bring <span className="font-bold">₹{ADOPTION_FEE}</span> in cash when you 
                pick up <span className="font-semibold">{pet?.name}</span> from the shelter.
              </p>
            </div>
          )}
          {selectedMethod === "upi" && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs text-green-700 leading-relaxed">
                Payment of <span className="font-bold">₹{ADOPTION_FEE}</span> sent via UPI. 
                The shelter will confirm receipt shortly.
              </p>
            </div>
          )}

          {/* OK Button — triggers navigation */}
          <button
            onClick={() => onSuccess && onSuccess(selectedMethod)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-200"
          >
            Ok, view my application
          </button>
        
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">Complete adoption payment</h2>
            <p className="text-blue-200 text-xs mt-0.5">
              Adopting {pet?.name?.toLowerCase()} · {shelter?.name || "Shelter"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Fee Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium  tracking-wide">Adoption fee</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-0.5">₹{ADOPTION_FEE}.00</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">For</p>
              <p className="text-sm font-bold text-gray-800">{pet?.name}</p>
              <p className="text-xs text-gray-400">{pet?.breed}</p>
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Select payment method</p>
            {errors.method && <p className="text-xs text-red-500 mb-2">{errors.method}</p>}
            <div className="grid grid-cols-2 gap-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMethod(m.id); setErrors({}); }}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-xs font-semibold transition-all
                    ${selectedMethod === m.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI Form */}
          {selectedMethod === "upi" && (
            <div className="space-y-3">
              {shelter?.upi_id && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-0.5">Pay to </p>
                    <p className="text-sm font-bold text-green-800">{shelter.upi_id}</p>
                  </div>
                  <span className="text-green-500 text-lg">✓</span>
                </div>
              )}
              {!shelter?.upi_id && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-700">The shelter hasn't added their UPI ID yet. Please use cash or contact the shelter directly.</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Your UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className={`w-full text-sm bg-gray-50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.upiId ? "border-red-300" : "border-gray-200"}`}
                />
                {errors.upiId && <p className="text-xs text-red-500 mt-1">{errors.upiId}</p>}
                <p className="text-xs text-gray-400 mt-2">Enter your UPI ID and send the payment to the shelter's UPI ID shown above.</p>
              </div>
            </div>
          )}

          {/* Cash Info */}
          {selectedMethod === "cash" && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Cash payment</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Pay <span className="font-bold">₹{ADOPTION_FEE}</span> in cash directly to the shelter when you pick up{" "}
                <span className="font-semibold">{pet?.name}</span>. The shelter will confirm receipt and complete your adoption.
              </p>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Your transaction is secured and monitored by PetConnect.
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-200"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : selectedMethod === "cash" ? (
              "Confirm cash payment"
            ) : (
              `Pay ₹${ADOPTION_FEE}.00`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;    