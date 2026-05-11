// src/controllers/oauth.controller.js
import jwt from "jsonwebtoken";
import db from "../../models/index.js";

const { Shelter } = db;

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge,
});

// Called after Passport succeeds — same JWT cookie logic as loginUser
export const oauthCallback = async (req, res) => {
  try {
     const { user, isNew } = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_failed`
      );
    }

     const role = user.roleDetails?.name;
    if (isNew) {
  const payload = { id: user.id, email: user.email, role: "adopter" };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("accessToken", accessToken, cookieOptions(2 * 60 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  return res.redirect(`${process.env.CLIENT_URL}/oauth-complete`);
}
    const payload = { id: user.id, email: user.email, role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", accessToken, cookieOptions(2 * 60 * 60 * 1000));
    res.cookie(
      "refreshToken",
      refreshToken,
      cookieOptions(7 * 24 * 60 * 60 * 1000)
    );

    // Redirect to frontend with role so it can navigate correctly
    const redirectMap = {
      adopter: "/browse",
      shelter: "/shelter/pets",
      admin: "/admin/dashboard",
    };
    const destination = redirectMap[role] || "/browse";

    res.redirect(`${process.env.CLIENT_URL}${destination}`);
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};