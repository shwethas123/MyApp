//InfoRow component used in ShelterApplicationDetails.jsx for displaying applicant details in a structured format
export default function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">
        {value || "—"}
      </span>
    </div>
  );
}
