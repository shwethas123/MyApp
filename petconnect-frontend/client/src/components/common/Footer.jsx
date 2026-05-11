import { PawPrint, X } from "lucide-react";
import { useState } from "react";

const modalContent = {
  "Contact support": {
    title: "Contact support",
    body: "Need help? Reach us at support@petconnect.com or call 1-800-PET-HELP (Mon–Fri, 9am–6pm). We typically respond within 24 hours.",
  },
  "Privacy policy": {
    title: "Privacy policy",
    body: "PetConnect collects only the data necessary to connect you with pets. We never sell your personal information to third parties. Your data is encrypted and stored securely.",
  },
  "Terms of use": {
    title: "Terms of use",
    body: "By using PetConnect, you agree to use the platform responsibly, provide accurate information during adoption, and treat all animals and community members with respect. Misuse may result in account suspension.",
  },
};

function Modal({ item, onClose }) {
  if (!item) return null;
  const content = modalContent[item];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <h2 className="text-base font-semibold text-[#3182CE] mb-3">
          {content.title}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{content.body}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-[#3182CE] hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <Modal item={activeModal} onClose={() => setActiveModal(null)} />

      <footer className="bg-white border-t border-gray-200 px-4 sm:px-10 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
                <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
                <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
                <path d="M7 10 C4 10 3 13 4.5 14.5 C5.5 15.5 8.5 15.5 9.5 14.5 C11 13 10 10 7 10Z" />
                <ellipse cx="17" cy="4" rx="1.2" ry="1.6" />
                <ellipse cx="14.5" cy="5.5" rx="1" ry="1.4" />
                <ellipse cx="19.5" cy="5.5" rx="1" ry="1.4" />
                <path d="M17 8 C14 8 13 11 14.5 12.5 C15.5 13.5 18.5 13.5 19.5 12.5 C21 11 20 8 17 8Z" />
              </svg>

              <span className="font-semibold text-[#3182CE] text-sm">
                PetConnect
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connecting loving owners with their perfect companions.
              <br />
              Making adoption easier since 2026.
            </p>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {["Contact support", "Privacy policy", "Terms of use"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => setActiveModal(item)}
                      className="text-sm text-gray-600 hover:text-[#3182CE] transition-colors underline-offset-2 hover:underline cursor-pointer"
                    >
                      {item}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Trust & safety
            </h3>
            <div className="flex flex-col gap-2">
              {/* Secure badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  SSL secured platform
                </span>
              </div>

              {/* Certified badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="#3182CE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  Certified shelter network
                </span>
              </div>

              {/* Rated badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="#ca8a04"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  4.9★ Rated by pet owners
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-5 text-center ">
          <p className="text-xs text-gray-400">
            PetConnect © 2026. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
        </div>
      </footer>
    </>
  );
}
