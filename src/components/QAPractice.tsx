import { useState, useEffect } from "react";
import { useI18n } from "../i18n";
import { backend } from "../backend/api";
import { voice, voiceInput } from "../utils/voice";
import { QA_BANK, QA_ICONS } from "../qaBank";

interface QAPracticeProps {
  chapterCtx?: { subject: string; chapter: string; classLevel: string } | null;
  onClose: () => void;
  onDone: (m: string) => void;
}

const SUBJECTS = Object.keys(QA_BANK);

export default function QAPractice({ chapterCtx, onClose, onDone }: QAPracticeProps) {
  const { t, lang } = useI18n();
  const [subject, setSubject] = useState(chapterCtx?.subject && QA_BANK[chapterCtx.subject] ? chapterCtx.subject : SUBJECTS[0]);
  const [selectedIdx, setSelectedIdx] = useState(0); // us subject ka konsa sawal
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; strengths: string; improvement: string } | null>(null);
  const [autoVoice, setAutoVoice] = useState(true);
  const [listening, setListening] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<typeof QA_BANK[string] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Chapter ke hisaab se sawal (AI) ya subject ke general (bank)
  const questions = aiQuestions || QA_BANK[subject] || QA_BANK.Physics;
  const current = questions[selectedIdx] || questions[0];

  // Agar chapter aaya hai → AI se us chapter ke descriptive sawal banवाo
  useEffect(() => {
    if (!chapterCtx) return;
    const load = async () => {
      setAiLoading(true);
      const aiQ = await backend.chat.generateQuestions(chapterCtx.subject, chapterCtx.chapter, chapterCtx.classLevel);
      if (aiQ && aiQ.length > 0) setAiQuestions(aiQ);
      setSelectedIdx(0);
      setAiLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Urdu subjects ke liye urdu voice, baqi ke liye english
  const voiceLang = subject === "Urdu" || lang !== "en" ? "ur" : "en";

  // 🎤 Mic se answer bolें
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
      (text) => setAnswer((prev) => (prev ? prev + " " + text : text)), // bola hua answer mein daalो
      () => setListening(false),
      () => setListening(false)
    );
  };

  // Modal band hone par voice rok dें
  useEffect(() => {
    return () => { voice.stop(); voiceInput.stop(); };
  }, []);

  // Jab feedback aaye → ideal answer auto voice se parho
  useEffect(() => {
    if (feedback && autoVoice) {
      const isUrdu = /[\u0600-\u06FF]/.test(current.idealAnswer);
      voice.speak(current.idealAnswer, isUrdu ? "ur" : "en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    setLoading(true);

    // ✅ REAL AI grading (Gemini/OpenAI) — backend se
    const res = await backend.chat.grade(current.q, answer, current.idealAnswer);
    setLoading(false);

    if (res.ok && res.score != null) {
      setFeedback({
        score: res.score,
        strengths: res.strengths || "Acha jawab!",
        improvement: res.improvement || "Aur behtar karें.",
      });
    } else {
      setFeedback({
        score: 5,
        strengths: "Aap ne sawal ko address kiya.",
        improvement: res.error || "AI grading mein masla — dobara koshish karें.",
      });
    }
  };

  const handleClaim = () => {
    const xp = feedback ? Math.round(feedback.score * 10) : 50;
    onDone(`🏆 Q&A Evaluated! Scored ${feedback?.score}/10 · Earned +${xp} XP`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
        {/* ===== Top Bar: Back (left) + Close (right) ===== */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => { voice.stop(); voiceInput.stop(); onClose(); }}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ← Back
          </button>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
          <h3 className="font-display text-2xl font-bold text-white">{t("qaPractice")}</h3>
          {/* Auto voice toggle */}
          <button
            onClick={() => { setAutoVoice((v) => { if (v) voice.stop(); return !v; }); }}
            title="Auto voice on/off"
            className={`ml-auto mr-12 flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              autoVoice ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200" : "border-white/10 bg-white/5 text-violet-200"
            }`}
          >
            {autoVoice ? "🔊 Voice On" : "🔇 Voice Off"}
          </button>
        </div>

        <p className="mt-2 text-sm text-violet-200/70">
          Subject chunें, sawal ka tafseeli jawab likhें, aur AI Evaluator se asli marks payें.
        </p>

        {/* Chapter badge (agar chapter se aaya ho) */}
        {chapterCtx && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold text-amber-200">
            {aiLoading ? "🤖 AI chapter ke sawal bana raha hai..." : `📖 ${chapterCtx.chapter}`}
          </div>
        )}

        {/* Subject Selector */}
        <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-2">
          {SUBJECTS.map((s) => {
            const active = subject === s;
            return (
              <button
                key={s}
                onClick={() => { setSubject(s); setSelectedIdx(0); setAnswer(""); setFeedback(null); voice.stop(); }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
                }`}
              >
                <span>{QA_ICONS[s] || "📘"}</span> {s}
              </button>
            );
          })}
        </div>

        {/* Question Selector (us subject ke sawal) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((_, idx) => {
            const active = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => { setSelectedIdx(idx); setAnswer(""); setFeedback(null); voice.stop(); }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                    : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
                }`}
              >
                Q{idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Prompt */}
        <div className="mt-5 glass-card rounded-2xl p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">{QA_ICONS[subject]} {subject}</span>
          <h4 className="font-display mt-1 text-xl font-bold text-white" dir={/[\u0600-\u06FF]/.test(current.q) ? "rtl" : "ltr"}>{current.q}</h4>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-violet-200">
            <span>💡 <strong>Hint:</strong> {current.hint}</span>
          </div>
        </div>

        {/* Answer Form */}
        {!feedback ? (
          <form onSubmit={handleEvaluate} className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Apna Jawab Likhें ya Bolें</label>
                {/* 🎤 Mic button — bol kar answer dें */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    listening
                      ? "border-rose-400 bg-rose-500/20 text-rose-200 animate-pulse"
                      : "border-amber-300/40 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25"
                  }`}
                >
                  {listening ? "🔴 Sun raha hun..." : "🎤 Bol kar jawab dें"}
                </button>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                required
                placeholder={listening ? "🎤 Boliye... aap ki awaz yahan likhi jayegi" : "Yahan jawab likhें... ya 🎤 button daba kar bolें"}
                dir={/[\u0600-\u06FF]/.test(answer) ? "rtl" : "ltr"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-violet-200/50 focus:border-amber-300 focus:bg-white/10 focus:outline-none"
              />
              {listening && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-300">
                  <span className="flex gap-0.5">
                    <span className="h-3 w-0.5 animate-ping bg-amber-300" />
                    <span className="h-4 w-0.5 animate-ping bg-amber-300" style={{ animationDelay: "120ms" }} />
                    <span className="h-3 w-0.5 animate-ping bg-amber-300" style={{ animationDelay: "240ms" }} />
                  </span>
                  Awaz sun raha hun — boliye! (band karne ke liye mic dobara dabायें)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 font-bold text-white shadow-xl shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50"
            >
              {loading ? "AI is analyzing board rubrics..." : "Submit for AI Evaluation →"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-6 animate-scale-in">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">AI Evaluator Score</div>
                <div className="mt-1 font-display text-4xl font-extrabold text-emerald-200">{feedback.score} / 10</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
                <div className="text-xs font-bold text-amber-300">⭐ Key Strengths</div>
                <p className="mt-1 text-xs leading-relaxed text-violet-100">{feedback.strengths}</p>
                <div className="mt-3 text-xs font-bold text-sky-300">📈 Areas for Improvement</div>
                <p className="mt-1 text-xs leading-relaxed text-violet-100">{feedback.improvement}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                  <span>📘</span> <span>Master Topper Ideal Answer</span>
                </div>
                <button
                  onClick={() => {
                    const isUrdu = /[\u0600-\u06FF]/.test(current.idealAnswer);
                    voice.speak(current.idealAnswer, isUrdu ? "ur" : "en");
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/30"
                >
                  🔊 Suno
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-violet-200/90">{current.idealAnswer}</p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setFeedback(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => { voice.stop(); setFeedback(null); setAnswer(""); }}
                className="rounded-2xl border border-amber-300/40 bg-amber-400/15 px-6 py-3.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/25"
              >
                ← Aur Sawal Karें
              </button>
              <button
                onClick={handleClaim}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600"
              >
                Claim +{Math.round(feedback.score * 10)} XP & Exit →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
