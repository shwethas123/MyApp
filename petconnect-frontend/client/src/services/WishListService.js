import api from "./Apiservices";

// WHY dedicated service: if endpoint changes, fix in one place only.
const WishlistService = {
  toggle: (petId) => api.post(`/wishlist/toggle/${petId}`),
  getStatus: (petId) => api.get(`/wishlist/status/${petId}`),
  getAll:    ()      => api.get(`/wishlist`), 
};

export default WishlistService;