// src/routes/auth.routes.js
import express from "express";
import passport from "../../config/passport.config.js";
import { oauthCallback } from "../controllers/oauth.controller.js";

const router = express.Router();

// GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false, prompt: "select_account", })
);

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  oauthCallback
);



export default router;