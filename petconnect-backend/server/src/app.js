import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import shelterRoutes from "./routes/shelter.routes.js";
import petRoutes from "./routes/pet.routes.js";
import { browsePets } from "./controllers/pet.controller.js";
import adoptionRoutes from "./routes/adoption.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes.js";
import reportRoutes from "./routes/report.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import cookieParser from "cookie-parser";
import passport from "../config/passport.config.js"; 
import authRoutes from "./routes/oauth.routes.js";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import petChatRoutes from "./routes/petChat.routes.js";
import geoRoutes from "./routes/geo.routes.js";

const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger-output.json");

const app = express();
app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173" ,credentials: true}));
app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/shelters", shelterRoutes);
app.use("/api/admin", adminAnalyticsRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/shelter/pets", petRoutes);
app.get("/api/pets/browse", browsePets);
app.use("/api/pets", petChatRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/adoption", (req, res, next) => {
  console.log("ADOPTION ROUTE HIT:", req.method, req.url);
  next();
});
app.use("/api/adoption", adoptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api/geoip", async (req, res) => {
  try {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    
    // Remove IPv6 prefix if present
    ip = ip?.replace("::ffff:", "");
    
    // Don't send localhost IP to api — use empty string so it auto-detects
    const isLocal = !ip || ip === "127.0.0.1" || ip === "::1";
    const url = isLocal
      ? "http://ip-api.com/json/?fields=city,regionName,zip,lat,lon,status"
      : `http://ip-api.com/json/${ip}?fields=city,regionName,zip,lat,lon,status`;

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to get location" });
  }
});



export default app;
