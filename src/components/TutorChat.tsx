import { useState, useRef, useEffect } from "react";
import { backend } from "../backend/api";
import { useI18n } from "../i18n";
import { voice, voiceInput } from "../utils/voice";

interface TutorChatProps {
  userId: string;
  onQuotaChange: () => Promise<void>;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  audioUrl?: string;
  timestamp: string;
}

const SMART_RESPONSES: Record<string, string> = {
  newton: "Newton's Second Law states that F = ma. In the Pakistan board exams, always define it first, give the mathematical formula, write the SI unit (Newton), and provide a real-life example like accelerating a car to secure 100% marks.",
  css: "For a high-scoring CSS Essay: 1) Construct a clear thesis statement in the first paragraph. 2) Build an extensive outline with major headings. 3) Back your arguments with global reports (UN, World Bank) and clear topic sentences.",
  mitosis: "Mitosis produces two identical diploid daughter cells (somatic growth), while Meiosis produces four genetically diverse haploid cells (gametes). Draw the labeled diagram of Prophase and Metaphase to get top marks in BISE exams.",
  ghalib: "Mirza Ghalib's poetic genius lies in his profound philosophical inquiry, elegant Persianized vocabulary, and exploration of human existential longing. When explaining his Ashaar, break down the literal meaning (Lughwi Maani) first, then the deeper metaphorical context (Istelahi Mafhoom)."
};

export default function TutorChat({ userId, onQuotaChange }: TutorChatProps) {
  const { t, lang } = useI18n();
  void userId; // quota ab backend par handle hota hai
  const [listening, setListening] = useState(false);
  const voiceLang = lang === "en" ? "en" : "ur"; // Urdu group ke liye ur
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_init",
      sender: "ai",
      text: "Salaam! I am your AI EduBot Tutor. Ask me any conceptual question from Physics, Chemistry, Math, or CSS/MDCAT past papers. I will provide high-yield explanations and exam tips!",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Component band hone par voice rok dें
  useEffect(() => {
    return () => voice.stop();
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `m_u_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    // Real backend AI tutor call (quota check backend par hota hai)
    const res = await backend.chat.ask(textToSend);
    await onQuotaChange();

    if (!res.ok) {
      const err = (res.error || "").toLowerCase();
      let msg: string;
      if (err.includes("authoriz") || err.includes("token") || err.includes("not found")) {
        // Token galat/purana → dobara login ka mashwara
        msg = "⚠️ Aap ka session expire ho gaya. Baraye meharbani LOGOUT karke dobara LOGIN/SIGN UP karें — phir AI Tutor kaam karega!";
      } else if (err.includes("limit") || err.includes("quota") || err.includes("upgrade")) {
        msg = `⚠️ ${res.error} Upgrade to Basic ya Premium for unlimited AI answers!`;
      } else {
        msg = `⚠️ ${res.error || "Kuch masla aaya."} Dobara koshish karें.`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `m_ai_${Date.now()}`,
          sender: "ai",
          text: msg,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setLoading(false);
      return;
    }

    const aiMsg: Message = {
      id: `m_ai_${Date.now()}`,
      sender: "ai",
      text: res.reply || SMART_RESPONSES.newton,
      audioUrl: `simulated_audio_${Date.now()}`, // simulated voice note
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const toggleAudio = (id: string, text: string) => {
    if (playingAudio === id) {
      // abhi yahi bol raha hai → rok dें
      voice.stop();
      setPlayingAudio(null);
    } else {
      // Urdu text hai to ur, warna en (simple detect: Arabic/Urdu script range)
      const isUrdu = /[\u0600-\u06FF]/.test(text);
      voice.speak(text, isUrdu ? "ur" : "en", () => setPlayingAudio(null));
      setPlayingAudio(id);
    }
  };

  // 🎤 Microphone se bol kar sawal likhें (voice input)
  const toggleMic = () => {
    if (listening) {
      voiceInput.stop();
      setListening(false);
      return;
    }
    if (!voiceInput.isSupported()) {
      alert("Voice input ke liye Chrome browser use karें");
      return;
    }
    setListening(true);
    voiceInput.start(
      voiceLang,
      (text) => setInput((prev) => (prev ? prev + " " + text : text)), // bola hua input mein daalो
      () => setListening(false),
      () => setListening(false)
    );
  };

  return (
    <div className="glass-strong border-gradient flex flex-col justify-between rounded-3xl p-6 lg:col-span-2 shadow-2xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-2xl shadow-lg shadow-violet-900/40">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-white">{t("aiTutor")}</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </div>
              <div className="text-xs text-violet-200/70">{t("personalMentor")} · Trained on BISE & CSS syllabi</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-violet-200">
            <span>⚡ Urdu & English AI Support</span>
          </div>
        </div>

        {/* Suggestion pills */}
        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2">
          {[
            "Newton's Second Law 🍎",
            "High-Scoring CSS Essay 📝",
            "Mitosis vs Meiosis 🧬",
            "Mirza Ghalib Poetry Style 📜"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion.replace(/ [^\w\s]+$/, ""))}
              disabled={loading}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-white/10 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Messages view */}
        <div className="scrollbar-hide mt-4 flex max-h-96 min-h-[16rem] flex-col gap-4 overflow-y-auto pr-2">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <div key={m.id} className={`flex gap-3 ${isAI ? "items-start" : "items-end justify-end"}`}>
                {isAI && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm shadow">
                    🤖
                  </div>
                )}
                <div className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${isAI ? "border border-white/10 bg-white/5 text-white" : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"}`}>
                  <p>{m.text}</p>
                  {isAI && m.audioUrl && (
                    <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-xs text-violet-200">
                      <button
                        onClick={() => toggleAudio(m.id, m.text)}
                        className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 font-bold text-amber-300 transition hover:bg-amber-400/30"
                      >
                        <span>{playingAudio === m.id ? "⏸️ Stop Voice" : "🔊 Listen (Voice)"}</span>
                      </button>
                      {playingAudio === m.id && (
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-1 animate-ping bg-amber-300" />
                          <span className="h-3 w-1 animate-ping bg-amber-300" style={{ animationDelay: "100ms" }} />
                          <span className="h-4 w-1 animate-ping bg-amber-300" style={{ animationDelay: "200ms" }} />
                          <span className="h-2 w-1 animate-ping bg-amber-300" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  )}
                  <span className="mt-1 block text-[10px] opacity-60 text-right">{m.timestamp}</span>
                </div>
                {!isAI && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-[#0b0a2b] shadow">
                    U
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm shadow">
                🤖
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-violet-200/70">
                <span>EduBot is thinking</span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-300" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
        {/* 🎤 Mic button — bol kar sawal likhें */}
        <button
          type="button"
          onClick={toggleMic}
          title="Bol kar sawal poochें"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
            listening
              ? "border-rose-400 bg-rose-500/20 text-rose-200 animate-pulse"
              : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
          }`}
        >
          {listening ? "🔴" : "🎤"}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "🎤 Sun raha hun... boliye" : "Ask any question or 🎤 bol kar poochें..."}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
