import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

// ── Single wishlist card ───────────────────────────────────────────────────
const WishlistCard = ({ item, onRemove, removing }) => {
  const navigate = useNavigate();
  const pet = item.pet;

  const isAdopted = pet?.status === "Adopted";

  const statusConfig = {
    Available: { label: "Available", className: "bg-green-100 text-green-700" },
    Reserved:  { label: "Reserved",  className: "bg-yellow-100 text-yellow-700" },
    Adopted:   { label: "Adopted",   className: "bg-blue-100 text-blue-700"    },
    OnHold:    { label: "On Hold",   className: "bg-gray-100 text-gray-600"    },
  };

  const statusStyle = statusConfig[pet?.status] || statusConfig.Available;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 relative"
      style={{ opacity: isAdopted ? 0.6 : 1 }}
    >
      {/* ✅ Adopted overlay banner */}
      {isAdopted && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none ">
          <div className="bg-blue-600/80 text-white text-l font-bold px-5 py-3 rounded-full tracking-wider shadow" >
            😢 Already Adopted
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative">
        <img
          src={pet?.images?.[0]?.file_url || "https://placehold.co/400x250?text=No+Photo"}
          alt={pet?.name}
          className={`w-full h-52 object-cover ${isAdopted ? "grayscale" : ""}`}
        />

        {/* Remove heart button */}
        <button
          onClick={() => onRemove(item.id, pet?.id)}
          disabled={removing}
          title="Remove from wishlist"
          className={`absolute top-3 right-3 bg-white rounded-full p-2 shadow transition-colors z-20
            ${removing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <Heart
            size={18}
            fill="#ef4444"
            stroke="#ef4444"
            className={`transition-colors ${removing ? "opacity-50" : "hover:fill-gray-300 hover:stroke-gray-300"}`}
          />
        </button>
      </div>

      {/* Info */}
      <div className={`p-4 ${isAdopted ? "blur-[1.5px]" : ""}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900">{pet?.name}</h3>
          {pet?.shelter?.city && (
            <span className="text-xs text-gray-400">{pet.shelter.city}</span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-1">
          {pet?.breed} • {pet?.age} {pet?.age === 1 ? "Year" : "Years"} Old
        </p>

        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          ♦ {pet?.gender}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle.className}`}>
            {statusStyle.label}
          </span>
          <span className="text-xs text-gray-400">{pet?.shelter?.name}</span>
        </div>

        <button
          onClick={() => navigate(`/pets/${pet?.id}`)}
          disabled={isAdopted}
          className={`w-full text-sm border rounded-lg py-2 transition-colors duration-200
            ${isAdopted
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
        >
          {isAdopted ? "No longer available" : "View Details →"}
        </button>
      </div>
    </div>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────
const WishlistView = ({ wishlist, loading, error, onRemove, removingId, onBrowse }) => {

  // ✅ Sort: available/reserved/on-hold first, adopted last
  const sortedWishlist = [...wishlist].sort((a, b) => {
    const aAdopted = a.pet?.status === "Adopted" ? 1 : 0;
    const bAdopted = b.pet?.status === "Adopted" ? 1 : 0;
    return aAdopted - bAdopted;
  });

  const adoptedCount   = wishlist.filter((i) => i.pet?.status === "Adopted").length;
  const availableCount = wishlist.length - adoptedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐾</div>
          <p className="text-gray-500 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">Pets you've saved for later.</p>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

        {/* Empty state */}
        {wishlist.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-gray-500 font-medium mb-1">No saved pets yet</p>
            <p className="text-sm text-gray-400 mb-6">Browse pets and tap the heart to save them here.</p>
            <button
              onClick={onBrowse}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Pets
            </button>
          </div>
        )}

        {/* Grid */}
        {sortedWishlist.length > 0 && (
          <>
            {/* ✅ Count summary */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs text-gray-400">
                {wishlist.length} {wishlist.length === 1 ? "pet" : "pets"} saved
              </p>
              {adoptedCount > 0 && (
                <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                  {adoptedCount} already adopted
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  removing={removingId === item.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistView;