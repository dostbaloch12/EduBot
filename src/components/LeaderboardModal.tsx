import type { PublicUser } from "../backend/types";

interface LeaderboardModalProps {
  user: PublicUser;
  onClose: () => void;
}

// Demo leaderboard (real backend mein /leaderboard se aayega)
const TOP_STUDENTS = [
  { name: "Hassan Raza", city: "Lahore", xp: 4850, streak: 42 },
  { name: "Fatima Noor", city: "Karachi", xp: 4620, streak: 38 },
  { name: "Ahmed Khan", city: "Islamabad", xp: 4310, streak: 35 },
  { name: "Ayesha Malik", city: "Quetta", xp: 3990, streak: 29 },
  { name: "Bilal Ahmed", city: "Peshawar", xp: 3720, streak: 27 },
  { name: "Zainab Ali", city: "Multan", xp: 3450, streak: 24 },
  { name: "Usman Tariq", city: "Faisalabad", xp: 3180, streak: 21 },
  { name: "Maryam Shah", city: "Hyderabad", xp: 2940, streak: 19 },
];

export default function LeaderboardModal({ user, onClose }: LeaderboardModalProps) {
  // User ko list mein daalें aur XP ke hisaab se sort karें
  const all = [...TOP_STUDENTS, { name: user.name + " (You)", city: user.city, xp: user.xp, streak: user.streak, isMe: true }]
    .sort((a, b) => b.xp - a.xp);

  const medal = (rank: number) => (rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">← Back</button>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>
        </div>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-3xl">🏆</span>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Leaderboard</h3>
            <p className="text-sm text-violet-200/70">Top students across Pakistan</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {all.slice(0, 10).map((s: any, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                s.isMe
                  ? "border-amber-300/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10 ring-1 ring-amber-300/30"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${i < 3 ? "" : "bg-white/10 text-white"}`}>
                {medal(i)}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${s.isMe ? "text-amber-200" : "text-white"}`}>{s.name}</div>
                <div className="text-xs text-violet-200/60">📍 {s.city}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-300">{s.xp.toLocaleString()} XP</div>
                <div className="text-xs text-violet-200/60">🔥 {s.streak}d</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4 text-center text-sm text-violet-200">
          💪 Zyada quiz aur assignments complete karke apni rank barhायें!
        </div>
      </div>
    </div>
  );
}
