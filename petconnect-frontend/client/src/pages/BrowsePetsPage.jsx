import { useState, useEffect, useCallback, useRef } from "react";
import PetCard from "../components/pets/PetCard";
import PetFilters from "../components/pets/PetFilters";
import PetService from "../services/PetService";
import { SlidersHorizontal, X, Check } from "lucide-react";
import useAdopterOnly from "../hooks/useAdopterOnly";

const BrowsePetsPage = () => {

  const isAllowed = useAdopterOnly();
  
  const [pets, setPets]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [availableSpecies, setAvailableSpecies] = useState([]);
  const isFirstLoad = useRef(true);

 const [filters, setFilters] = useState({
  species: "",
  breed: "",
  gender: "",
  vaccinated: undefined,
  special_needs: undefined,
  good_with_kids: undefined,
  age_min: "",
  age_max: "",
  city: "",
  zipcode: "",
  displayLocation: "",
  lat: undefined,      // ← new
  lng: undefined,      // ← new
  radius: undefined,   // ← new
  page: 1,
  limit: 9,
  sort: "newest",
});

 const fetchPets = useCallback(async () => {
  if (isFirstLoad.current) setLoading(true); //skeleton shows on screen
  setError(null);
  
  try {
    
    const result = await PetService.browsePets(filters);
    if (!result || !Array.isArray(result.pets)) {
      setPets([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }
    setPets(result.pets);
    setTotal(typeof result.total === "number" ? result.total : 0);
    setTotalPages(Number.isFinite(result.totalPages) && result.totalPages > 0 ? result.totalPages : 1);
    setError(null); // ← clear error AGAIN after successful fetch
  } catch(err) {
     console.error("browsePets error:", err); 
    setError("Failed to load pets. Please try again.");
  } finally {
    setLoading(false);
    isFirstLoad.current = false;
  }
}, [filters]);
useEffect(() => {
  const fetchSpecies = async () => {
    try {
      const res = await PetService.browsePets({ limit: 100, page: 1 });
      const all = res.pets || [];
      const unique = [...new Set(all.map(p => p.species).filter(Boolean))];
      setAvailableSpecies(unique);
    } catch (e) {}
  };
  fetchSpecies();
}, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);
  if (!isAllowed) return null; 

  // ✅ Drawer stays open — user applies multiple filters freely
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e) => setFilters({ ...filters, sort: e.target.value, page: 1 });
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count active filters for the badge on the Filters button
 // Update activeFilterCount to include radius
const activeFilterCount = [
  filters.species, filters.breed, filters.gender,
  filters.city, filters.age_min, filters.age_max,
  filters.vaccinated, filters.special_needs, filters.good_with_kids,
  filters.lat,         // ← new (counts as 1 when location is active)
].filter((v) => v !== "" && v !== undefined && v !== null && v !== false).length;
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* ── Mobile filter drawer ──────────────────────────────────────────── */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col lg:hidden ${showFilters ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto p-4">
          <PetFilters filters={filters} onChange={handleFilterChange} mobileDrawer availableSpecies={availableSpecies} />
        </div>

        {/* ✅ Apply button at bottom — closes drawer when user is done */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={() => setShowFilters(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors active:scale-95"
          >
            <Check size={15} />
            Show {total} result{total !== 1 ? "s" : ""}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Page Title */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Discover Pets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `Found ${total} pet${total !== 1 ? "s" : ""} available for adoption`}
          </p>
        </div>

        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
           <PetFilters filters={filters} onChange={handleFilterChange} availableSpecies={availableSpecies} />

          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Sort bar + mobile filter button */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                {/* ✅ Filter button with active count badge */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-colors relative"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="hidden sm:block text-sm text-gray-500">
                  {!loading && `Page ${filters.page} of ${totalPages}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-4 text-sm">{error}</div>
            )}

            {/* First-load skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-48 sm:h-52 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && (
              <>
                {pets.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-5xl mb-4">🐾</span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No pets found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your filters</p>
                  </div>
                )}

                {pets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {pets.map((pet) => (
                      <PetCard key={pet.id} pet={pet} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-blue-400 hover:text-blue-600"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          filters.page === i + 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-blue-400 hover:text-blue-600"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePetsPage;