import { useState } from "react";

interface HelpModalProps {
  onClose: () => void;
  onDone: (m: string) => void;
}

const FAQS = [
  { q: "Trial kitne din ka hai?", a: "Free trial 10 din ka hai jismein 35 questions milte hain. Iske baad har login par aap ke phone number par OTP aayega." },
  { q: "AI Tutor kaise use karें?", a: "Dashboard par 'AI Tutor' section mein apna sawal type karें. Jawab ko awaz (🔊) mein bhi sun sakte hain — English aur Urdu dono!" },
  { q: "Plan upgrade kaise karें?", a: "Dashboard par upgrade banner se Basic (Rs 1,500) ya Premium (Rs 2,800) chunें. EasyPaisa, JazzCash ya Card se payment karें." },
  { q: "Konse boards support hain?", a: "FBISE, BISE Lahore, Karachi (BSEK), Peshawar, aur Quetta. Saath hi CSS, MDCAT, ECAT, PPSC test prep bhi." },
  { q: "Kya main apni zubaan badal sakta hun?", a: "Haan! Header mein 🌐 icon se Urdu, Punjabi, Sindhi, Pashto, Balochi ya English chun sakte hain." },
  { q: "XP aur Streak kya hai?", a: "Quiz aur assignments complete karne par XP milta hai (level barhता hai). Streak rozana login karne se barhता hai." },
];

export default function HelpModal({ onClose, onDone }: HelpModalProps) {
  const [open, setOpen] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onDone("✅ Message bhej diya! Hamari team jald rabta karegi.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-3xl">💬</span>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Help & Support</h3>
            <p className="text-sm text-violet-200/70">Sawalat ya madad ke liye humse rabta karें</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-5">
          <h4 className="font-display text-lg font-bold text-white">❓ Aksar Pooche Jane Wale Sawal</h4>
          <div className="mt-3 space-y-2">
            {FAQS.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-white">
                  {f.q}
                  <span className={`transition-transform ${open === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open === i && <div className="border-t border-white/10 p-4 text-sm leading-relaxed text-violet-200/90">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSend} className="mt-6 space-y-3">
          <h4 className="font-display text-lg font-bold text-white">📩 Hamein Message Bhejें</h4>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aap ka naam"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:outline-none" />
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Aap ka sawal ya feedback..." required
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:outline-none" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-violet-200/60">📧 support@edubot.pk · 📞 0300-EDUBOT</div>
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600">
              Send Message →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
