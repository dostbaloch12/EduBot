import { useState, useEffect } from "react";
import type { TestPrep } from "../courses";
import { useI18n } from "../i18n";
import { voice } from "../utils/voice";

interface TestPrepModalProps {
  prep: TestPrep;
  onClose: () => void;
  onDone: (m: string) => void;
}

export default function TestPrepModal({ prep, onClose, onDone }: TestPrepModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"overview" | "pastpapers" | "practice">("overview");
  const [selectedOpt, setSelectedOpt] = useState<Record<number, number>>({});
  const [showExp, setShowExp] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  // Modal band hone par voice rok dें
  useEffect(() => {
    return () => voice.stop();
  }, []);

  // Kisi explanation ko awaz mein parhें
  const speakExplanation = (idx: number, text: string) => {
    if (speakingIdx === idx) {
      voice.stop();
      setSpeakingIdx(null);
    } else {
      const isUrdu = /[\u0600-\u06FF]/.test(text);
      voice.speak(text, isUrdu ? "ur" : "en", () => setSpeakingIdx(null));
      setSpeakingIdx(idx);
    }
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showExp[qIdx]) return;
    setSelectedOpt((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExp((prev) => ({ ...prev, [qIdx]: true }));
    if (optIdx === prep.sampleQuestions[qIdx].answer) {
      setScore((s) => s + 5);
    }
  };

  const handleClaim = () => {
    onDone(`🏆 Practiced ${prep.name}! Earned +${score || 10} XP`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-6">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${prep.color} text-4xl shadow-xl`}>
            {prep.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-white sm:text-3xl">{prep.name}</span>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-amber-300">{prep.category}</span>
            </div>
            <div className="mt-1 text-sm text-violet-200/80">{prep.fullName}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: "overview" as const, label: "📘 Syllabus & Overview" },
            { id: "pastpapers" as const, label: `📄 Past Papers (${prep.pastPapers.length})` },
            { id: "practice" as const, label: `🎯 Interactive Mock Practice` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                    : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6 min-h-[22rem]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-display text-lg font-bold text-white">Course Description & Goals</h4>
                <p className="mt-2 text-sm leading-relaxed text-violet-100/90">{prep.desc}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl">📚</div>
                  <div className="mt-2 text-2xl font-bold text-white">{prep.totalMcqs.toLocaleString()}+</div>
                  <div className="mt-1 text-xs text-violet-200/70">{t("mcqsAvailable")}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl">👥</div>
                  <div className="mt-2 text-2xl font-bold text-white">{prep.enrolled}</div>
                  <div className="mt-1 text-xs text-violet-200/70">{t("enrolled")}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl">⭐</div>
                  <div className="mt-2 text-2xl font-bold text-amber-300">98.4%</div>
                  <div className="mt-1 text-xs text-violet-200/70">Passing Rate with EduBot</div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-5">
                <div className="flex items-center gap-2 text-amber-200 font-bold">
                  <span>🚀</span> <span>Guaranteed Merit List Prep</span>
                </div>
                <p className="mt-1 text-xs text-violet-200/80">
                  Includes AI deep-dive breakdowns, high-frequency past vocabulary, and customized mock test generators.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("practice")}
                  className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600"
                >
                  Start Interactive Practice →
                </button>
              </div>
            </div>
          )}

          {activeTab === "pastpapers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-lg font-bold text-white">Downloadable Past Papers & Solutions</h4>
                <span className="text-xs text-amber-300 font-semibold">🔒 Unlocked with EduBot Premium</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prep.pastPapers.map((paper) => (
                  <div key={paper} className="glass-card flex items-center justify-between rounded-2xl p-5 transition hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 font-bold text-lg border border-rose-300/30">
                        PDF
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{paper}</div>
                        <div className="text-xs text-violet-200/70">Complete solved key & AI hints</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDone(`📥 Downloaded ${paper}`)}
                      className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "practice" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-display text-lg font-bold text-white">Sample Mock Examination</h4>
                  <p className="text-xs text-violet-200/70">Select an option to instantly view AI grading & detailed conceptual explanations.</p>
                </div>
                <div className="rounded-full bg-amber-400/10 border border-amber-300/30 px-4 py-2 text-sm font-bold text-amber-200">
                  Score: {score} XP
                </div>
              </div>

              {prep.sampleQuestions.map((sq, qIdx) => (
                <div key={sq.q} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-display text-lg font-bold text-white">{sq.q}</h5>

                      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {sq.options.map((opt, oIdx) => {
                          const isAnswered = showExp[qIdx];
                          const isCorrect = oIdx === sq.answer;
                          const isSelected = selectedOpt[qIdx] === oIdx;

                          let btnClass = "border-white/10 bg-white/5 text-violet-100 hover:bg-white/10";
                          if (isAnswered) {
                            if (isCorrect) {
                              btnClass = "border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold";
                            } else if (isSelected) {
                              btnClass = "border-rose-400 bg-rose-500/20 text-rose-200 line-through";
                            } else {
                              btnClass = "border-white/5 bg-white/5 opacity-40 text-white";
                            }
                          } else if (isSelected) {
                            btnClass = "border-amber-300 bg-amber-400/20 text-white font-bold";
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(qIdx, oIdx)}
                              disabled={isAnswered}
                              className={`rounded-2xl border p-3.5 text-left text-sm transition-all ${btnClass}`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {isAnswered && isCorrect && <span className="text-emerald-400 font-bold">✓ Correct</span>}
                                {isAnswered && isSelected && !isCorrect && <span className="text-rose-400 font-bold">✕ Incorrect</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {showExp[qIdx] && (
                        <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-500/10 p-4 animate-scale-in">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                              <span>💡</span> <span>AI Solution Breakdown</span>
                            </div>
                            <button
                              onClick={() => speakExplanation(qIdx, sq.explanation)}
                              className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/30"
                            >
                              {speakingIdx === qIdx ? "⏸️ Stop" : "🔊 AI Tutor Voice"}
                              {speakingIdx === qIdx && (
                                <span className="flex items-center gap-0.5">
                                  <span className="h-2 w-0.5 animate-ping bg-amber-300" />
                                  <span className="h-3 w-0.5 animate-ping bg-amber-300" style={{ animationDelay: "120ms" }} />
                                  <span className="h-2 w-0.5 animate-ping bg-amber-300" style={{ animationDelay: "240ms" }} />
                                </span>
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-violet-200/90">{sq.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleClaim}
                  className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600"
                >
                  Claim Practice Rewards & Finish →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
