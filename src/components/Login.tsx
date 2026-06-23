import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth";
import { CITIES } from "../data";
import { BOARDS } from "../courses";
import { useI18n } from "../i18n";
import LanguageSelector from "./LanguageSelector";

export default function Login() {
  const { login, signup, verifyLoginOtp, resendLoginOtp, forgotPassword, googleLogin, sendPhoneOtp, confirmPhone } = useAuth();
  const { t, rtl } = useI18n();
  const [mode, setMode] = useState<"login" | "signup" | "otp" | "phone">("login");
  const [phoneStep, setPhoneStep] = useState<"enter" | "otp">("enter");

  // Forgot password
  const handleForgot = async () => {
    if (!email) { setError("Pehle apna email daalें"); return; }
    setError(""); setBusy(true);
    const res = await forgotPassword(email);
    setBusy(false);
    setInfo(res.message || "Agar email registered hai to reset link bhej diya gaya hai.");
  };

  // Google login
  const handleGoogle = async () => {
    setError(""); setBusy(true);
    const res = await googleLogin("demo-google-credential");
    setBusy(false);
    if (res.phoneRequired) {
      // ⚠️ Google login hua par phone verify zaroori → phone screen kholें
      setMode("phone");
      setPhoneStep("enter");
      setInfo("Account ke liye apna phone number verify karें (security)");
    } else if (!res.ok) {
      setError(res.error || "Google login failed");
    }
  };

  // Phone OTP bhejें
  const handleSendPhoneOtp = async () => {
    if (!phone || phone.length < 10) { setError("Sahi phone number daalें"); return; }
    setError(""); setBusy(true);
    const res = await sendPhoneOtp(phone);
    setBusy(false);
    if (res.ok) {
      setMaskedPhone(res.maskedPhone || "");
      setDemoOtp(res.devOtp || "");
      setOtpDigits(["", "", "", "", "", ""]);
      setPhoneStep("otp");
      setInfo(`OTP ${res.maskedPhone} par bheja gaya`);
    } else {
      setError(res.error || "OTP bhejne mein masla");
    }
  };

  // Phone OTP confirm → login complete
  const handleConfirmPhone = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) { setError("Poora 6-digit OTP daalें"); return; }
    setError(""); setBusy(true);
    const res = await confirmPhone(code);
    setBusy(false);
    if (!res.ok) { setError(res.error || "Ghalat OTP"); setOtpDigits(["", "", "", "", "", ""]); }
  };
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lahore");
  const [board, setBoard] = useState("lahore");
  const [classLevel, setClassLevel] = useState("10th Class");

  // OTP fields
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError("");
    setInfo("");
  };

  // ---- Login / Signup submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    if (mode === "login") {
      const res = await login(email, password);
      setBusy(false);

      if (res.otpRequired) {
        // 10 din trial khatam → OTP screen kholें
        setMaskedPhone(res.maskedPhone || "");
        setDemoOtp(res.devOtp || "");
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(30);
        setMode("otp");
        setInfo(`Trial khatam! OTP aap ke number ${res.maskedPhone} par bheja gaya.`);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }
      if (!res.ok) setError(res.error || "Login failed");
    } else {
      const res = await signup({ fullName, email, password, phone, city, classLevel, board });
      setBusy(false);
      if (!res.ok) setError(res.error || "Signup failed");
    }
  };

  // ---- OTP digit input ----
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ---- OTP verify ----
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Poora 6-digit OTP daalें");
      return;
    }
    setBusy(true);
    const res = await verifyLoginOtp(email, code);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "OTP verification failed");
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  // ---- Resend OTP ----
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    const res = await resendLoginOtp(email);
    if (res.ok) {
      setDemoOtp(res.devOtp || "");
      setMaskedPhone(res.maskedPhone || maskedPhone);
      setResendTimer(30);
      setInfo(`Naya OTP ${res.maskedPhone} par bheja gaya.`);
    }
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="noise-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07061d] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="mesh-bg absolute inset-0 opacity-70" />
        <div className="animate-drift absolute -left-32 top-10 h-[32rem] w-[32rem] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="animate-drift absolute right-10 top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-[120px]" style={{ animationDelay: "4s" }} />
        <div className="animate-drift absolute bottom-10 left-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-500/20 blur-[130px]" style={{ animationDelay: "8s" }} />
      </div>

      {/* Top-right language selector */}
      <div className="absolute right-5 top-5 z-20">
        <LanguageSelector />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-4xl shadow-xl shadow-violet-900/50">
            🕌
          </div>
          <h2 className="font-display mt-6 text-4xl font-bold tracking-tight text-white">
            Edu<span className="shimmer-text">Bot</span>
          </h2>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-200/70">
            {t("tagline")}
          </p>
        </div>

        {/* ============ OTP SCREEN ============ */}
        {mode === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="glass-strong border-gradient mt-8 space-y-5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl">📱</div>
              <h3 className="font-display mt-4 text-2xl font-bold text-white">Phone Verification</h3>
              <p className="mt-2 text-sm text-violet-200/80">
                10-din trial khatam ho gaya. Security ke liye OTP aap ke number
                <span className="font-bold text-amber-300"> {maskedPhone} </span>
                par bheja gaya hai.
              </p>
            </div>

            {/* Demo OTP hint */}
            {demoOtp && (
              <div className="rounded-xl border border-sky-300/30 bg-sky-500/15 px-4 py-2.5 text-center text-sm text-sky-200">
                🔑 Demo OTP (testing): <span className="font-bold tracking-widest">{demoOtp}</span>
              </div>
            )}

            {/* 6-digit OTP inputs */}
            <div className="flex justify-center gap-2" dir="ltr">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => {
                    // Clipboard se sirf 6 digits accept (clipboard attack safe)
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (pasted) {
                      const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
                      setOtpDigits(next);
                      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                    }
                  }}
                  className="h-14 w-12 rounded-2xl border border-white/10 bg-white/5 text-center text-2xl font-bold text-white focus:border-amber-300 focus:bg-white/10 focus:outline-none"
                />
              ))}
            </div>

            {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-200">⚠️ {error}</div>}

            <button type="submit" disabled={busy}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 p-0.5 font-bold text-white shadow-xl shadow-violet-900/40 transition disabled:opacity-60">
              <span className="relative block rounded-[15px] bg-[#0b0a2b]/40 px-8 py-4 transition group-hover:bg-transparent">
                {busy ? "Verifying..." : "Verify & Login →"}
              </span>
            </button>

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => switchMode("login")} className="text-violet-300 hover:text-white transition">
                ← Back to Login
              </button>
              <button type="button" onClick={handleResend} disabled={resendTimer > 0}
                className="font-semibold text-amber-300 hover:text-amber-200 transition disabled:opacity-50">
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        ) : mode === "phone" ? (
          /* ============ PHONE VERIFY (Google/naye users) ============ */
          <div className="glass-strong border-gradient mt-8 space-y-5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl">📱</div>
              <h3 className="font-display mt-4 text-2xl font-bold text-white">Phone Verify Karें</h3>
              <p className="mt-2 text-sm text-violet-200/80">
                Security ke liye har account ka phone number verify hona zaroori hai.
                Yeh trial ka galat istemal rokta hai.
              </p>
            </div>

            {phoneStep === "enter" ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
                </div>
                {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2.5 text-sm text-rose-200">⚠️ {error}</div>}
                {info && <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2.5 text-sm text-emerald-200">✅ {info}</div>}
                <button onClick={handleSendPhoneOtp} disabled={busy}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 font-bold text-white shadow-xl shadow-violet-500/30 transition disabled:opacity-60">
                  {busy ? "Bhej raha hun..." : "OTP Bhejें →"}
                </button>
              </>
            ) : (
              <>
                {demoOtp && (
                  <div className="rounded-xl border border-sky-300/30 bg-sky-500/15 px-4 py-2.5 text-center text-sm text-sky-200">
                    🔑 Demo OTP: <span className="font-bold tracking-widest">{demoOtp}</span>
                  </div>
                )}
                <div className="flex justify-center gap-2" dir="ltr">
                  {otpDigits.map((digit, i) => (
                    <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric"
                      autoComplete="one-time-code" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-12 rounded-2xl border border-white/10 bg-white/5 text-center text-2xl font-bold text-white focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
                  ))}
                </div>
                {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2.5 text-sm text-rose-200">⚠️ {error}</div>}
                <button onClick={handleConfirmPhone} disabled={busy}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 font-bold text-white shadow-xl shadow-violet-500/30 transition disabled:opacity-60">
                  {busy ? "Verifying..." : "Verify & Enter →"}
                </button>
              </>
            )}
            <button onClick={() => { setMode("login"); setError(""); setInfo(""); }} className="w-full text-center text-xs text-violet-300 hover:text-white">
              ← Cancel
            </button>
          </div>
        ) : (
          /* ============ LOGIN / SIGNUP ============ */
          <>
            <div className="mt-8 flex rounded-2xl border border-white/10 bg-white/5 p-1">
              <button onClick={() => switchMode("login")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg" : "text-violet-200/70"}`}>
                Login
              </button>
              <button onClick={() => switchMode("signup")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === "signup" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg" : "text-violet-200/70"}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="glass-strong border-gradient mt-4 space-y-4 rounded-[2.5rem] p-8 shadow-2xl">
              {mode === "signup" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ayesha Khan"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
              </div>

              {mode === "signup" && (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Phone Number (OTP yahan aayega)</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="0300 1234567"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">City</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                      {CITIES.map((c) => <option key={c.name} value={c.name} className="bg-[#120f3a]">{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Education Board</label>
                    <select value={board} onChange={(e) => setBoard(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                      {BOARDS.map((b) => <option key={b.id} value={b.id} className="bg-[#120f3a]">{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Grade</label>
                    <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                      <option value="9th Class" className="bg-[#120f3a]">9th Class</option>
                      <option value="10th Class" className="bg-[#120f3a]">10th Class</option>
                      <option value="11th Class (FSc/ICS)" className="bg-[#120f3a]">11th Class (FSc/ICS)</option>
                      <option value="12th Class (FSc/ICS)" className="bg-[#120f3a]">12th Class (FSc/ICS)</option>
                    </select>
                  </div>
                </>
              )}

              {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-200">⚠️ {error}</div>}
              {info && <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-200">✅ {info}</div>}

              <button type="submit" disabled={busy}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 p-0.5 font-bold text-white shadow-xl shadow-violet-900/40 transition hover:shadow-violet-900/60 disabled:opacity-60">
                <span className="relative block rounded-[15px] bg-[#0b0a2b]/40 px-8 py-4 transition group-hover:bg-transparent">
                  {busy ? "Please wait..." : mode === "login" ? "Login →" : "Create Account →"}
                </span>
              </button>

              {/* Forgot password (sirf login mode mein) */}
              {mode === "login" && (
                <button type="button" onClick={handleForgot} className="w-full text-center text-xs font-semibold text-violet-300 transition hover:text-white">
                  Password bhool gaye?
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-violet-200/50">ya</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google login */}
              <button type="button" onClick={handleGoogle} disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google se Login
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-xs text-violet-200/60">
          🔒 JWT Secured · 10-Day Trial · Phone OTP Protected
        </div>
      </div>
    </div>
  );
}
