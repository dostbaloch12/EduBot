// ============================================
// REAL SMS / OTP SERVICE
// Twilio Verify use karta hai (asli SMS bhejta hai)
// Agar Twilio keys na hon to console par dikhata hai (dev mode)
// ============================================

import twilio from "twilio";

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SID = process.env.TWILIO_VERIFY_SID;

// Twilio client (sirf tab banega jab keys mojood hon)
let client = null;
if (SID && TOKEN && VERIFY_SID) {
  client = twilio(SID, TOKEN);
  console.log("✅ Twilio SMS service active (real OTP enabled)");
} else {
  console.warn("⚠️ Twilio keys nahi mili — OTP console par dikhega (dev mode)");
}

// Pakistan number ko international format mein (+92...)
const toIntl = (phone) => {
  let p = phone.replace(/[\s-]/g, "");
  if (p.startsWith("0")) p = "+92" + p.slice(1);
  else if (p.startsWith("92")) p = "+" + p;
  else if (!p.startsWith("+")) p = "+92" + p;
  return p;
};

export const smsService = {
  // Kya real SMS available hai?
  isLive: () => client !== null,

  // OTP bhejें (Twilio khud OTP generate aur verify karta hai)
  async sendOtp(phone) {
    const number = toIntl(phone);
    if (!client) {
      // Dev mode: nakli OTP return karें (testing)
      const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`📱 [DEV OTP] ${number} → ${devOtp}`);
      return { ok: true, devOtp };
    }
    try {
      await client.verify.v2.services(VERIFY_SID).verifications.create({
        to: number,
        channel: "sms",
      });
      return { ok: true }; // real SMS gaya — koi devOtp nahi
    } catch (err) {
      console.error("Twilio sendOtp error:", err.message);
      return { ok: false, error: "OTP bhejne mein masla. Number check karें." };
    }
  },

  // OTP verify karें
  async verifyOtp(phone, code) {
    const number = toIntl(phone);
    if (!client) {
      // Dev mode: koi bhi 6-digit accept (testing) — production mein NAHI
      return { ok: /^\d{6}$/.test(code) };
    }
    try {
      const check = await client.verify.v2
        .services(VERIFY_SID)
        .verificationChecks.create({ to: number, code });
      return { ok: check.status === "approved" };
    } catch (err) {
      console.error("Twilio verifyOtp error:", err.message);
      return { ok: false, error: "OTP verify nahi hua." };
    }
  },
};
