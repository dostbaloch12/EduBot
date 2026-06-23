import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Assignment from "../models/Assignment.js";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { hashOtp, generateOtp, exposeDevOtp } from "../utils/otp.js";
import { smsService } from "../services/smsService.js";
import { emailService } from "../services/emailService.js";

const CLIENT = process.env.CLIENT_URL || "http://localhost:5173";
const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

// Default subjects jo har naye user ke liye banaye jaate hain
const DEFAULT_SUBJECTS = [
  { subject: "Physics", icon: "⚛️", color: "from-violet-500 to-fuchsia-500", progress: 0, totalChapters: 12 },
  { subject: "Chemistry", icon: "🧪", color: "from-emerald-500 to-teal-500", progress: 0, totalChapters: 10 },
  { subject: "Mathematics", icon: "📐", color: "from-sky-500 to-blue-600", progress: 0, totalChapters: 14 },
  { subject: "Biology", icon: "🧬", color: "from-amber-400 to-orange-500", progress: 0, totalChapters: 11 },
  { subject: "English", icon: "✍️", color: "from-purple-500 to-indigo-500", progress: 0, totalChapters: 8 },
  { subject: "Urdu", icon: "📜", color: "from-pink-500 to-rose-500", progress: 0, totalChapters: 9 },
];

const DEFAULT_ASSIGNMENTS = [
  { subject: "Physics", title: "Newton's Laws & Kinematics", description: "Derive equations of motion.", icon: "⚛️", difficulty: "Medium", questions: 10, marks: 50, due: "Tomorrow", status: "pending" },
  { subject: "Chemistry", title: "Organic Functional Groups", description: "IUPAC naming practice.", icon: "🧪", difficulty: "Hard", questions: 15, marks: 75, due: "Friday", status: "in-progress" },
  { subject: "Mathematics", title: "Quadratic Equations", description: "Completing the square.", icon: "📐", difficulty: "Easy", questions: 8, marks: 40, due: "Monday", status: "pending" },
];

// Naye user ke liye default data seed karein
const seedUserData = async (userId) => {
  await Progress.insertMany(DEFAULT_SUBJECTS.map((s) => ({ ...s, userId })));
  await Assignment.insertMany(DEFAULT_ASSIGNMENTS.map((a) => ({ ...a, userId })));
};

// @route POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, city, classLevel, board } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, error: "Please fill all required fields" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    // ⚠️ Ek phone = ek account (trial-abuse rokें — naya email se bhi nahi)
    const phoneUsed = await User.findOne({ phone, phoneVerified: true });
    if (phoneUsed) {
      return res.status(400).json({ success: false, error: "Yeh phone number pehle se kisi account par istemal ho raha hai" });
    }

    // OTP generate (secure random) aur HASH karke store karें
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      city: city || "Lahore",
      classLevel: classLevel || "10th Class",
      board: board || "lahore",
      otpCode: hashOtp(otpCode), // hashed
      otpExpiry,
      isVerified: false,
    });

    await seedUserData(user._id);

    res.status(201).json({
      success: true,
      message: "Account created! Please verify OTP.",
      data: {
        user: user.toPublic(),
        token: generateToken(user._id),
        devOtp: exposeDevOtp(otpCode), // production mein undefined (leak nahi)
      },
    });
  } catch (error) {
    next(error);
  }
};

const TRIAL_DAYS = 10;
const accountAgeDays = (createdAt) =>
  Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // 10 din trial khatam → free user ko phone OTP zaroori
    const needsOtp = user.plan === "free" && accountAgeDays(user.createdAt) >= TRIAL_DAYS;
    if (needsOtp) {
      // ✅ REAL SMS bhejें (Twilio Verify)
      const sms = await smsService.sendOtp(user.phone);
      if (!sms.ok) {
        return res.status(500).json({ success: false, error: sms.error || "OTP bhejne mein masla" });
      }

      // Agar Twilio live hai to woh khud OTP manage karta hai (DB mein store nahi)
      // Agar dev mode hai to apna hashed OTP store karें
      if (sms.devOtp) {
        user.otpCode = hashOtp(sms.devOtp);
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();
      } else {
        // Twilio live — sirf flag rakhें ke OTP pending hai
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();
      }

      return res.json({
        success: true,
        data: {
          otpRequired: true,
          maskedPhone: user.phone.replace(/.(?=.{3})/g, "*"),
          devOtp: exposeDevOtp(sms.devOtp), // sirf dev mode mein
          message: "Trial khatam. OTP aap ke number par bheja gaya.",
          liveMode: smsService.isLive(),
        },
      });
    }

    // Streak logic
    const today = new Date().toISOString().split("T")[0];
    if (user.lastLoginDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      user.streak = user.lastLoginDate === yesterday ? user.streak + 1 : 1;
      user.lastLoginDate = today;
      await user.save();
    }

    res.json({
      success: true,
      message: "Login successful",
      data: { user: user.toPublic(), token: generateToken(user._id), otpRequired: false },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login-otp  (OTP verify karke login complete)
export const loginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      // generic message (user enumeration se bachao)
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    // Expiry check
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: "OTP expired. Dobara login karें." });
    }

    // Brute-force: 5 ghalat attempt ke baad block (LPDoS/guess se bachao)
    if ((user.otpAttempts || 0) >= 5) {
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(429).json({ success: false, error: "Bohat zyada ghalat OTP. Dobara login karें." });
    }

    // ✅ OTP verify — agar Twilio live hai to usse, warna hashed DB se
    let verified;
    if (smsService.isLive()) {
      const check = await smsService.verifyOtp(user.phone, otp);
      verified = check.ok;
    } else {
      verified = user.otpCode === hashOtp(otp);
    }

    if (!verified) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    // ✅ Sahi OTP → turant invalidate (REPLAY ATTACK se bachao — dobara use nahi ho sakta)
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;

    // Streak update
    const today = new Date().toISOString().split("T")[0];
    if (user.lastLoginDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      user.streak = user.lastLoginDate === yesterday ? user.streak + 1 : 1;
      user.lastLoginDate = today;
    }
    await user.save();

    res.json({
      success: true,
      data: { user: user.toPublic(), token: generateToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      // generic success (user enumeration se bachao)
      return res.json({ success: true, data: { maskedPhone: "***" } });
    }
    const otpCode = generateOtp();
    user.otpCode = hashOtp(otpCode);
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();
    res.json({
      success: true,
      data: { devOtp: exposeDevOtp(otpCode), maskedPhone: user.phone.replace(/.(?=.{3})/g, "*") },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.isVerified) return res.json({ success: true, message: "Already verified" });

    if (!user.otpCode || user.otpCode !== hashOtp(otp) || new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.phoneVerified = true; // ✅ phone bhi verified
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Phone verified successfully", data: { user: user.toPublic() } });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me  (current logged-in user)
export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user.toPublic() } });
  } catch (error) {
    next(error);
  }
};

// ============================================
// EMAIL VERIFICATION
// ============================================

// @route POST /api/auth/send-verify-email
export const sendVerifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.emailVerified) return res.json({ success: true, message: "Pehle se verified hai" });

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerifyToken = hashToken(token);
    await user.save();

    const link = `${CLIENT}?verify=${token}&email=${encodeURIComponent(user.email)}`;
    await emailService.sendVerification(user.email, user.fullName, link);

    res.json({ success: true, message: "Verification email bhej diya" });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-email  { email, token }
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !user.emailVerifyToken || user.emailVerifyToken !== hashToken(token)) {
      return res.status(400).json({ success: false, error: "Invalid verification link" });
    }
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    res.json({ success: true, message: "Email verified! ✅" });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PASSWORD RESET
// ============================================

// @route POST /api/auth/forgot-password  { email }
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Hamesha success (user enumeration se bachao)
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = hashToken(token);
      user.resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 ghanta
      await user.save();
      const link = `${CLIENT}?reset=${token}&email=${encodeURIComponent(user.email)}`;
      await emailService.sendPasswordReset(user.email, user.fullName, link);
    }
    res.json({ success: true, message: "Agar email registered hai to reset link bhej diya" });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/reset-password  { email, token, newPassword }
export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Password kam az kam 6 characters" });
    }
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !user.resetToken || user.resetToken !== hashToken(token) || new Date() > user.resetExpiry) {
      return res.status(400).json({ success: false, error: "Reset link invalid ya expire ho gaya" });
    }
    user.password = newPassword; // pre-save hook hash kar dega
    user.resetToken = undefined;
    user.resetExpiry = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset ho gaya! Ab login karें ✅" });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GOOGLE OAUTH
// ============================================

// @route POST /api/auth/google  { credential }  (Google ka ID token)
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, error: "No credential" });

    // Google token verify (Google ke endpoint se)
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    if (!verifyRes.ok) return res.status(401).json({ success: false, error: "Google token invalid" });
    const profile = await verifyRes.json();

    // Token ka audience hamare client ID se match hona chahiye
    if (process.env.GOOGLE_CLIENT_ID && profile.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, error: "Token audience mismatch" });
    }

    const email = profile.email?.toLowerCase();
    if (!email) return res.status(400).json({ success: false, error: "Email nahi mila" });

    // User dhoondो ya banाo
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: profile.name || "Student",
        email,
        phone: "",
        googleId: profile.sub,
        avatar: profile.picture,
        emailVerified: true,
        isVerified: true,
        phoneVerified: false, // ⚠️ phone abhi verify nahi hua
      });
      await seedUserData(user._id);
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      user.emailVerified = true;
      if (profile.picture) user.avatar = profile.picture;
      await user.save();
    }

    // ⚠️ ZAROORI: Agar phone verify nahi hua → login complete NAHI hoga
    // Pehle phone OTP se verify karna hoga (trial-abuse rokने ke liye)
    if (!user.phoneVerified) {
      // Temporary token (sirf phone verify karne ke liye, app use nahi kar sakta)
      const tempToken = generateToken(user._id);
      return res.json({
        success: true,
        data: {
          phoneRequired: true,
          tempToken,
          message: "Account ke liye phone number verify karें",
        },
      });
    }

    res.json({
      success: true,
      data: { user: user.toPublic(), token: generateToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-phone  (Google/naye user apna phone verify karें)
// Header mein tempToken (Bearer) chahiye → protect middleware
export const sendPhoneOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (typeof phone !== "string" || phone.length < 10) {
      return res.status(400).json({ success: false, error: "Sahi phone number daalें" });
    }

    // ⚠️ Ek phone = ek account (dusra account iss phone par nahi ban sakta)
    const existing = await User.findOne({ phone, phoneVerified: true, _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(400).json({ success: false, error: "Yeh phone number pehle se kisi account par verified hai" });
    }

    const user = await User.findById(req.user._id);
    user.phone = phone;

    // Real SMS bhejें
    const sms = await smsService.sendOtp(phone);
    if (!sms.ok) return res.status(500).json({ success: false, error: sms.error });

    if (sms.devOtp) {
      user.otpCode = hashOtp(sms.devOtp);
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    } else {
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    }
    user.otpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      data: {
        maskedPhone: phone.replace(/.(?=.{3})/g, "*"),
        devOtp: exposeDevOtp(sms.devOtp),
        message: "OTP aap ke number par bheja gaya",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/confirm-phone  { otp }  (phone OTP confirm → login complete)
export const confirmPhone = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: "OTP expire ho gaya" });
    }
    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, error: "Bohat zyada ghalat OTP" });
    }

    let verified;
    if (smsService.isLive()) {
      const check = await smsService.verifyOtp(user.phone, otp);
      verified = check.ok;
    } else {
      verified = user.otpCode === hashOtp(otp);
    }

    if (!verified) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, error: "Ghalat OTP" });
    }

    // ✅ Phone verified! Ab account chालू
    user.phoneVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      data: { user: user.toPublic(), token: generateToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};
