import { useState, useEffect } from "react";
import { initAnalytics } from "../utils/analytics";

interface CookieConsentProps {
  onPrivacy: () => void;
}

export default function CookieConsent({ onPrivacy }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sirf tab dikhायें jab pehle se decision na liya ho
    const consent = localStorage.getItem("edubot_cookie_consent");
    if (!consent) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    } else if (consent === "accepted") {
      initAnalytics(); // pehle accept kiya tha → analytics on
    }
  }, []);

  const accept = () => {
    localStorage.setItem("edubot_cookie_consent", "accepted");
    initAnalytics();
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("edubot_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-2xl animate-scale-in">
      <div className="glass-strong border-gradient rounded-3xl p-5 shadow-2xl shadow-violet-900/50">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="text-3xl">🍪</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Hum cookies use karte hain</p>
            <p className="mt-1 text-xs text-violet-200/80">
              Behtar tajurbe aur analytics ke liye. Aap{" "}
              <button onClick={onPrivacy} className="font-bold text-amber-300 underline">
                Privacy Policy
              </button>{" "}
              parh sakte hain.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={decline}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-violet-200 transition hover:bg-white/10"
            >
              Sirf zaroori
            </button>
            <button
              onClick={accept}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600"
            >
              Sab accept karें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
