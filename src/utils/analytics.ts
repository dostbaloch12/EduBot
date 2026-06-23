// ============================================
// ANALYTICS — User events + page tracking
// Google Analytics (gtag) ready. Agar GA na ho to
// console + localStorage mein track karta hai (dev).
// ============================================

const GA_ID = import.meta.env.VITE_GA_ID; // .env mein VITE_GA_ID daalें

// Google Analytics script load karें (sirf agar ID ho aur cookie consent ho)
export function initAnalytics() {
  if (!GA_ID) return;
  if (localStorage.getItem("edubot_cookie_consent") !== "accepted") return;
  if (document.getElementById("ga-script")) return;

  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

// Kisi event ko track karें (jaise quiz_completed, login, upgrade)
export function trackEvent(name: string, params: Record<string, any> = {}) {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag("event", name, params);
  }
  // Dev: console + localStorage (taake test kar sakें)
  if (import.meta.env.DEV) {
    console.log("📊 [Analytics]", name, params);
  }
  try {
    const log = JSON.parse(localStorage.getItem("edubot_events") || "[]");
    log.push({ name, params, at: new Date().toISOString() });
    localStorage.setItem("edubot_events", JSON.stringify(log.slice(-100)));
  } catch { /* ignore */ }
}

// Page view track karें
export function trackPage(page: string) {
  const gtag = (window as any).gtag;
  if (gtag && GA_ID) {
    gtag("event", "page_view", { page_title: page, page_path: "/" + page });
  }
  trackEvent("page_view", { page });
}
