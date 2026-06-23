// ============================================
// VOICE UTILITY — Browser Text-to-Speech (real voice)
// AI Tutor ke jawab ko awaz mein parhta hai (English + Urdu)
// ============================================

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const voice = {
  // Check karein ke browser voice support karta hai
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  },

  // Text ko awaz mein parhें
  speak(text: string, lang: "en" | "ur" = "en", onEnd?: () => void) {
    if (!this.isSupported()) return;

    // Pehle se koi bol raha ho to rok dें
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.95; // thoda dheema, samajhne mein asaan
    utterance.pitch = 1;
    utterance.volume = 1;

    // Behtar voice dhoondें (agar available ho)
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      lang === "ur"
        ? v.lang.startsWith("ur") || v.lang.startsWith("hi")
        : v.lang.startsWith("en")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      onEnd?.();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  // Bolna rok dें
  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
  },

  // Abhi bol raha hai?
  isSpeaking(): boolean {
    return (this.isSupported() && window.speechSynthesis.speaking) || currentUtterance !== null;
  },
};

// Voices async load hoti hain — pre-load karें
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ============================================
// VOICE INPUT — Microphone se bol kar likhना (Speech-to-Text)
// ============================================

// Browser ka SpeechRecognition (Chrome/Edge/Safari)
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

let recognition: any = null;

export const voiceInput = {
  // Kya browser microphone support karta hai?
  isSupported(): boolean {
    return SpeechRecognition !== null;
  },

  // Sunna shuru karें — jo bola jaye woh onResult mein wapas aata hai
  start(
    lang: "en" | "ur",
    onResult: (text: string) => void,
    onEnd?: () => void,
    onError?: (msg: string) => void
  ) {
    if (!this.isSupported()) {
      onError?.("Aap ka browser voice input support nahi karta (Chrome use karें)");
      return;
    }

    // Pehle se koi chal raha ho to band karें
    this.stop();

    recognition = new SpeechRecognition();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    recognition.onerror = (event: any) => {
      onError?.(event.error === "not-allowed" ? "Microphone ki ijazat dें" : "Voice input mein masla");
    };
    recognition.onend = () => {
      onEnd?.();
      recognition = null;
    };

    recognition.start();
  },

  // Sunna band karें
  stop() {
    if (recognition) {
      try { recognition.stop(); } catch { /* ignore */ }
      recognition = null;
    }
  },
};
