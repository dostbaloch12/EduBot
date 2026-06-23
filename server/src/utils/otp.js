import crypto from "crypto";

// OTP ko hash karke store karें — DB leak ho to bhi OTP plain text mein na mile
export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

// 6-digit cryptographically secure OTP (Math.random nahi — woh predictable hai)
export const generateOtp = () => {
  // crypto.randomInt = secure random
  return crypto.randomInt(100000, 1000000).toString();
};

// Production mein devOtp hide karें, development mein dikhao (demo/testing ke liye)
export const exposeDevOtp = (otp) =>
  process.env.NODE_ENV === "production" ? undefined : otp;
