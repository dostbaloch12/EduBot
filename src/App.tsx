import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useAuth } from "./auth";
import { useI18n } from "./i18n";
import { useTilt, useReveal } from "./useAnims";
import { backend } from "./backend/api";
import type { Assignment, SubjectProgress, QuizResult, PublicUser } from "./backend/types";
import { CITIES } from "./data";
import { BOARDS, BOARD_COURSES, TEST_PREP, type TestPrep, type BoardId } from "./courses";
import Login from "./components/Login";
import QuizModal from "./components/QuizModal";
import TutorChat from "./components/TutorChat";
import LanguageSelector from "./components/LanguageSelector";
import TestPrepModal from "./components/TestPrepModal";
import PaymentModal from "./components/PaymentModal";
import QAPractice from "./components/QAPractice";
import AnimatedFooter from "./components/AnimatedFooter";
import NotificationBell from "./components/NotificationBell";
import ProfileModal from "./components/ProfileModal";
import LeaderboardModal from "./components/LeaderboardModal";
import HelpModal from "./components/HelpModal";
import LegalModal from "./components/LegalModal";
import CookieConsent from "./components/CookieConsent";
import CourseModal from "./components/CourseModal";
import PastPapersModal from "./components/PastPapersModal";
import type { Course } from "./courses";
import { fetchPrayerTimes, type PrayerTimings } from "./services/prayerApi";
import { trackEvent } from "./utils/analytics";

// 3D scene ko lazy-load karein taake initial load fast rahe
const Scene3D = lazy(() => import("./components/Scene3D"));


// 3D tilt card wrapper
function TiltCard({ className, onClick, children }: { className?: string; onClick?: () => void; children: React.ReactNode }) {
  const ref = useTilt<HTMLButtonElement>(8);
  return (
    <button ref={ref} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

// Reveal-on-scroll wrapper
function Reveal({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

// ---------- helpers ----------
const pad = (n: number) => n.toString().padStart(2, "0");
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const formatClock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const formatCountdown = (total: number) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ---------- background ----------
function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

// Premium aurora + floating orbs + shooting stars (live background)
function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* breathing mesh gradient */}
      <div className="mesh-bg absolute inset-0 opacity-70" />
      {/* drifting orbs */}
      <div className="animate-drift absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="animate-drift absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[120px]" style={{ animationDelay: "6s" }} />
      <div className="animate-drift absolute bottom-20 left-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-500/15 blur-[130px]" style={{ animationDelay: "12s" }} />
      <div className="animate-drift absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-indigo-600/20 blur-[120px]" style={{ animationDelay: "3s" }} />
      {/* shooting stars */}
      <div className="absolute right-1/4 top-10 h-0.5 w-24 rounded-full bg-gradient-to-l from-white to-transparent animate-shoot" style={{ animationDelay: "1s" }} />
      <div className="absolute right-1/3 top-32 h-0.5 w-16 rounded-full bg-gradient-to-l from-violet-200 to-transparent animate-shoot" style={{ animationDelay: "4s" }} />
      <div className="absolute right-1/2 top-20 h-0.5 w-20 rounded-full bg-gradient-to-l from-amber-200 to-transparent animate-shoot" style={{ animationDelay: "7.5s" }} />
    </div>
  );
}

function MosqueSilhouette() {
  return (
    <svg viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" style={{ height: "min(420px, 38vh)" }}>
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b0a2b" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path d="M0,260 L0,320 L1440,320 L1440,260 Z" fill="url(#mg)" />
      <g fill="#1e1b4b" opacity="0.55">
        <rect x="80" y="200" width="180" height="100" rx="4" />
        <circle cx="170" cy="170" r="14" />
        <path d="M170,156 L170,130" stroke="#fbbf24" strokeWidth="2" />
      </g>
      <g fill="#1e1b4b" opacity="0.7">
        <rect x="620" y="140" width="28" height="160" />
        <rect x="792" y="140" width="28" height="160" />
        <circle cx="634" cy="140" r="18" />
        <circle cx="806" cy="140" r="18" />
        <path d="M634,122 L634,96" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M806,122 L806,96" stroke="#fbbf24" strokeWidth="2.5" />
        <rect x="560" y="180" width="320" height="120" rx="6" />
        <path d="M560,180 Q720,80 880,180 Z" />
        <circle cx="720" cy="130" r="6" fill="#fbbf24" />
        <path d="M720,124 L720,100" stroke="#fbbf24" strokeWidth="3" />
        <rect x="700" y="230" width="40" height="70" rx="4" fill="#0b0a2b" opacity="0.8" />
      </g>
      <g fill="#1e1b4b" opacity="0.5">
        <rect x="1180" y="210" width="200" height="90" rx="4" />
        <circle cx="1280" cy="185" r="12" />
        <path d="M1280,173 L1280,152" stroke="#fbbf24" strokeWidth="2" />
      </g>
    </svg>
  );
}

// ---------- header ----------
function Header({ user, onLogout, onNav, onProfile, onLeaderboard, onHelp }: { user: PublicUser; onLogout: () => void; onNav: (v: string) => void; onProfile: () => void; onLeaderboard: () => void; onHelp: () => void }) {
  const { t } = useI18n();
  const tabs = [
    { id: "Dashboard", label: t("dashboard") },
    { id: "Courses", label: t("courses") },
    { id: "TestPrep", label: t("testPrep") },
    { id: "Quiz", label: t("quiz") },
    { id: "Assignments", label: t("assignments") },
  ];
  const [active, setActive] = useState("Dashboard");
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-[#07061d]/70 px-6 py-3.5 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-2xl shadow-lg shadow-violet-900/50">
          <span className="absolute inset-0 rounded-2xl bg-white/10" />
          <span className="relative">🕌</span>
        </div>
        <div>
          <div className="font-display text-xl font-bold tracking-tight text-white">Edu<span className="shimmer-text">Bot</span></div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300/70">{t("tagline")}</div>
        </div>
      </div>
      <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-sm text-violet-200 md:flex">
        {tabs.map((n) => (
          <button
            key={n.id}
            onClick={() => { setActive(n.id); onNav(n.id); }}
            className={`rounded-full px-4 py-1.5 font-medium transition-all duration-300 ${active === n.id ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30" : "hover:bg-white/[0.06] hover:text-white"}`}
          >
            {n.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        {(() => {
          const b = BOARDS.find((x) => x.id === user.board) ?? BOARDS[1];
          return (
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-bold text-white md:flex" title={b.fullName}>
              <span>{b.icon}</span>
              <span className="hidden lg:inline">{b.name}</span>
            </div>
          );
        })()}
        {backend.trialInfo(user).active && (
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-200 md:flex">
            🎁 {backend.trialInfo(user).daysLeft}d
          </div>
        )}
        <div className="hidden items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-sm font-bold text-amber-200 lg:flex">
          ⭐ {user.xp} XP · Lvl {user.level}
        </div>
        {/* Leaderboard */}
        <button onClick={onLeaderboard} title="Leaderboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-lg transition hover:bg-white/[0.08]">
          🏆
        </button>
        {/* Help */}
        <button onClick={onHelp} title="Help & Support" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-lg transition hover:bg-white/[0.08]">
          💬
        </button>
        {/* Notifications */}
        <NotificationBell />
        {/* Student name button (click → profile) + language selector */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 pl-1.5 transition hover:bg-white/[0.06]">
          <button onClick={onProfile} className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/[0.06]" title="My Profile">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-[#0b0a2b] shadow-md shadow-amber-900/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-semibold text-white sm:inline">{user.name}</span>
          </button>
          <LanguageSelector />
        </div>
        <button onClick={onLogout} className="rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/30 hover:text-white">
          {t("logout")}
        </button>
      </div>
    </header>
  );
}

// ---------- clock ----------
function ClockCard({ now }: { now: Date }) {
  const { t } = useI18n();
  const day = now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const time = formatClock(now);
  return (
    <div className="glass-strong live-border relative overflow-hidden rounded-[2rem] p-10 text-center">
      <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 animate-drift rounded-full bg-violet-500/25 blur-[80px]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-52 w-52 animate-drift rounded-full bg-amber-500/20 blur-[90px]" style={{ animationDelay: "5s" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-200/90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {t("liveTime")}
        </div>
        <div className="mt-5 font-display text-7xl font-bold tracking-tighter text-white text-shadow-glow tabular-nums sm:text-8xl md:text-[7rem] md:leading-none">{time}</div>
        <div className="mt-5 text-lg font-medium text-violet-200/90">{day}</div>
      </div>
    </div>
  );
}

function CityBar({ selected, onSelect }: { selected: string; onSelect: (n: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-12">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-xl">🕌</span>
        <span className="font-display text-xl font-bold text-white">{t("prayerTitle")}</span>
      </div>
      <div className="scrollbar-hide -mx-2 flex gap-2 overflow-x-auto px-2 pb-2">
        {CITIES.map((c) => {
          const active = c.name === selected;
          return (
            <button
              key={c.name}
              onClick={() => onSelect(c.name)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${active ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40" : "border-white/[0.08] bg-white/[0.03] text-violet-100 hover:border-white/20 hover:bg-white/[0.08]"}`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NextPrayerCard({ city, now, live }: { city: (typeof CITIES)[number]; now: Date; live: PrayerTimings | null }) {
  const { t } = useI18n();
  // Agar live API se times mil gaye to woh use karें, warna static fallback
  const src = live ?? city;
  const prayers = [
    { key: "fajr", label: "Fajr", urdu: "فجر", time: src.fajr, icon: "🌙" },
    { key: "sunrise", label: "Sunrise", urdu: "طلوع", time: src.sunrise, icon: "🌅" },
    { key: "dhuhr", label: "Dhuhr", urdu: "ظهر", time: src.dhuhr, icon: "☀️" },
    { key: "asr", label: "Asr", urdu: "عصر", time: src.asr, icon: "⛅" },
    { key: "maghrib", label: "Maghrib", urdu: "مغرب", time: src.maghrib, icon: "🌇" },
    { key: "isha", label: "Isha", urdu: "عشاء", time: src.isha, icon: "🌙" },
  ];
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const next = prayers.find((p) => toMinutes(p.time) > currentMin) ?? prayers[0];
  let diff = (toMinutes(next.time) - currentMin) * 60 - now.getSeconds();
  if (diff < 0) diff += 24 * 60 * 60;

  return (
    <>
      <div className="glass-strong border-gradient mt-6 grid grid-cols-1 gap-6 rounded-3xl p-7 md:grid-cols-3">
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200/70">{t("nextPrayer")}</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-amber-300">{next.label}</span>
            <span dir="rtl" className="text-3xl font-bold text-white/90">({next.urdu})</span>
          </div>
          <div className="mt-1.5 text-sm text-violet-200/70">{t("in")} {city.name} · Pakistan</div>
        </div>
        <div className="text-center md:border-x md:border-white/10">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200/70">{t("adhanTime")}</div>
          <div className="mt-2 font-display text-4xl font-bold tabular-nums text-white">{next.time}</div>
          <div className="mt-1.5 text-sm text-violet-200/70">{next.icon} {next.label}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200/70">{t("countdown")}</div>
          <div className="mt-2 font-display text-4xl font-bold tabular-nums text-white text-shadow-glow">{formatCountdown(diff)}</div>
          <div className="mt-1.5 text-sm text-violet-200/70">⏳ {t("timeLeft")}</div>
        </div>
      </div>
      <div className="stagger mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {prayers.map((p) => {
          const isNext = p.key === next.key;
          return (
            <div key={p.key} className={`glass-card lift group relative overflow-hidden rounded-2xl p-5 text-center ${isNext ? "glow-violet ring-1 ring-violet-400/50" : ""}`}>
              {isNext && <span className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-2 py-0.5 text-[10px] font-bold text-[#0b0a2b]">{t("next")}</span>}
              <div className="text-3xl transition-transform duration-300 group-hover:scale-110">{p.icon}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-200/70">{p.label}</div>
              <div dir="rtl" className="mt-1 text-lg font-bold text-white/90">{p.urdu}</div>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-amber-300">{p.time}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StatsRow({ user }: { user: PublicUser }) {
  const { t } = useI18n();
  const trial = backend.trialInfo(user);
  const plan = backend.planInfo(user);
  const quota = backend.dailyQuota(user);
  const isUnlimited = trial.active || plan.active;

  // second stat card logic
  let secondCard;
  if (trial.active) {
    // trial: total 35 sawal cap (no longer unlimited)
    secondCard = { label: t("trialQuestions"), value: `${quota.remaining}/${quota.limit}`, sub: t("trialQLeft"), icon: "🎁" };
  } else if (plan.active) {
    // paid: fair-use 200/din
    secondCard = { label: t("fairUse"), value: `${quota.remaining}/${quota.limit}`, sub: t("perDay"), icon: "♾️" };
  } else {
    // free plan → daily 40 questions
    secondCard = { label: t("dailyQuestions"), value: `${quota.remaining}/${quota.limit}`, sub: t("today"), icon: "📝" };
  }

  void isUnlimited;
  const tints = ["from-violet-500/20", "from-emerald-500/20", "from-sky-500/20", "from-amber-500/20"];
  const stats = [
    { label: t("plan"), value: user.plan, sub: t("current"), icon: "💎" },
    secondCard,
    { label: t("streak"), value: `${user.streak}🔥`, sub: t("days"), icon: "🔥" },
  ];
  return (
    <div className="stagger mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {stats.map((s, i) => (
        <div key={s.label} className="glass-card sheen group relative overflow-hidden rounded-2xl p-5 text-center transition-transform duration-300 hover:-translate-y-1.5">
          <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 animate-drift rounded-full bg-gradient-to-br ${tints[i]} to-transparent blur-2xl`} style={{ animationDelay: `${i}s` }} />
          <div className="relative">
            <div className="animate-bob text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>{s.icon}</div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-200/70">{s.label}</div>
            <div className="font-display mt-1 text-3xl font-bold capitalize text-white">{s.value}</div>
            <div className="text-xs text-violet-200/60">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpgradeBanner({ user, onUpgrade, busy }: { user: PublicUser; onUpgrade: (p: "basic" | "premium") => void; busy: boolean }) {
  const { t } = useI18n();
  const plans = [
    { id: "basic" as const, name: "Basic", price: "Rs 1,500", desc: "15 Days Unlimited", icon: "💳", color: "from-sky-500/30" },
    { id: "premium" as const, name: "Premium", price: "Rs 2,800", desc: t("monthUnlimited"), icon: "⭐", color: "from-amber-500/30", featured: true },
  ];
  const trial = backend.trialInfo(user);
  const plan = backend.planInfo(user);
  if (user.plan === "premium")
    return (
      <div className="glass-strong mt-6 flex flex-col items-center justify-center gap-1 rounded-3xl p-6 text-center">
        <div className="text-lg font-bold text-amber-200">⭐ {t("premiumActive")}</div>
        {plan.active && <div className="text-sm text-violet-200/80">⏳ {plan.daysLeft} {t("daysLeftPlan")}</div>}
      </div>
    );
  if (trial.active)
    return (
      <div className="glass-strong mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-300/20 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-float">🎁</span>
          <div>
            <div className="text-lg font-bold text-emerald-200">{t("trialActive")}</div>
            <div className="mt-1 text-sm text-violet-200/80">
              ⏳ {trial.daysLeft} {t("daysLeft")} · 🎁 {backend.dailyQuota(user).remaining}/{backend.TRIAL_TOTAL_LIMIT} {t("trialQuestions")}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {plans.map((p) => (
            <button key={p.id} disabled={busy} onClick={() => onUpgrade(p.id)} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${p.color} to-violet-900/40 px-5 py-3 text-left transition hover:-translate-y-0.5 disabled:opacity-60 ${p.featured ? "ring-2 ring-amber-300" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">{p.price}</span>
              </div>
              <div className="mt-1 text-xs text-violet-100/90">{busy ? t("processing") : p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  return (
    <div className="glass-strong mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl p-6 md:flex-row">
      <div>
        <div className="flex items-center gap-2 text-xl font-bold text-white"><span>🎯</span><span>{trial.daysLeft === 0 ? t("trialExpired") : t("upgradeTitle")}</span></div>
        <div className="mt-1 text-sm text-violet-200/80">{t("upgradeSub")}</div>
      </div>
      <div className="flex flex-wrap gap-3">
        {plans.map((p) => (
          <button
            key={p.id}
            disabled={busy}
            onClick={() => onUpgrade(p.id)}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${p.color} to-violet-900/40 px-5 py-3 text-left transition hover:-translate-y-0.5 disabled:opacity-60 ${p.featured ? "ring-2 ring-amber-300" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{p.icon}</span>
              <span className="text-sm font-semibold text-white">{p.name}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">{p.price}</span>
            </div>
            <div className="mt-1 text-xs text-violet-100/90">{busy ? t("processing") : p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeaturesGrid({ onQuiz, onTutor, onQA, onPastPapers, notify }: { onQuiz: () => void; onTutor: () => void; onQA: () => void; onPastPapers: () => void; notify: (m: string) => void }) {
  const { t } = useI18n();
  const feats = [
    { title: t("practiceQuiz"), subtitle: t("chapterMcqs"), icon: "📝", action: onQuiz, featured: true },
    { title: t("qaPractice"), subtitle: t("qaSub"), icon: "🎓", action: onQA, featured: true },
    { title: t("aiTutor"), subtitle: t("personalMentor"), icon: "🤖", action: onTutor },
    { title: t("chapterNotes"), subtitle: t("aiSummary"), icon: "📘", action: () => notify(`${t("chapterNotes")} ${t("comingSoon")}`) },
    { title: t("pastPapers"), subtitle: t("solveBoard"), icon: "🎯", action: onPastPapers },
    { title: t("liveDoubts"), subtitle: t("askTeacher"), icon: "💬", action: onTutor },
  ];
  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-xl">⚡</span>
        <span className="font-display text-xl font-bold text-white">{t("quickFeatures")}</span>
      </div>
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feats.map((f) => (
          <button key={f.title} onClick={f.action} className={`glass-card lift group relative overflow-hidden rounded-3xl p-6 text-left ${f.featured ? "glow-violet" : ""}`}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-violet-500/25 to-fuchsia-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
            <div className="relative">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/15 text-3xl shadow-inner shadow-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{f.icon}</div>
              <div className="font-display mt-4 text-lg font-bold text-white">{f.title}</div>
              <div className="mt-1 text-sm text-violet-200/70">{f.subtitle}</div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 transition-all group-hover:gap-2.5">{t("startNow")} <span className="transition-transform group-hover:translate-x-0.5">→</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressSection({ items }: { items: SubjectProgress[] }) {
  const { t } = useI18n();
  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-xl">📊</span>
        <span className="font-display text-xl font-bold text-white">{t("yourProgress")}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] px-3 py-1 text-xs font-medium text-emerald-200/90">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{t("liveBackend")}
        </span>
      </div>
      <div className="glass-card rounded-3xl p-6">
        <div className="space-y-5">
          {items.slice(0, 4).map((s) => (
            <div key={s.subject}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white"><span className="text-xl">{s.icon}</span><span className="font-semibold">{s.subject}</span></div>
                <span className="text-sm font-bold text-amber-300">{s.progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-700`} style={{ width: `${s.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectGrid({ items, onPick }: { items: SubjectProgress[]; onPick: (n: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-xl">📚</span>
        <span className="font-display text-xl font-bold text-white">{t("selectSubject")}</span>
      </div>
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((s) => (
          <button key={s.subject} onClick={() => onPick(s.subject)} className="glass-card lift group relative overflow-hidden rounded-2xl p-5 text-center">
            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/15 text-3xl transition-transform duration-300 group-hover:scale-110">{s.icon}</div>
              <div className="font-display mt-3 text-lg font-bold text-white">{s.subject}</div>
              <div className="mt-1 text-xs text-violet-200/70">{s.progress}% {t("complete")}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-700`} style={{ width: `${s.progress}%` }} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- assignments ----------
const STATUS_META: Record<Assignment["status"], { label: string; classes: string; dot: string }> = {
  pending: { label: "Pending", classes: "bg-amber-400/15 text-amber-200 border-amber-300/30", dot: "bg-amber-300" },
  "in-progress": { label: "In Progress", classes: "bg-sky-400/15 text-sky-200 border-sky-300/30", dot: "bg-sky-300" },
  submitted: { label: "Submitted", classes: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30", dot: "bg-emerald-300" },
  overdue: { label: "Overdue", classes: "bg-rose-400/15 text-rose-200 border-rose-300/30", dot: "bg-rose-300" },
};
const DIFFICULTY_META: Record<Assignment["difficulty"], string> = {
  Easy: "from-emerald-500/20 to-teal-500/10 text-emerald-200 border-emerald-300/30",
  Medium: "from-amber-500/20 to-orange-500/10 text-amber-200 border-amber-300/30",
  Hard: "from-rose-500/20 to-pink-500/10 text-rose-200 border-rose-300/30",
};

function AssignmentCard({ a, onSubmit, busy }: { a: Assignment; onSubmit: (id: string) => void; busy: boolean }) {
  const { t } = useI18n();
  const status = STATUS_META[a.status];
  return (
    <div className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/10">
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-2xl">{a.icon}</div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-violet-200/80">{a.subject}</div>
              <div className="text-lg font-bold text-white">{a.title}</div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.classes}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />{status.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-violet-200/80">{a.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-200/70">{t("questions")}</div>
            <div className="text-lg font-bold text-white">{a.questions}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-200/70">{a.obtainedMarks != null ? t("score") : t("marks")}</div>
            <div className="text-lg font-bold text-amber-300">{a.obtainedMarks != null ? `${a.obtainedMarks}/${a.marks}` : a.marks}</div>
          </div>
          <div className={`rounded-2xl border bg-gradient-to-br ${DIFFICULTY_META[a.difficulty]} p-3 text-center`}>
            <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{t("level")}</div>
            <div className="text-lg font-bold">{a.difficulty}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-violet-200/80"><span className="mr-1">📅</span>{a.due}</div>
          <button
            onClick={() => onSubmit(a.id)}
            disabled={a.status === "submitted" || busy}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {a.status === "submitted" ? `✓ ${t("done")}` : busy ? "…" : `${t("submit")} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentSection({ items, onSubmit, busyId }: { items: Assignment[]; onSubmit: (id: string) => void; busyId: string | null }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | Assignment["status"]>("all");
  const [query, setQuery] = useState("");
  const filtered = items.filter((a) => {
    const ms = filter === "all" || a.status === filter;
    const mq = !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.subject.toLowerCase().includes(query.toLowerCase());
    return ms && mq;
  });
  const submitted = items.filter((i) => i.status === "submitted").length;
  const completion = items.length ? Math.round((submitted / items.length) * 100) : 0;
  const tabs: { key: typeof filter; label: string; count: number }[] = [
    { key: "all", label: t("all"), count: items.length },
    { key: "pending", label: t("pending"), count: items.filter((a) => a.status === "pending").length },
    { key: "in-progress", label: t("inProgress"), count: items.filter((a) => a.status === "in-progress").length },
    { key: "submitted", label: t("submitted"), count: submitted },
    { key: "overdue", label: t("overdue"), count: items.filter((a) => a.status === "overdue").length },
  ];
  return (
    <div className="mt-12" id="assignments">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-9 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <span className="text-3xl">📝</span>
          <div>
            <div className="font-display text-2xl font-bold text-white">{t("assignments")}</div>
            <div className="text-sm text-violet-200/70">{t("assignmentsSub")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition focus-within:border-violet-400/50">
          <span className="text-violet-200">🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} className="w-40 bg-transparent text-sm text-white placeholder:text-violet-200/60 outline-none" />
        </div>
      </div>
      <div className="glass-strong border-gradient rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-amber-300">{t("overview")}</div>
            <div className="mt-1 text-2xl font-bold text-white">{submitted} / {items.length} {t("submitted")}</div>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1 flex justify-between text-xs font-semibold text-violet-200"><span>{t("completion")}</span><span className="text-amber-300">{completion}%</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-all duration-700" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <button key={t.key} onClick={() => setFilter(t.key)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-violet-300 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30" : "border-white/10 bg-white/5 text-violet-100 hover:bg-white/10"}`}>
              {t.label}<span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-white/10"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => <AssignmentCard key={a.id} a={a} onSubmit={onSubmit} busy={busyId === a.id} />)}
      </div>
      {filtered.length === 0 && (
        <div className="glass mt-6 rounded-3xl p-10 text-center">
          <div className="text-5xl">🗂️</div>
          <div className="mt-2 text-lg font-bold text-white">{t("noAssignments")}</div>
        </div>
      )}
    </div>
  );
}

function RecentResults({ results }: { results: QuizResult[] }) {
  const { t } = useI18n();
  if (results.length === 0) return null;
  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-xl">🏅</span>
        <span className="font-display text-xl font-bold text-white">{t("recentResults")}</span>
      </div>
      <div className="glass-card rounded-3xl p-4">
        <div className="space-y-2">
          {results.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-lg">
                {r.score === r.total ? "🏆" : "📘"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{r.subject}</div>
                <div className="text-xs text-violet-200/70">{new Date(r.takenAt).toLocaleString("en-GB")}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{r.score}/{r.total}</div>
                <div className="text-xs text-amber-300">+{r.xpEarned} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Courses (9th, 10th, FA, FSc) — board-specific ----------
function CoursesSection({ board, onPick }: { board: BoardId; onPick: (course: Course) => void }) {
  const { t } = useI18n();
  const boardInfo = BOARDS.find((b) => b.id === board) ?? BOARDS[1];
  return (
    <div className="mt-14" id="courses">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="h-9 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
        <span className="text-3xl">🎓</span>
        <div>
          <div className="font-display text-2xl font-bold text-white">{t("courses")}</div>
          <div className="text-sm text-violet-200/70">{t("coursesSub")}</div>
        </div>
        {/* current board badge */}
        <div className={`ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r ${boardInfo.color} bg-opacity-20 px-4 py-1.5 text-sm font-bold text-white`}>
          <span>{boardInfo.icon}</span>
          <span>{boardInfo.name}</span>
        </div>
      </div>
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(BOARD_COURSES[board] || []).map ((c) => (
          <TiltCard
            key={c.id}
            onClick={() => onPick(c)}
            className="glass-card sheen group relative block overflow-hidden rounded-3xl p-6 text-left"
          >
            <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 animate-drift rounded-full bg-gradient-to-br ${c.color} opacity-30 blur-3xl`} />
            <div className="relative">
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-3xl shadow-lg`}>
                {c.icon}
              </div>
              <div className="mt-4 text-2xl font-extrabold text-white">{c.name}</div>
              <div className="text-xs text-violet-200/80">{c.fullName}</div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.subjects.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-violet-100">{s}</span>
                ))}
                {c.subjects.length > 4 && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-violet-100">+{c.subjects.length - 4}</span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-violet-200/80">
                <span>📚 {c.subjects.length} {t("subjects")}</span>
                <span>📖 {c.chapters} {t("chapters")}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 transition group-hover:gap-2">
                {t("startLearning")} →
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}

// ---------- Job & Entry Test Prep (CSS, MDCAT, ECAT, PPSC) ----------
function TestPrepSection({ onOpen }: { onOpen: (prep: TestPrep) => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-14" id="testprep">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-9 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
        <span className="text-3xl">🏆</span>
        <div>
          <div className="font-display text-2xl font-bold text-white">{t("testPrep")}</div>
          <div className="text-sm text-violet-200/70">{t("testPrepSub")}</div>
        </div>
      </div>
      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2">
        {TEST_PREP.map((p) => (
          <TiltCard
            key={p.id}
            onClick={() => onOpen(p)}
            className="glass-card sheen group relative block overflow-hidden rounded-3xl p-6 text-left"
          >
            <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-drift rounded-full bg-gradient-to-br ${p.color} opacity-30 blur-3xl`} />
            <div className="relative flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-4xl shadow-lg`}>
                {p.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-white">{p.name}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-violet-100">{p.category}</span>
                </div>
                <div className="mt-0.5 text-xs text-violet-200/80">{p.fullName}</div>
                <p className="mt-2 text-sm text-violet-100/90">{p.desc}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-violet-200/80">
                  <span>📚 {p.totalMcqs.toLocaleString()}+ {t("mcqsAvailable")}</span>
                  <span>📄 {p.pastPapers.length} {t("pastPapersCount")}</span>
                  <span>👥 {p.enrolled} {t("enrolled")}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 transition group-hover:gap-2">
                  {t("prepareNow")} →
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex animate-scale-in items-center gap-2.5 rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500/95 to-fuchsia-500/95 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-violet-900/50 backdrop-blur-xl">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
      {message}
    </div>
  );
}

// ---------- main ----------
export default function App() {
  const { user, loading, logout, refresh } = useAuth();
  const { t, rtl } = useI18n();
  const [now, setNow] = useState(new Date());
  const [city, setCity] = useState("Quetta");
  const [toast, setToast] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizOpen, setQuizOpen] = useState(false);
  const [busyAssign, setBusyAssign] = useState<string | null>(null);
  const [activePrep, setActivePrep] = useState<TestPrep | null>(null);
  const [payPlan, setPayPlan] = useState<"basic" | "premium" | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [livePrayer, setLivePrayer] = useState<PrayerTimings | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<"privacy" | "terms" | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [pastPapersOpen, setPastPapersOpen] = useState(false);
  const [chapterCtx, setChapterCtx] = useState<{ subject: string; chapter: string; classLevel: string } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // City change hone par live prayer times fetch karें (Aladhan API)
  useEffect(() => {
    let active = true;
    setLivePrayer(null); // purane times saaf
    fetchPrayerTimes(city).then((t) => {
      if (active) setLivePrayer(t);
    });
    return () => { active = false; };
  }, [city]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const loadData = async () => {
    if (!user) return;
    const [a, p, r] = await Promise.all([
      backend.assignments.list(user.id),
      backend.progress.list(user.id),
      backend.quizzes.results(user.id),
    ]);
    setAssignments(a);
    setProgress(p);
    setResults(r);
  };

  useEffect(() => {
    if (user) {
      setCity(user.city);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const notify = (m: string) => setToast(m);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07061d] text-white">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="animate-float text-6xl">🕌</div>
          <div className="font-display text-xl font-bold">Edu<span className="shimmer-text">Bot</span></div>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const selectedCity = CITIES.find((c) => c.name === city) ?? CITIES[0];

  const handleUpgrade = (plan: "basic" | "premium") => {
    // open EasyPaisa / payment checkout
    setPayPlan(plan);
  };

  const handleSubmitAssignment = async (id: string) => {
    setBusyAssign(id);
    const res = await backend.assignments.submit(id);
    setBusyAssign(null);
    if (res.ok) {
      await loadData();
      await refresh();
      notify(`Submitted! ${res.data.obtainedMarks}/${res.data.marks} marks · +15 XP`);
    }
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="noise-overlay relative min-h-screen overflow-hidden bg-[#07061d] text-white">
      {/* layered premium gradient base */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#07061d] via-[#150d33] to-[#1a0f28]" />
      {/* Immersive scroll-based 3D scene (Three.js) */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-[#3a1530]/60 via-[#1a0f28]/20 to-transparent" />
      <Aurora />
      <Stars />
      <MosqueSilhouette />

      <div className="relative z-10">
        <Header
          user={user}
          onLogout={() => { logout(); }}
          onNav={(v) => {
            if (v === "Quiz") setQuizOpen(true);
            else if (v === "Assignments") document.getElementById("assignments")?.scrollIntoView({ behavior: "smooth" });
            else if (v === "Courses") document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
            else if (v === "TestPrep") document.getElementById("testprep")?.scrollIntoView({ behavior: "smooth" });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onProfile={() => setProfileOpen(true)}
          onLeaderboard={() => setLeaderboardOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="animate-fade-up mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                {t("greeting")}, {user.name.split(" ")[0]} <span className="animate-wave">👋</span>
              </div>
              <h1 className="font-display mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{t("welcomeBack")}</h1>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-5 py-3 text-sm font-bold text-amber-200 glow-gold animate-pulse-ring">
              <span className="text-lg">🔥</span> {user.streak} {t("dayStreak")}
            </div>
          </div>

          <ClockCard now={now} />
          <CityBar selected={city} onSelect={(n) => { setCity(n); notify(`Switched to ${n}`); }} />
          <NextPrayerCard city={selectedCity} now={now} live={livePrayer} />
          <StatsRow user={user} />
          <UpgradeBanner user={user} onUpgrade={handleUpgrade} busy={false} />
          <FeaturesGrid onQuiz={() => { setQuizOpen(true); trackEvent("quiz_opened"); }} onTutor={() => document.getElementById("tutor")?.scrollIntoView({ behavior: "smooth" })} onQA={() => { setQaOpen(true); trackEvent("qa_opened"); }} onPastPapers={() => setPastPapersOpen(true)} notify={notify} />

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3" id="tutor">
            <TutorChat userId={user.id} onQuotaChange={refresh} />
            <RecentResults results={results} />
          </div>

          <Reveal><ProgressSection items={progress} /></Reveal>
          <Reveal><SubjectGrid items={progress} onPick={(n) => { notify(`${n} quiz khul raha hai…`); setQuizOpen(true); }} /></Reveal>
          <Reveal><CoursesSection board={user.board as BoardId} onPick={(c) => setActiveCourse(c)} /></Reveal>
          <Reveal><TestPrepSection onOpen={(p) => setActivePrep(p)} /></Reveal>
          <Reveal><AssignmentSection items={assignments} onSubmit={handleSubmitAssignment} busyId={busyAssign} /></Reveal>
        </main>
        <AnimatedFooter onPrivacy={() => setLegalPage("privacy")} onTerms={() => setLegalPage("terms")} />
      </div>

      {quizOpen && <QuizModal userId={user.id} chapterCtx={chapterCtx} onClose={() => { setQuizOpen(false); setChapterCtx(null); loadData(); refresh(); }} onDone={(m) => notify(m)} />}
      {activePrep && <TestPrepModal prep={activePrep} onClose={() => setActivePrep(null)} onDone={(m) => notify(m)} />}
      {payPlan && (
        <PaymentModal
          userId={user.id}
          initialPlan={payPlan}
          onClose={() => { setPayPlan(null); refresh(); }}
          onDone={(m) => { notify(m); refresh(); }}
        />
      )}
      {qaOpen && <QAPractice chapterCtx={chapterCtx} onClose={() => { setQaOpen(false); setChapterCtx(null); }} onDone={(m) => notify(m)} />}
      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onDone={(m) => notify(m)} />}
      {leaderboardOpen && <LeaderboardModal user={user} onClose={() => setLeaderboardOpen(false)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} onDone={(m) => notify(m)} />}
      {legalPage && <LegalModal type={legalPage} onClose={() => setLegalPage(null)} />}
      <CookieConsent onPrivacy={() => setLegalPage("privacy")} />
      {activeCourse && (
        <CourseModal
          course={activeCourse}
          board={user.board}
          onClose={() => setActiveCourse(null)}
          onStartQuiz={(ctx) => { setChapterCtx(ctx || null); setQuizOpen(true); }}
          onQAPractice={(ctx) => { setChapterCtx(ctx || null); setQaOpen(true); }}
          onAskTutor={() => document.getElementById("tutor")?.scrollIntoView({ behavior: "smooth" })}
        />
      )}
      {pastPapersOpen && <PastPapersModal onClose={() => setPastPapersOpen(false)} onDone={(m) => notify(m)} />}
      {toast && <Toast message={toast} />}
    </div>
  );
}
