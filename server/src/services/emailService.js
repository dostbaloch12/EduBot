// ============================================
// EMAIL SERVICE — Resend / SMTP
// Email verification + password reset ke liye
// Agar key na ho to console par dikhता hai (dev mode)
//
// FREE option: Resend (https://resend.com) — 3000 email/mahina muft
// ============================================

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "EduBot <onboarding@resend.dev>";

export const emailService = {
  isLive: () => Boolean(RESEND_KEY),

  // Email bhejें (Resend API se)
  async send(to, subject, html) {
    if (!RESEND_KEY) {
      // Dev mode — console par dikhao
      console.log(`📧 [DEV EMAIL] To: ${to}\n   Subject: ${subject}\n   ${html.replace(/<[^>]+>/g, " ").slice(0, 200)}`);
      return { ok: true, dev: true };
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
      });
      if (!res.ok) throw new Error("Resend error " + res.status);
      return { ok: true };
    } catch (err) {
      console.error("Email error:", err.message);
      return { ok: false, error: "Email bhejne mein masla" };
    }
  },

  // Verification email
  async sendVerification(to, name, link) {
    return this.send(
      to,
      "EduBot — Apna email verify karें",
      `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>🕌 EduBot mein khush aamdeed, ${name}!</h2>
        <p>Apna email verify karne ke liye neeche button dabायें:</p>
        <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">Email Verify Karें</a>
        <p style="color:#888;font-size:12px;margin-top:20px">Agar aap ne signup nahi kiya to iss email ko ignore karें.</p>
      </div>`
    );
  },

  // Password reset email
  async sendPasswordReset(to, name, link) {
    return this.send(
      to,
      "EduBot — Password reset karें",
      `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>🔑 Password Reset</h2>
        <p>Salaam ${name}, password reset karne ke liye neeche button dabायें:</p>
        <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">Naya Password Banaayें</a>
        <p style="color:#888;font-size:12px;margin-top:20px">Yeh link 1 ghante mein expire ho jayegी. Agar aap ne request nahi ki to ignore karें.</p>
      </div>`
    );
  },
};
