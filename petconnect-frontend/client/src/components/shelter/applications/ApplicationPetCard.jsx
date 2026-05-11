import Badge from "../../ui/Badge";

export default function ApplicationPetCard({ pet }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* ── Cover photo ── */}
      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-5">
        {pet.images?.[0] ? (
          <img
            src={
              pet.images[0]?.file_url ||
              "https://placehold.co/400x250?text=No+Photo"
            }
            alt={pet.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            🐾
          </div>
        )}
      </div>

      {/* ── Name + basic info ── */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{pet?.name}</h3>
        <p className="text-sm text-gray-500">
          {pet?.breed} • {pet?.age} year{pet?.age > 1 ? "s" : ""} old •{" "}
          {pet?.gender}
        </p>
      </div>

      {/* ── Trait badges ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pet?.vaccinated && (
          <Badge text="✓ Vaccinated" color="bg-green-50 text-green-700" />
        )}
        {pet?.sterilized && (
          <Badge text="✓ Sterilized" color="bg-blue-50 text-blue-700" />
        )}
        {pet?.good_with_kids && (
          <Badge text="✓ Good with kids" color="bg-purple-50 text-purple-700" />
        )}
        {pet?.special_needs && (
          <Badge text="Special needs" color="bg-orange-50 text-orange-700" />
        )}
      </div>

      {/* ── Temperament ── */}
      {pet?.temperament && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">
            Temperament
          </p>
          <p className="text-sm text-gray-700">{pet.temperament}</p>
        </div>
      )}

      {/* ── Adoption fee ── */}
      {pet?.adoption_fee > 0 && (
        <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-gray-600">
            Adoption fee
          </span>
          <span className="text-lg font-bold text-blue-600">
            ₹{pet.adoption_fee}
          </span>
        </div>
      )}
    </div>
  );
}
