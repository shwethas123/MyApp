import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WishlistService from "../services/WishListService.js";
import WishlistView from "../components/WishListView";

const WishlistContainer = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null); // tracks which card is being removed

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await WishlistService.getAll();
        setWishlist(res.data.data || []);
      } catch {
        setError("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // WHY wishlistId + petId both: wishlistId to filter local state,
  // petId to call the toggle API
  const handleRemove = async (wishlistId, petId) => {
    setRemovingId(wishlistId);
    try {
      await WishlistService.toggle(petId);
      // Remove from local state — no refetch needed
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch {
      setError("Failed to remove pet. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <WishlistView
      wishlist={wishlist}
      loading={loading}
      error={error}
      onRemove={handleRemove}
      removingId={removingId}
      onBrowse={() => navigate("/browse")}
    />
  );
};

export default WishlistContainer;