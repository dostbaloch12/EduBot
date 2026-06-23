// ============================================
// INPUT VALIDATION — har auth field check
// NoSQL injection, type confusion, bad data se bachao
// ============================================

import validator from "validator";

// Helper: value string honi chahiye (object/array nahi → NoSQL injection block)
const isCleanString = (v) => typeof v === "string" && v.length > 0;

export const validateSignup = (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  if (!isCleanString(fullName) || fullName.length < 2 || fullName.length > 60) {
    return res.status(400).json({ success: false, error: "Naam 2-60 characters ka hona chahiye" });
  }
  if (!isCleanString(email) || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Sahi email daalें" });
  }
  if (!isCleanString(password) || password.length < 6 || password.length > 100) {
    return res.status(400).json({ success: false, error: "Password kam az kam 6 characters" });
  }
  if (!isCleanString(phone) || !validator.isMobilePhone(phone.replace(/\s/g, ""), "any")) {
    return res.status(400).json({ success: false, error: "Sahi phone number daalें" });
  }

  // Sanitize: extra whitespace hatao
  req.body.email = email.trim().toLowerCase();
  req.body.fullName = fullName.trim();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!isCleanString(email) || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Sahi email daalें" });
  }
  if (!isCleanString(password)) {
    return res.status(400).json({ success: false, error: "Password zaroori hai" });
  }
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateOtp = (req, res, next) => {
  const { email, otp } = req.body;
  if (!isCleanString(email) || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Sahi email daalें" });
  }
  // OTP sirf 6 digit number hona chahiye (string)
  if (otp !== undefined && (!isCleanString(otp) || !/^\d{6}$/.test(otp))) {
    return res.status(400).json({ success: false, error: "OTP 6 digit ka hona chahiye" });
  }
  req.body.email = email.trim().toLowerCase();
  next();
};
