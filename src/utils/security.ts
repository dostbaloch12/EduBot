// ============================================
// FRONTEND SECURITY UTILITIES
// Client-side input safai (defence-in-depth)
// NOTE: Yeh sirf pehli layer hai — asal security
// hamesha BACKEND par honi chahiye.
// ============================================

// Email validation (simple, ReDoS-safe regex)
export const isValidEmail = (email: string): boolean => {
  if (typeof email !== "string" || email.length > 254) return false;
  // Linear regex (no nested quantifiers) — ReDoS-safe
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Pakistan phone validation
export const isValidPhone = (phone: string): boolean => {
  if (typeof phone !== "string") return false;
  const clean = phone.replace(/[\s-]/g, "");
  return /^(\+92|0)?3\d{9}$/.test(clean);
};

// Input ki max length enforce karें (DoS/huge-input se bachao)
export const clampInput = (value: string, max = 500): string => {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
};

// HTML special chars escape (XSS defence — agar kabhi raw render karna ho)
export const escapeHtml = (str: string): string => {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Sirf strings allow karें (object/array → NoSQL injection vector block)
export const ensureString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

// Clipboard se safe digits nikaalें (OTP paste ke liye)
export const extractDigits = (text: string, max = 6): string => {
  if (typeof text !== "string") return "";
  return text.replace(/\D/g, "").slice(0, max);
};

// Password strength check
export const passwordStrength = (pw: string): { ok: boolean; msg: string } => {
  if (typeof pw !== "string" || pw.length < 6)
    return { ok: false, msg: "Password kam az kam 6 characters" };
  if (pw.length > 100) return { ok: false, msg: "Password bohat lamba hai" };
  return { ok: true, msg: "" };
};
