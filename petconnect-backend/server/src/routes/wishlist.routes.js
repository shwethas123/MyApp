import express from "express";
import { toggleWishlist, getWishlistStatus, getMyWishlist } from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";

const router = express.Router();

router.get("/", authMiddleware, authorize(ROLES.ADOPTER), (req, res) => {
  /* #swagger.tags = ['Wishlist'] */
  getMyWishlist(req, res);
});

router.post("/toggle/:petId", authMiddleware, authorize(ROLES.ADOPTER), (req, res) => {
  /* #swagger.tags = ['Wishlist'] */
  toggleWishlist(req, res);
});

router.get("/status/:petId", authMiddleware, authorize(ROLES.ADOPTER), (req, res) => {
  /* #swagger.tags = ['Wishlist'] */
  getWishlistStatus(req, res);
});

export default router;