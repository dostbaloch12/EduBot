import { useState, useRef, useEffect } from "react";
import { useI18n, LANGUAGES } from "../i18n";

export default function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  // Bahir click hone par dropdown band karें
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/10"
        title="Language / زبان"
      >
        <span>🌐</span>
        <span className="max-w-[64px] truncate">{current.short}</span>
        <span className={`text-[8px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="animate-scale-in absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#120f3a]/95 p-1.5 shadow-2xl shadow-violet-900/50 backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300/60">
            Choose Language
          </div>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-500/30"
                    : "text-violet-100 hover:bg-white/10"
                }`}
              >
                <span>{l.name}</span>
                <span className={`text-sm ${active ? "text-white" : "text-amber-300"}`} dir="rtl">
                  {l.native}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
