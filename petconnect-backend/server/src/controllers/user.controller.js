import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import { sendOtpEmail } from "../../utils/mailer.js";
import { v2 as cloudinary } from "cloudinary";
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";
const { User, Shelter, OtpStore, Blacklist } = db;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isAlphaOnly = (str) => /^[A-Za-z]+$/.test(str.trim());
const isDigitsOnly = (str) => /^\d+$/.test(str.trim());

const validatePassword = (password) => {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character (e.g. @, #, $)";
  return null;
};

const REQUIRED_FOR_COMPLETION = [
  "first_name", "last_name", "phone", "location",
  "living_situation", "preferred_species", "pet_experience_years",
];

const computeProfileCompleted = (fields) =>
  REQUIRED_FOR_COMPLETION.every((key) => {
    const val = fields[key];
    return val !== null && val !== undefined && String(val).trim() !== "";
  });

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.oauth_user) {
        return res.status(400).json({
          success: false,
          message:
            "This email is registered via Google sign-in. Please continue with Google.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + 1 * 60 * 1000);

    await OtpStore.destroy({ where: { email } });
    await OtpStore.create({ email, otp, expires_at, is_verified: false });

    const previewUrl = await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      dev: { otp, previewUrl },
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }
    if (!otp || !String(otp).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    }
    if (String(otp).trim().length !== 6 || !isDigitsOnly(String(otp).trim())) {
      return res
        .status(400)
        .json({ success: false, message: "OTP must be a 6-digit number" });
    }

    const otpRecord = await OtpStore.findOne({ where: { email } });
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new one",
      });
    }

    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one",
      });
    }

    if (String(otpRecord.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await otpRecord.update({ is_verified: true });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      confirmPassword,
      role = "adopter",
    } = req.body;

    if (!firstName || !firstName.trim())
      return res
        .status(400)
        .json({ success: false, message: "First name is required" });
    if (!isAlphaOnly(firstName))
      return res.status(400).json({
        success: false,
        message: "First name must contain only letters",
      });

    if (!lastName || !lastName.trim())
      return res
        .status(400)
        .json({ success: false, message: "Last name is required" });
    if (!isAlphaOnly(lastName))
      return res.status(400).json({
        success: false,
        message: "Last name must contain only letters",
      });

    if (!phoneNumber || !String(phoneNumber).trim())
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    if (!isDigitsOnly(String(phoneNumber)))
      return res.status(400).json({
        success: false,
        message: "Phone number must contain only digits",
      });
    if (String(phoneNumber).trim().length !== 10)
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });

    if (!email || !email.trim())
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    if (!isValidEmail(email))
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });

    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    const passwordError = validatePassword(password);
    if (passwordError)
      return res.status(400).json({ success: false, message: passwordError });

    if (!confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Please confirm your password" });
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });

    if (!["adopter", "shelter"].includes(role))
      return res.status(400).json({
        success: false,
        message: "Role must be either adopter or shelter",
      });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include one uppercase letter, one number, and one special character (!@#$%^&*)",
      });
    }

    // Check OTP was verified
    const otpRecord = await OtpStore.findOne({ where: { email } });
    if (!otpRecord || !otpRecord.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Please verify your email first" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    const existingPhone = await User.findOne({ where: { phone: phoneNumber } });
    if (existingPhone) {
    return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleRecord = await db.Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber,
      email,
      password: hashedPassword,
      role_id: roleRecord.id,
      email_verified: true,
      account_status: "Active",
    });

    await OtpStore.destroy({ where: { email } });

    // Notify all admins about new user registration
    try {
      const admins = await db.User.findAll({
        include: [{ model: db.Role, as: "roleDetails", where: { name: "admin" } }],
        attributes: ["id"],
      });
      const io = getIO();
      const adminMsg = `👤 New user registered: ${user.first_name} ${user.last_name} (${roleRecord.name})`;

      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          message: adminMsg,
          reference_type: "user",
          reference_id: user.id,
        });
        io.to(`user_${admin.id}`).emit("new_notification", {
          message: adminMsg,
          reference_type: "user",
          reference_id: user.id,
          created_at: new Date(),
          is_read: false,
        });
      }
    } catch (err) {
      console.error("Admin new user notification failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: roleRecord.name,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeOAuthProfile = async (req, res) => {
  try {
    const { phone, role } = req.body;
    const userId = req.user.id;

    if (!phone || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required" });
    }
    if (!["adopter", "shelter"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be adopter or shelter" });
    }

    const existingPhone = await User.findOne({ where: { phone: phone.trim() } });
    if (existingPhone && existingPhone.id !== userId) {
      return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    const roleRecord = await db.Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    await User.update({ phone: phone.trim(), role_id: roleRecord.id }, { where: { id: userId } });

    // Re-issue JWT with updated role
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: db.Role, as: "roleDetails" }],
    });

    const payload = { id: updatedUser.id, email: updatedUser.email, role: updatedUser.roleDetails?.name };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    const newRefreshToken = jwt.sign({ id: updatedUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const cookieOpts = (maxAge) => ({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
    });

    res.cookie("accessToken", newAccessToken, cookieOpts(2 * 60 * 60 * 1000));
    res.cookie("refreshToken", newRefreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Profile setup complete",
      data: {
        user: {
          id: updatedUser.id,
          name: `${updatedUser.first_name} ${updatedUser.last_name || ""}`.trim(),
          email: updatedUser.email,
          role: updatedUser.roleDetails?.name,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, phone, location,
      living_situation, preferred_species, pet_experience_years,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Handle profile photo upload
    let profile_photo = user.profile_photo;
    let profile_photo_public_id = user.profile_photo_public_id;

    if (req.file) {
      if (user.profile_photo_public_id) {
        try {
          await cloudinary.uploader.destroy(user.profile_photo_public_id, {
            resource_type: "image",
          });
        } catch (err) {
          console.warn("Could not delete old profile photo:", err.message);
        }
      }
      profile_photo = req.file.path;
      profile_photo_public_id = req.file.filename;
    }

    const normalise = (v) =>
      v !== undefined && v !== null && String(v).trim() !== "" ? v : null;

    const updatedFields = {};

    if (first_name !== undefined)      updatedFields.first_name      = normalise(first_name);
    if (last_name !== undefined)       updatedFields.last_name       = normalise(last_name);
    if (phone !== undefined)           updatedFields.phone           = normalise(phone);
    if (location !== undefined)        updatedFields.location        = normalise(location);
    if (living_situation !== undefined) updatedFields.living_situation = normalise(living_situation);
    if (preferred_species !== undefined) updatedFields.preferred_species = normalise(preferred_species);
    if (pet_experience_years !== undefined)
      updatedFields.pet_experience_years =
        pet_experience_years !== null && String(pet_experience_years).trim() !== ""
          ? Number(pet_experience_years)
          : null;

   // Profile Photo
      if (req.files?.profile_photo?.[0]) {
        const photoFile = req.files.profile_photo[0];
        if (user.profile_photo_public_id) {
          try { await cloudinary.uploader.destroy(user.profile_photo_public_id, { resource_type: "image" }); }
          catch (err) { console.warn("Could not delete old profile photo:", err.message); }
        }
        updatedFields.profile_photo           = photoFile.path;
        updatedFields.profile_photo_public_id = photoFile.filename;
      }
  

    // Aadhaar proof
      if (req.files?.aadhar_proof?.[0]) {
        if (user.aadhar_proof_public_id) {
          try { await cloudinary.uploader.destroy(user.aadhar_proof_public_id, { resource_type: "raw" }); }
          catch (err) { console.warn("Could not delete old aadhaar:", err.message); }
        }
        updatedFields.aadhar_proof_url       = req.files.aadhar_proof[0].path;
        updatedFields.aadhar_proof_public_id = req.files.aadhar_proof[0].filename;
      }

      // Rental agreement
      if (req.files?.rental_agreement?.[0]) {
        if (user.rental_agreement_public_id) {
          try { await cloudinary.uploader.destroy(user.rental_agreement_public_id, { resource_type: "raw" }); }
          catch (err) { console.warn("Could not delete old rental agreement:", err.message); }
        }
        updatedFields.rental_agreement_url       = req.files.rental_agreement[0].path;
        updatedFields.rental_agreement_public_id = req.files.rental_agreement[0].filename;
      }

    const merged = { ...user.toJSON(), ...updatedFields };
    updatedFields.profile_completed = computeProfileCompleted(merged);

    await user.update(updatedFields);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        location: user.location,
        living_situation: user.living_situation,
        preferred_species: user.preferred_species,
        pet_experience_years: user.pet_experience_years,
        profile_completed: user.profile_completed,
        profile_photo: user.profile_photo,
        profile_photo_public_id: user.profile_photo_public_id,
        aadhar_proof_url:     user.aadhar_proof_url,
        rental_agreement_url: user.rental_agreement_url,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cookieOptions = (maxAge) => ({
  httpOnly: true,                                          
  secure: process.env.NODE_ENV === "production",          
  sameSite: "strict",                                      
  maxAge,                                                  
});

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim())
      return res.status(400).json({ success: false, message: "Email is required" });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    if (!password)
      return res.status(400).json({ success: false, message: "Password is required" });

    const user = await User.findOne({
      where: { email },
      include: [{ model: db.Role, as: "roleDetails" }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.account_status === "Banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
      });
    }

    const { Blacklist } = db;
    const blacklisted = await Blacklist.findOne({ where: { user_id: user.id } });
    if (blacklisted) {
      if (user.account_status !== "Banned") {
        await user.update({ account_status: "Banned" });
      }
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
      });
    }

    if (user.oauth_user && user.google_id) {
    return res.status(400).json({
      message: "This account uses Google sign-in. Please continue with Google.",
      authType: "google"  
    });
  }

    if (!user.password) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const payload = { id: user.id, email: user.email, role: user.roleDetails?.name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, cookieOptions(2 * 60 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

    let shelterData = null;
    if (user.roleDetails?.name === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      shelterData = shelter ? { id: shelter.id, name: shelter.name, status: shelter.status } : null;
    }

    let adminData = null;
    if (user.roleDetails?.name === "admin") {
      adminData = { id: user.id };
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          email: user.email,
          role: user.roleDetails?.name,
          shelter: shelterData,
          admin: adminData,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};
// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token= req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: db.Role, as: "roleDetails" }]
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.roleDetails?.name,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
 
  
    res.cookie("accessToken", newAccessToken, cookieOptions(2 * 60 * 60 * 1000));

    let shelterData = null;
    let adminData = null;

    if (user.roleDetails?.name === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      shelterData = shelter ? { id: shelter.id, name: shelter.name } : null;
    }
    if (user.roleDetails?.name === "admin") {
      // add any admin-specific data you need here
      adminData = { id: user.id };
    }
    // adopter has no extra data — just base user is enough

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          email: user.email,
          role: user.roleDetails?.name,
          shelter: shelterData,
          admin: adminData,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logoutUser = (req, res) => {
  // *** FIX *** — pass same options so the browser matches and clears the cookie
  res.clearCookie("accessToken", { sameSite: "lax"});
  res.clearCookie("refreshToken", { sameSite: "lax"});
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
export const getProfile = async (req, res) => {
  res.set("Cache-Control", "no-store");
   if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id", "first_name", "last_name", "email", "phone",
        "account_status", "email_verified", "location",
        "living_situation", "pet_experience_years", "preferred_species",
        "profile_completed", "profile_photo", "profile_photo_public_id","aadhar_proof_url", "rental_agreement_url",  // ← added
        "created_at", "updated_at"
      ],
      include: [{ model: db.Role, as: "roleDetails" }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
   return res.status(200).json({ 
  success: true, 
  data: {
    ...user.toJSON(),
    role: user.roleDetails?.name,
  }
});
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Add at the bottom of user.controller.js

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: db.Role, as: "roleDetails" }],
      attributes: ["id", "first_name", "last_name", "email", "account_status"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let shelterData = null;
    if (user.roleDetails?.name === "shelter") {
      const shelter = await db.Shelter.findOne({ where: { owner_id: user.id } });
      shelterData = shelter ? { id: shelter.id, name: shelter.name, status: shelter.status } : null;
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          email: user.email,
          role: user.roleDetails?.name,
          shelter: shelterData,
          admin: user.roleDetails?.name === "admin" ? { id: user.id } : null,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
