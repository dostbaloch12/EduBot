import { useState, useRef, useEffect } from "react";

interface Notif {
  id: string;
  icon: string;
  title: string;
  time: string;
  unread: boolean;
}

const DEFAULT_NOTIFS: Notif[] = [
  { id: "n1", icon: "🎁", title: "Aap ka free trial active hai — 35 questions istemal karें!", time: "Abhi", unread: true },
  { id: "n2", icon: "📝", title: "Naya assignment: Physics — Newton's Laws (kal due)", time: "1 ghanta", unread: true },
  { id: "n3", icon: "🔥", title: "Mubarak! Aap ne streak 7 din complete kiya 🎉", time: "Aaj", unread: true },
  { id: "n4", icon: "🏆", title: "Aap ne Mathematics quiz mein 100% score kiya!", time: "Kal", unread: false },
  { id: "n5", icon: "🕌", title: "Maghrib ki azaan ka waqt qareeb hai", time: "Kal", unread: false },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(DEFAULT_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-lg transition hover:bg-white/[0.08]"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-scale-in absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-[#120f3a]/95 shadow-2xl shadow-violet-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-display font-bold text-white">🔔 Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-amber-300 hover:text-amber-200">
                Sab read karें
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 ${n.unread ? "bg-violet-500/5" : ""}`}
              >
                <span className="text-xl">{n.icon}</span>
                <div className="flex-1">
                  <p className="text-sm leading-snug text-white">{n.title}</p>
                  <span className="text-xs text-violet-200/50">{n.time}</span>
                </div>
                {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
