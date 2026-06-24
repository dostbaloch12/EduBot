import { useState, useEffect } from "react";

// Neeche scroll karne par "Top par jao" button dikhता hai
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Upar jao (Dashboard)"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-violet-900/40 backdrop-blur-md transition hover:scale-105"
    >
      ↑ Upar jao
    </button>
  );
}
