import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import { sendResetEmail } from "../../utils/mailer.js";

const { User } = db;

const cookieOptions = (maxAge) => ({
  httpOnly: true,                                        
  secure: process.env.NODE_ENV === "production",         
  sameSite: "strict",                                    
  maxAge,                                               
});

/*
FORGOT PASSWORD
POST /users/forgot-password
Body: { email }
*/
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ where: { email } });

    // Always return success even if email not found (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to user
    await user.update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    });

    // Build reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email
    await sendResetEmail(email, resetLink);

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
RESET PASSWORD
POST /users/reset-password
Body: { token, newPassword }
*/
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }


    // Find user with valid token
    const user = await User.findOne({ where: { reset_token: token } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // Check token expiry
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired. Please request a new one",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    });

    // Auto login — generate tokens
    const payload = {
  id: user.id,
  email: user.email,
  role: user.roleDetails?.name,
};

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
    res.cookie("accessToken", accessToken, cookieOptions(2 * 60 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: {
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          email: user.email,
          role: user.roleDetails?.name,
        },
      },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};