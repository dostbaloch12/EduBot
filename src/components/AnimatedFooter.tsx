export default function AnimatedFooter({ onPrivacy, onTerms }: { onPrivacy?: () => void; onTerms?: () => void }) {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.06] bg-[#0b0a26]/60 py-16 backdrop-blur-xl">
      {/* shooting star top-right */}
      <div className="pointer-events-none absolute right-[10%] top-8 h-0.5 w-28 rotate-[25deg] rounded-full bg-gradient-to-l from-white/70 to-transparent animate-shoot" />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        {/* ===== Animated cityscape scene ===== */}
        <div className="relative h-44 w-full max-w-2xl">
          <svg viewBox="0 0 800 200" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b2a6b" />
                <stop offset="100%" stopColor="#2a1d4d" />
              </linearGradient>
            </defs>

            {/* Buildings (left) */}
            <g fill="url(#bld)">
              <rect x="150" y="70" width="34" height="105" rx="2" />
              <rect x="190" y="40" width="40" height="135" rx="2" />
              <rect x="236" y="85" width="30" height="90" rx="2" />
              <rect x="272" y="55" width="36" height="120" rx="2" />
              <rect x="314" y="95" width="28" height="80" rx="2" />
            </g>
            {/* building windows (twinkling) */}
            <g fill="#fbbf24">
              <rect x="200" y="55" width="5" height="5" className="animate-twinkle" />
              <rect x="214" y="70" width="5" height="5" className="animate-twinkle" style={{ animationDelay: "0.6s" }} />
              <rect x="284" y="72" width="5" height="5" className="animate-twinkle" style={{ animationDelay: "1.1s" }} />
              <rect x="290" y="92" width="5" height="5" className="animate-twinkle" style={{ animationDelay: "1.6s" }} />
              <rect x="162" y="88" width="5" height="5" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
            </g>

            {/* Trees + lamp (right) */}
            <g>
              <circle cx="640" cy="120" r="30" fill="#0d9488" />
              <circle cx="678" cy="130" r="24" fill="#0f766e" />
              <rect x="700" y="95" width="4" height="80" fill="#3b2a6b" />
              <circle cx="702" cy="92" r="9" fill="#fbbf24" className="animate-twinkle" />
            </g>

            {/* Road line */}
            <line x1="130" y1="175" x2="700" y2="175" stroke="#5b4a8a" strokeWidth="2" strokeDasharray="2 6" />

            {/* ===== Moving group: cyclist pulling car ===== */}
            <g className="footer-vehicle">
              {/* rope */}
              <line x1="372" y1="168" x2="430" y2="168" stroke="#8b7bb8" strokeWidth="2" />

              {/* Car */}
              <g>
                <path d="M430 168 q4 -34 40 -34 l40 0 q26 0 34 22 l8 12 z" fill="#ef4444" />
                <path d="M470 138 l34 0 q18 0 24 16 l-58 0 z" fill="#bfdbfe" />
                <circle cx="452" cy="170" r="11" fill="#1f2937" />
                <circle cx="452" cy="170" r="5" fill="#9ca3af" />
                <circle cx="510" cy="170" r="11" fill="#1f2937" />
                <circle cx="510" cy="170" r="5" fill="#9ca3af" />
                <circle cx="528" cy="158" r="5" fill="#fbbf24" />
              </g>

              {/* Bicycle */}
              <g>
                <circle cx="320" cy="168" r="22" fill="none" stroke="#a78bfa" strokeWidth="3" className="footer-wheel" style={{ transformOrigin: "320px 168px" }} />
                <circle cx="368" cy="168" r="22" fill="none" stroke="#a78bfa" strokeWidth="3" className="footer-wheel" style={{ transformOrigin: "368px 168px" }} />
                {/* frame */}
                <path d="M320 168 L344 140 L368 168 M344 140 L344 168 M320 168 L344 168" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                <path d="M344 140 L356 132" stroke="#e5e7eb" strokeWidth="2.5" />
              </g>

              {/* Rider */}
              <g fill="#f97316">
                <circle cx="344" cy="118" r="7" />
                <path d="M344 125 L344 150 L350 134 L356 132" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M344 150 L348 168" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" className="footer-leg" style={{ transformOrigin: "344px 150px" }} />
                <path d="M344 150 L340 168" stroke="#ea580c" strokeWidth="4" fill="none" strokeLinecap="round" className="footer-leg2" style={{ transformOrigin: "344px 150px" }} />
              </g>
            </g>
          </svg>
        </div>

        {/* ===== Heading ===== */}
        <h2 className="font-display mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Feel free to connect with us.
        </h2>
        <p className="mt-3 text-base text-violet-200/70">
          Sawalat, support ya feedback — humein zaroor batayein.
        </p>

        {/* ===== Social icons ===== */}
        <div className="mt-8 flex items-center gap-4">
          {[
            { icon: "💬", label: "Chat", color: "from-violet-500/30 to-fuchsia-500/20" },
            { icon: "👥", label: "Community", color: "from-fuchsia-500/30 to-pink-500/20" },
            { icon: "✉️", label: "Email", color: "from-sky-500/30 to-indigo-500/20" },
          ].map((s) => (
            <button
              key={s.label}
              aria-label={s.label}
              title={s.label}
              className={`group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${s.color} text-xl backdrop-blur transition hover:-translate-y-1 hover:border-white/25`}
            >
              <span className="transition-transform group-hover:scale-125">{s.icon}</span>
            </button>
          ))}
        </div>

        {/* ===== Let's Talk button ===== */}
        <button className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-bold text-white transition hover:border-amber-300/40 hover:bg-white/[0.08]">
          Let's Talk
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>

        {/* ===== Divider + brand ===== */}
        <div className="mt-12 flex w-full max-w-sm items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Edu<span className="shimmer-text">Bot</span>
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
        </div>

        <p className="mt-5 text-sm text-violet-200/70">
          Developed with <span className="text-rose-400">❤️</span> for Pakistani students
        </p>

        {/* Legal links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-violet-200/60">
          <button onClick={onPrivacy} className="transition hover:text-white">Privacy Policy</button>
          <span className="text-violet-200/30">·</span>
          <button onClick={onTerms} className="transition hover:text-white">Terms of Service</button>
          <span className="text-violet-200/30">·</span>
          <span>support@edubot.pk</span>
        </div>

        <p className="mt-3 text-xs text-violet-200/50">
          © {new Date().getFullYear()} EduBot · Pakistan
        </p>
      </div>
    </footer>
  );
}
