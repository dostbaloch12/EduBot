import { useState } from "react";
import type { PublicUser } from "../backend/types";
import { CITIES } from "../data";
import { BOARDS } from "../courses";
import { backend } from "../backend/api";

interface ProfileModalProps {
  user: PublicUser;
  onClose: () => void;
  onDone: (m: string) => void;
}

export default function ProfileModal({ user, onClose, onDone }: ProfileModalProps) {
  const [city, setCity] = useState(user.city);
  const [board, setBoard] = useState(user.board);
  const [className, setClassName] = useState(user.className);

  const trial = backend.trialInfo(user);
  const plan = backend.planInfo(user);

  const handleSave = () => {
    // Demo mode mein localStorage update (real backend ho to /profile PUT)
    try {
      const key = `edubot_app_user_${user.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const u = JSON.parse(saved);
        u.city = city; u.board = board; u.className = className;
        localStorage.setItem(key, JSON.stringify(u));
        localStorage.setItem("edubot_app_current_user", JSON.stringify(u));
      }
    } catch { /* ignore */ }
    onDone("✅ Profile updated! (Refresh karें changes dekhne ke liye)");
    onClose();
  };

  const stats = [
    { label: "Total XP", value: user.xp, icon: "⭐" },
    { label: "Level", value: user.level, icon: "🏆" },
    { label: "Streak", value: `${user.streak} days`, icon: "🔥" },
    { label: "Plan", value: user.plan, icon: "💎" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold text-[#0b0a2b] shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">{user.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-violet-200">{user.className}</span>
              {trial.active && <span className="rounded-full bg-emerald-400/15 px-3 py-0.5 text-xs font-semibold text-emerald-200">🎁 Trial · {trial.daysLeft}d left</span>}
              {plan.active && <span className="rounded-full bg-amber-400/15 px-3 py-0.5 text-xs font-semibold text-amber-200">⭐ {user.plan} · {plan.daysLeft}d</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-1 font-display text-xl font-bold capitalize text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-violet-200/60">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Editable settings */}
        <div className="mt-6 space-y-4">
          <h4 className="font-display text-lg font-bold text-white">⚙️ Settings</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">City (Prayer Times)</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                {CITIES.map((c) => <option key={c.name} value={c.name} className="bg-[#120f3a]">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Board</label>
              <select value={board} onChange={(e) => setBoard(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                {BOARDS.map((b) => <option key={b.id} value={b.id} className="bg-[#120f3a]">{b.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Grade / Class</label>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#120f3a] px-4 py-3 text-white focus:border-amber-300 focus:outline-none">
                <option value="9th Class" className="bg-[#120f3a]">9th Class</option>
                <option value="10th Class" className="bg-[#120f3a]">10th Class</option>
                <option value="11th Class (FSc/ICS)" className="bg-[#120f3a]">11th Class (FSc/ICS)</option>
                <option value="12th Class (FSc/ICS)" className="bg-[#120f3a]">12th Class (FSc/ICS)</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
