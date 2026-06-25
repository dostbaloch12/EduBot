import { useState, useEffect } from "react";
import { backend } from "../backend/api";
import { QUIZ_BANK, SUBJECT_ICONS, shuffle, type MCQ } from "../quizBank";
import { voice } from "../utils/voice";

interface QuizModalProps {
  userId: string;
  chapterCtx?: { subject: string; chapter: string; classLevel: string } | null;
  onClose: () => void;
  onDone: (m: string) => void;
}

export default function QuizModal({ userId, chapterCtx, onClose, onDone }: QuizModalProps) {
  const [subject, setSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timer, setTimer] = useState(25);
  const [autoVoice, setAutoVoice] = useState(true); // auto voice on/off
  const [aiLoading, setAiLoading] = useState(false);
  const [chapterName, setChapterName] = useState<string | null>(null);

  // Modal band hone par voice rok dें
  useEffect(() => {
    return () => voice.stop();
  }, []);

  // Agar chapter context aaya hai → AI se us chapter ka quiz banवाo
  useEffect(() => {
    if (!chapterCtx) return;
    const loadChapterQuiz = async () => {
      setAiLoading(true);
      setChapterName(chapterCtx.chapter);
      const aiQuiz = await backend.chat.generateQuiz(chapterCtx.subject, chapterCtx.chapter, chapterCtx.classLevel);
      if (aiQuiz && aiQuiz.length > 0) {
        // AI ne chapter ka quiz banaya
        setQuestions(aiQuiz);
        setSubject(chapterCtx.subject);
      } else {
        // AI na chala → subject ka general quiz (fallback)
        const bank = QUIZ_BANK[chapterCtx.subject] || QUIZ_BANK.Physics;
        setQuestions(shuffle(bank).slice(0, 8));
        setSubject(chapterCtx.subject);
      }
      setCurrentIdx(0); setScore(0); setSelectedOpt(null);
      setShowExplanation(false); setFinished(false); setTimer(25);
      setAiLoading(false);
    };
    loadChapterQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!subject || finished || showExplanation) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // auto timeout
          setSelectedOpt(-1);
          setShowExplanation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subject, finished, showExplanation]);

  const currentQ = questions[currentIdx];

  // Jab explanation dikhe → auto voice se parho
  useEffect(() => {
    if (showExplanation && autoVoice && currentQ) {
      const isUrdu = /[\u0600-\u06FF]/.test(currentQ.explanation);
      voice.speak(currentQ.explanation, isUrdu ? "ur" : "en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExplanation, currentIdx]);

  const handleSelectSubject = (sub: string) => {
    // Bank se random 8 questions chunें (har baar naya quiz)
    const bank = QUIZ_BANK[sub] || QUIZ_BANK.Physics;
    setQuestions(shuffle(bank).slice(0, Math.min(8, bank.length)));
    setSubject(sub);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setShowExplanation(false);
    setFinished(false);
    setTimer(25);
  };

  const handleConfirmAnswer = (optIdx: number) => {
    if (showExplanation) return;
    setSelectedOpt(optIdx);
    setShowExplanation(true);
    if (optIdx === currentQ.answer) {
      setScore((s) => s + 2); // 2 points per correct question
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setShowExplanation(false);
      setTimer(25);
    } else {
      setFinished(true);
    }
  };

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    const totalXP = score * 10;
    await backend.quizzes.saveResult(userId, {
      subject: subject || "General",
      score,
      total: questions.length * 2,
      xpEarned: totalXP
    });
    setSaving(false);
    onDone(`🏆 Quiz Completed! Scored ${score}/${questions.length * 2} · Earned +${totalXP} XP`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          ← Back
        </button>
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        <div className="mt-12">
        {aiLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="animate-float text-5xl">🤖</div>
            <h3 className="font-display mt-4 text-xl font-bold text-white">AI quiz bana raha hai...</h3>
            {chapterName && <p className="mt-2 text-sm text-amber-300">📖 Chapter: {chapterName}</p>}
            <div className="mt-4 flex gap-1.5">
              <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : !subject ? (
          <div>
            <div className="flex items-center gap-3">
              <span className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500" />
              <h3 className="font-display text-2xl font-bold text-white">Select Quiz Subject</h3>
            </div>
            <p className="mt-2 text-sm text-violet-200/70">
              Test your knowledge instantly with board-aligned MCQs. Each correct answer earns XP!
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.keys(QUIZ_BANK).map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSelectSubject(sub)}
                  className="glass-card group relative flex flex-col items-center justify-center rounded-2xl p-6 text-center transition hover:-translate-y-1"
                >
                  <span className="text-4xl transition-transform group-hover:scale-110">
                    {SUBJECT_ICONS[sub] || "📚"}
                  </span>
                  <span className="mt-3 font-display text-lg font-bold text-white">{sub}</span>
                  <span className="mt-1 text-xs text-violet-200/60">{QUIZ_BANK[sub].length} MCQs · 8 random</span>
                </button>
              ))}
            </div>
          </div>
        ) : !finished ? (
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-300">{subject} Quiz</span>
                <div className="text-sm font-semibold text-white">Question {currentIdx + 1} of {questions.length}</div>
              </div>
              <div className="flex items-center gap-2">
                {/* Auto-voice toggle */}
                <button
                  onClick={() => { setAutoVoice((v) => { if (v) voice.stop(); return !v; }); }}
                  title="Auto voice on/off"
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    autoVoice ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200" : "border-white/10 bg-white/5 text-violet-200"
                  }`}
                >
                  {autoVoice ? "🔊 Voice On" : "🔇 Voice Off"}
                </button>
                <div className="flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-300/30 px-4 py-1.5 text-sm font-bold text-amber-200">
                  <span>⏱️</span> <span>{timer}s</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-display text-xl font-bold text-white sm:text-2xl">{currentQ.q}</h4>

              <div className="mt-6 space-y-3">
                {currentQ.options.map((opt, idx) => {
                  let btnClass = "border-white/10 bg-white/5 text-violet-100 hover:bg-white/10";
                  if (showExplanation) {
                    if (idx === currentQ.answer) {
                      btnClass = "border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold";
                    } else if (idx === selectedOpt) {
                      btnClass = "border-rose-400 bg-rose-500/20 text-rose-200 line-through";
                    } else {
                      btnClass = "border-white/5 bg-white/5 opacity-40 text-white";
                    }
                  } else if (selectedOpt === idx) {
                    btnClass = "border-amber-300 bg-amber-400/20 text-white font-bold";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleConfirmAnswer(idx)}
                      disabled={showExplanation}
                      className={`w-full rounded-2xl border p-4 text-left text-sm transition-all ${btnClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {showExplanation && idx === currentQ.answer && <span className="text-emerald-400">✓ Correct</span>}
                        {showExplanation && idx === selectedOpt && idx !== currentQ.answer && <span className="text-rose-400">✕ Incorrect</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-500/10 p-4 animate-scale-in">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                    <span>💡</span> <span>AI Solution Explanation</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-violet-200/90">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {showExplanation && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600"
                  >
                    {currentIdx + 1 < questions.length ? "Next Question →" : "See Results 🏆"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl animate-bounce">🎉</div>
            <h3 className="font-display mt-4 text-3xl font-bold text-white">Quiz Complete!</h3>
            <p className="mt-2 text-sm text-violet-200/70">
              Amazing effort! Here is your official performance summary.
            </p>

            <div className="mt-6 mx-auto grid max-w-sm grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-200/70">Score</div>
                <div className="text-2xl font-bold text-white">{score} / {questions.length * 2}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-200/70">XP Earned</div>
                <div className="text-2xl font-bold text-amber-300">+{score * 10} XP</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setSubject(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Try Another Subject
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Claim Rewards & Exit →"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
