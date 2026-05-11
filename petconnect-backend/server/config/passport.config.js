// src/config/passport.config.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../models/index.js";


const { User, Role } = db;

const findOrCreateOAuthUser = async ({ email, firstName, lastName, provider, providerId }) => {
  // Try to find by email first (handles case where user already has account)
  let user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: "roleDetails" }],
  });

  if (user) {
    // Link OAuth provider to existing account if not already linked
    if (!user[`${provider}_id`]) {
      await user.update({ [`${provider}_id`]: providerId });
    }
    return { user, isNew: false };
  }

  // New user — create with adopter role (default)
  const roleRecord = await Role.findOne({ where: { name: "adopter" } });

  user = await User.create({
    email,
    first_name: firstName,
    last_name: lastName || "",
    oauth_user:true,
    [`${provider}_id`]: providerId,
    email_verified: true,
    account_status: "Active",
    role_id: roleRecord.id,
    // No password — OAuth users don't need one
    password: null,
  });

  const created = await User.findByPk(user.id, {
    include: [{ model: Role, as: "roleDetails" }],
  });
  return { user: created, isNew: true };
};

// ── Google ────────────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_CALLBACK_BASE}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), null);

         const result = await findOrCreateOAuthUser({
          email,
          firstName: profile.name?.givenName || profile.displayName,
          lastName: profile.name?.familyName || "",
          provider: "google",
          providerId: profile.id,
        });

        done(null, result);
      } catch (err) {
        done(err, null);
      }
    }
  )
);


export default passport;