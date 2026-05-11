import jwt from "jsonwebtoken";
import db from "../../models/index.js";

const { User, Shelter } = db;

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
 
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user = await User.findByPk(decoded.id, {
  include: [{ model: db.Role, as: "roleDetails" }],
});
    const shelter = await Shelter.findOne({ where: { owner_id: decoded.id } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // ── ADD THIS after the !user check ───────────────────────────────────────────
    const { Blacklist } = db;
    const blacklisted = await Blacklist.findOne({ where: { user_id: user.id } });
    if (blacklisted || user.account_status === "Banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended.",
      });
    }

    // Attach basic user info
   req.user = {
  id: user.id,
  email: user.email,
  role: user.roleDetails?.name,
  role_id: user.role_id,
  roleName: user.roleDetails?.name,
};

    // Attach shelter info if role is shelter
   
if (user.roleDetails?.name === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      req.user.shelter = shelter
        ? { id: shelter.id, name: shelter.name, upi_id: shelter.upi_id }
        : null;
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("Auth Middleware Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    // No token → continue as public user, req.user stays undefined
    if (!token) return next();

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await User.findByPk(decoded.id);
    // TO THIS:
    const user = await User.findByPk(decoded.id, {
      include: [{ model: db.Role, as: "roleDetails" }],
    });

    if (!user) return next(); // invalid user → treat as public, don't block

    // req.user = { id: user.id, email: user.email, role: user.role };
    req.user = {
      id: user.id,
      email: user.email,
     role: user.roleDetails?.name,                         // keep old — nothing breaks
      role_id: user.role_id,                    // add new
      roleName: user.roleDetails?.name,         // add new
    };

 if (user.roleDetails?.name === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      req.user.shelter = shelter ? { id: shelter.id, name: shelter.name } : null;
    }

    next();
  } catch {
    // Expired/invalid token on a public route → just continue as guest
    next();
  }
};
