// ============================================
// LIVE PRAYER TIMES — Aladhan API (free, no key)
// City ke hisaab se asli namaz ke auqaat
// ============================================

export interface PrayerTimings {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

// 12-hour API time ("05:19 (PKT)") ko 24-hour "05:19" mein convert
const clean = (t: string) => (t || "").split(" ")[0].trim();

// localStorage cache key (har shehr + tareekh ka alag)
const cacheKey = (city: string) =>
  `edubot_prayer_${city}_${new Date().toISOString().split("T")[0]}`;

export async function fetchPrayerTimes(city: string): Promise<PrayerTimings | null> {
  // 1. Aaj ke din ki cache check (API baar baar na call ho)
  const key = cacheKey(city);
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* ignore */
    }
  }

  // 2. Aladhan API call (Karachi calculation method = 1, Pakistan ke liye sahi)
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
      city
    )}&country=Pakistan&method=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t) return null;

    const timings: PrayerTimings = {
      fajr: clean(t.Fajr),
      sunrise: clean(t.Sunrise),
      dhuhr: clean(t.Dhuhr),
      asr: clean(t.Asr),
      maghrib: clean(t.Maghrib),
      isha: clean(t.Isha),
    };

    // 3. Cache save (aaj bhar ke liye)
    localStorage.setItem(key, JSON.stringify(timings));
    return timings;
  } catch {
    return null; // API fail → null (app fallback static times use karega)
  }
}
