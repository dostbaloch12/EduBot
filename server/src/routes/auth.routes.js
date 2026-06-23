import express from "express";
import {
  signup, login, loginOtp, resendOtp, verifyOtp, getMe,
  sendVerifyEmail, verifyEmail, forgotPassword, resetPassword, googleLogin,
  sendPhoneOtp, confirmPhone,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateSignup, validateLogin, validateOtp } from "../middleware/validate.js";

const router = express.Router();

// Auth
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/login-otp", validateOtp, loginOtp);
router.post("/resend-otp", validateOtp, resendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);

// Google OAuth
router.post("/google", googleLogin);

// Phone verification (Google/naye users ke liye — trial-abuse rokें)
router.post("/send-phone-otp", protect, sendPhoneOtp);
router.post("/confirm-phone", protect, confirmPhone);

// Email verification
router.post("/send-verify-email", protect, sendVerifyEmail);
router.post("/verify-email", verifyEmail);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
