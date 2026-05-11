import InfoRow from "../../ui/InfoRow";

export default function ApplicationApplicantCard({ application, onViewPdf }) {
  const { applicant } = application;

  // Helper: decide whether a document URL is a PDF (Cloudinary raw upload or
  // a .pdf extension) and either call onViewPdf or open in a new tab.
  const handleViewDocument = (url) => {
    const isPdf =
      url?.includes("/raw/upload/") || url?.toLowerCase().endsWith(".pdf");
    if (isPdf) onViewPdf(url);
    else window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* ── Avatar + name ── */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
          {applicant?.first_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {applicant?.first_name} {applicant?.last_name}
          </h3>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Verified adopter
          </span>
        </div>
      </div>

      {/* ── Contact details ── */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>✉️</span> {applicant?.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📞</span> {applicant?.phone || application.phoneNumber}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span> {application.address}
        </div>
      </div>

      {/* ── Lifestyle fields ── */}
      <div className="border-t border-gray-100 pt-4">
        <InfoRow label="Occupation" value={application.currentOccupation} />
        <InfoRow
          label="Pet experience"
          value={`${application.petExperienceYears || 0} year(s)`}
        />
        <InfoRow
          label="Living situation"
          value={application.livingArrangement}
        />
        <InfoRow label="Family agreement" value={application.familyAgreement} />
        <InfoRow
          label="Landlord allows"
          value={application.landlordAllowsPets}
        />
      </div>

      {/* ── Pet care when away ── */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 tracking-wide mb-2">
          Pet care when away
        </p>
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
          {application.petCareWhenAway}
        </p>
      </div>

      {/* ── Submitted documents ── */}
      {(application.aadhar_proof_url || application.rental_agreement_url) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400  tracking-wide mb-3">
            Submitted documents
          </p>
          <div className="space-y-2">
            {/* Aadhaar card */}
            {application.aadhar_proof_url && (
              <DocumentRow
                icon={
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                }
                iconExtraPath={<polyline points="14 2 14 8 20 8" />}
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                title="Aadhaar card"
                subtitle="Identity proof"
                buttonColor="text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200"
                onView={() => handleViewDocument(application.aadhar_proof_url)}
              />
            )}

            {/* Rental agreement — only show when landlord field is answered */}
            {application.rental_agreement_url &&
              (application.landlordAllowsPets === "Yes" ||
                application.landlordAllowsPets === "No") && (
                <DocumentRow
                  icon={
                    <>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </>
                  }
                  iconColor="text-purple-500"
                  iconBg="bg-purple-50"
                  title="Rental agreement"
                  subtitle="Landlord permission proof"
                  buttonColor="text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200"
                  onView={() =>
                    handleViewDocument(application.rental_agreement_url)
                  }
                />
              )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DocumentRow (private — only used inside ApplicationApplicantCard)
//
// A single row inside the "Submitted Documents" section.
// Shows a file icon, title, subtitle, and a "View" button.
// ─────────────────────────────────────────────────────────────────────────────
function DocumentRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  buttonColor,
  onView,
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <svg
            className={`w-4 h-4 ${iconColor}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {icon}
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onView}
        className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${buttonColor}`}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        View
      </button>
    </div>
  );
}
