import { useState, useEffect } from "react";
import WishlistService from "../services/WishListService.js";
import useAuth from "./AuthContext";

// WHY custom hook: keeps all wishlist state logic in one place.
// PetDetailPage stays clean — just calls useWishlist(id).
const useWishlist = (petId) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // WHY this check: only logged-in adopters can wishlist pets
  const canWishlist =
    isAuthenticated && currentUser?.role === "adopter";

  useEffect(() => {
    if (!canWishlist || !petId) return;

    WishlistService.getStatus(petId)
      .then((res) => setWishlisted(res.data.wishlisted))
      .catch(() => {}); // silent fail — heart stays empty, not a critical error
  }, [petId, canWishlist]);

  const toggle = async () => {
    if (!canWishlist || loading) return;
    setLoading(true);

    const prev = wishlisted;
    setWishlisted(!prev); // optimistic update — feels instant

    try {
      const res = await WishlistService.toggle(petId);
      setWishlisted(res.data.wishlisted); // sync with server truth
    } catch {
      setWishlisted(prev); // rollback on failure
    } finally {
      setLoading(false);
    }
  };

  return { wishlisted, toggle, loading, canWishlist };
};

export default useWishlist;