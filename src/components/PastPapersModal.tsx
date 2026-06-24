import { useState } from "react";

interface PastPapersModalProps {
  onClose: () => void;
  onDone: (m: string) => void;
}

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu", "Computer Science", "Pak Studies"];
const YEARS = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"];
const CLASSES = ["9th Class", "10th Class", "11th Class", "12th Class"];

const ICONS: Record<string, string> = {
  Physics: "⚛️", Chemistry: "🧪", Mathematics: "📐", Biology: "🧬",
  English: "✍️", Urdu: "📜", "Computer Science": "💻", "Pak Studies": "🇵🇰",
};

export default function PastPapersModal({ onClose, onDone }: PastPapersModalProps) {
  const [cls, setCls] = useState("10th Class");
  const [subject, setSubject] = useState("Physics");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 w-full max-w-3xl overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute left-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">← Back</button>
        <button onClick={onClose} className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        {/* Header */}
        <div className="mt-12 flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">10-Year Past Papers</h3>
            <p className="text-sm text-violet-200/70">Board ke solved past papers — har subject, har saal</p>
          </div>
        </div>

        {/* Class selector */}
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Class</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button key={c} onClick={() => setCls(c)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${cls === c ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg" : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Subject selector */}
        <div className="mt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Subject</label>
          <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-2">
            {SUBJECTS.map((s) => (
              <button key={s} onClick={() => setSubject(s)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${subject === s ? "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"}`}>
                <span>{ICONS[s] || "📘"}</span> {s}
              </button>
            ))}
          </div>
        </div>

        {/* Papers list (10 years) */}
        <div className="mt-5">
          <h4 className="font-display mb-3 text-lg font-bold text-white">
            {ICONS[subject]} {subject} · {cls}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {YEARS.map((year) => (
              <div key={year} className="glass-card flex items-center justify-between rounded-2xl p-4 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-500/20 text-xs font-bold text-rose-200">
                    PDF
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{subject} {year}</div>
                    <div className="text-xs text-violet-200/60">Solved key + AI hints</div>
                  </div>
                </div>
                <button
                  onClick={() => onDone(`📥 ${subject} ${year} ${cls} download shuru hua`)}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-bold text-white shadow transition hover:from-violet-600 hover:to-fuchsia-600"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
          💡 Total {YEARS.length * SUBJECTS.length * CLASSES.length}+ past papers available!
        </div>
      </div>
    </div>
  );
}
