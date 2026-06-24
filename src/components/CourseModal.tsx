import { useState } from "react";
import type { Course } from "../courses";

interface CourseModalProps {
  course: Course;
  board?: string;
  onClose: () => void;
  onStartQuiz: (ctx?: { subject: string; chapter: string; classLevel: string }) => void;
  onAskTutor: () => void;
  onQAPractice: (ctx?: { subject: string; chapter: string; classLevel: string }) => void;
}

// Board ke naam (display ke liye)
const BOARD_NAMES: Record<string, string> = {
  fbise: "Federal Board (FBISE)",
  lahore: "BISE Lahore (Punjab)",
  karachi: "BSEK Karachi (Sindh)",
  peshawar: "BISE Peshawar (KPK)",
  quetta: "BISE Quetta (Balochistan)",
};

// ============================================
// ASLI Chapters — Class-wise (Punjab/Federal Board syllabus)
// Key format: "ClassNumber|Subject"  (jaise "9|Physics")
// ============================================
const CHAPTERS_BY_CLASS: Record<string, Record<string, string[]>> = {
  // ===== 9th Class (Matric Part-I) =====
  "9": {
    Physics: ["Ch 1: Physical Quantities & Measurement", "Ch 2: Kinematics", "Ch 3: Dynamics", "Ch 4: Turning Effect of Forces", "Ch 5: Gravitation", "Ch 6: Work & Energy", "Ch 7: Properties of Matter", "Ch 8: Thermal Properties of Matter", "Ch 9: Transfer of Heat"],
    Chemistry: ["Ch 1: Fundamentals of Chemistry", "Ch 2: Structure of Atoms", "Ch 3: Periodic Table & Periodicity", "Ch 4: Structure of Molecules", "Ch 5: Physical States of Matter", "Ch 6: Solutions", "Ch 7: Electrochemistry", "Ch 8: Chemical Reactivity"],
    Mathematics: ["Ch 1: Matrices & Determinants", "Ch 2: Real & Complex Numbers", "Ch 3: Logarithms", "Ch 4: Algebraic Expressions & Formulas", "Ch 5: Factorization", "Ch 6: Algebraic Manipulation", "Ch 7: Linear Equations & Inequalities", "Ch 8: Linear Graphs", "Ch 9: Trigonometry", "Ch 10-17: Geometry"],
    Biology: ["Ch 1: Introduction to Biology", "Ch 2: Solving a Biological Problem", "Ch 3: Biodiversity", "Ch 4: Cells & Tissues", "Ch 5: Cell Cycle", "Ch 6: Enzymes", "Ch 7: Bioenergetics", "Ch 8: Nutrition", "Ch 9: Transport"],
    English: ["Unit 1: The Saviour of Mankind", "Unit 2: Patriotism", "Unit 3: Media & Its Impact", "Grammar: Tenses", "Grammar: Active/Passive Voice", "Grammar: Direct/Indirect", "Essay Writing", "Letter & Application", "Comprehension"],
    Urdu: ["نثر: حمد و نعت", "نثر: اسباق", "نظم کی تشریح", "غزل", "قواعد", "محاورے و ضرب الامثال", "خط نویسی", "مضمون نویسی"],
    "Pak Studies": ["Ch 1: Ideological Basis of Pakistan", "Ch 2: Making of Pakistan", "Ch 3: Land & Climate", "Ch 4: History of Pakistan", "Ch 5: Pakistan: A Welfare State"],
    "Computer Science": ["Ch 1: Problem Solving", "Ch 2: Binary System", "Ch 3: Networks", "Ch 4: Data & Privacy", "Ch 5: Designing Websites (HTML)"],
    Islamiat: ["ایمانیات", "عبادات", "سیرتِ نبوی ﷺ", "قرآنی سورتیں", "احادیث"],
  },
  // ===== 10th Class (Matric Part-II) =====
  "10": {
    Physics: ["Ch 10: Simple Harmonic Motion & Waves", "Ch 11: Sound", "Ch 12: Geometrical Optics", "Ch 13: Electrostatics", "Ch 14: Current Electricity", "Ch 15: Electromagnetism", "Ch 16: Basic Electronics", "Ch 17: Information & Communication Technology", "Ch 18: Atomic & Nuclear Physics"],
    Chemistry: ["Ch 9: Chemical Equilibrium", "Ch 10: Acids, Bases & Salts", "Ch 11: Organic Chemistry", "Ch 12: Hydrocarbons", "Ch 13: Biochemistry", "Ch 14: The Atmosphere", "Ch 15: Water", "Ch 16: Chemical Industries"],
    Mathematics: ["Ch 1: Quadratic Equations", "Ch 2: Theory of Quadratic Equations", "Ch 3: Variations", "Ch 4: Partial Fractions", "Ch 5: Sets & Functions", "Ch 6: Basic Statistics", "Ch 7: Introduction to Trigonometry", "Ch 8: Projection of a Side", "Ch 9-13: Chords & Circles"],
    Biology: ["Ch 10: Gaseous Exchange", "Ch 11: Homeostasis", "Ch 12: Coordination & Control", "Ch 13: Support & Movement", "Ch 14: Reproduction", "Ch 15: Inheritance (Genetics)", "Ch 16: Man & His Environment", "Ch 17: Biotechnology", "Ch 18: Pharmacology"],
    English: ["Unit 1: Hazrat Asma (R.A)", "Unit 2: Quaid's Vision", "Unit 3: Faithfulness", "Grammar: Tenses Revision", "Grammar: Punctuation", "Translation", "Essay & Story Writing", "Comprehension & Précis"],
    Urdu: ["نثر کے اسباق", "نظمیں", "غزلیات", "قواعد و انشاء", "محاورے", "خط و درخواست", "مضمون نگاری", "خلاصہ نویسی"],
    "Pak Studies": ["Ch 1: Pakistan Movement", "Ch 2: Constitutional Development", "Ch 3: Economy of Pakistan", "Ch 4: Population & Resources", "Ch 5: Pakistan in World Affairs"],
    "Computer Science": ["Ch 1: Introduction to Programming", "Ch 2: User Interaction", "Ch 3: Conditional Logic", "Ch 4: Data & Repetition", "Ch 5: Functions", "Ch 6: HTML & CSS"],
    Islamiat: ["قرآن مجید", "حدیث شریف", "سیرتِ طیبہ", "اسلامی معاشرت", "عبادات"],
  },
  // ===== 11th Class (FSc/ICS Part-I) =====
  "11": {
    Physics: ["Ch 1: Measurements", "Ch 2: Vectors & Equilibrium", "Ch 3: Motion & Force", "Ch 4: Work & Energy", "Ch 5: Circular Motion", "Ch 6: Fluid Dynamics", "Ch 7: Oscillations", "Ch 8: Waves", "Ch 9: Physical Optics", "Ch 10: Optical Instruments", "Ch 11: Heat & Thermodynamics"],
    Chemistry: ["Ch 1: Basic Concepts", "Ch 2: Experimental Techniques", "Ch 3: Gases", "Ch 4: Liquids & Solids", "Ch 5: Atomic Structure", "Ch 6: Chemical Bonding", "Ch 7: Thermochemistry", "Ch 8: Chemical Equilibrium", "Ch 9: Solutions", "Ch 10: Electrochemistry", "Ch 11: Reaction Kinetics"],
    Biology: ["Ch 1: Introduction", "Ch 2: Biological Molecules", "Ch 3: Enzymes", "Ch 4: The Cell", "Ch 5: Variety of Life", "Ch 6: Kingdom Prokaryotae", "Ch 7: Kingdom Protista", "Ch 8: Fungi", "Ch 9: Kingdom Plantae", "Ch 10: Kingdom Animalia", "Ch 11-14: Form & Function"],
    Mathematics: ["Ch 1: Number Systems", "Ch 2: Sets, Functions & Groups", "Ch 3: Matrices & Determinants", "Ch 4: Quadratic Equations", "Ch 5: Partial Fractions", "Ch 6: Sequences & Series", "Ch 7: Permutation & Combination", "Ch 8: Mathematical Induction", "Ch 9-14: Trigonometry"],
    Computer: ["Ch 1: Information Basics", "Ch 2: Information Networks", "Ch 3: Data Communication", "Ch 4: Applications & Use", "Ch 5: Computer Architecture", "Ch 6: Security & Ethics", "Ch 7: Operating Systems", "Ch 8: Word Processing", "Ch 9-11: Databases"],
    English: ["Book III: Short Stories", "Plays", "Poems", "Grammar & Usage", "Essay Writing", "Letter & Story", "Translation", "Précis Writing"],
    Urdu: ["نثر: اسباق", "نظم", "غزل", "قواعد", "تنقید", "مضمون نگاری", "خط نویسی"],
  },
  // ===== 12th Class (FSc/ICS Part-II) =====
  "12": {
    Physics: ["Ch 12: Electrostatics", "Ch 13: Current Electricity", "Ch 14: Electromagnetism", "Ch 15: Electromagnetic Induction", "Ch 16: Alternating Current", "Ch 17: Physics of Solids", "Ch 18: Electronics", "Ch 19: Dawn of Modern Physics", "Ch 20: Atomic Spectra", "Ch 21: Nuclear Physics"],
    Chemistry: ["Ch 1: Periodic Classification", "Ch 2: s-Block Elements", "Ch 3: Group IIIA-VIA", "Ch 4: Group VIIA & VIIIA", "Ch 5: Transition Elements", "Ch 6: Organic Compounds", "Ch 7: Hydrocarbons", "Ch 8: Alkyl Halides", "Ch 9: Alcohols & Phenols", "Ch 10: Aldehydes & Ketones", "Ch 11: Carboxylic Acids", "Ch 12: Macromolecules"],
    Biology: ["Ch 15: Homeostasis", "Ch 16: Support & Movement", "Ch 17: Coordination & Control", "Ch 18: Reproduction", "Ch 19: Growth & Development", "Ch 20: Chromosomes & DNA", "Ch 21: Cell Cycle", "Ch 22: Variation & Genetics", "Ch 23: Biotechnology", "Ch 24: Evolution", "Ch 25: Ecosystem"],
    Mathematics: ["Ch 1: Functions & Limits", "Ch 2: Differentiation", "Ch 3: Integration", "Ch 4: Introduction to Analytic Geometry", "Ch 5: Linear Inequalities", "Ch 6: Conic Sections", "Ch 7: Vectors"],
    Computer: ["Ch 1: Data Types & Assignment", "Ch 2: Input/Output", "Ch 3: Decision Constructs", "Ch 4: Loops", "Ch 5: Functions", "Ch 6: Arrays", "Ch 7: Pointers", "Ch 8: File Handling", "Ch 9-12: C Language"],
    English: ["Book IV: Plays", "Novel: Goodbye Mr Chips", "Grammar Revision", "Essay Writing", "Letter & Applications", "Translation", "Précis & Comprehension"],
    Urdu: ["نثر", "نظم", "غزل", "ناول/افسانہ", "قواعد", "تنقید", "مضمون نگاری"],
    Statistics: ["Ch 1: Probability", "Ch 2: Random Variables", "Ch 3: Distributions", "Ch 4: Sampling", "Ch 5: Estimation", "Ch 6: Testing of Hypothesis", "Ch 7: Association"],
  },
};

// ============================================
// BALOCHISTAN BOARD (BISE Quetta) — specific chapters
// Balochistan board zyada-tar National curriculum follow karta hai,
// lekin Pak Studies mein "Balochistan Studies" shamil hota hai
// ============================================
const BALOCHISTAN_OVERRIDES: Record<string, Record<string, string[]>> = {
  "9": {
    "Pak Studies": ["Ch 1: Ideology of Pakistan", "Ch 2: Making of Pakistan", "Ch 3: Land & Climate of Pakistan", "Ch 4: History of Pakistan", "Ch 5: Balochistan — Land & People", "Ch 6: Culture of Balochistan", "Ch 7: Resources of Balochistan"],
    Islamiat: ["ایمانیات و عقائد", "عبادات", "سیرتِ نبوی ﷺ", "قرآنی سورتیں", "احادیثِ مبارکہ", "اخلاقیات"],
  },
  "10": {
    "Pak Studies": ["Ch 1: Pakistan Movement", "Ch 2: Constitutional Development", "Ch 3: Economy of Pakistan", "Ch 4: Balochistan in Pakistan", "Ch 5: Natural Resources of Balochistan", "Ch 6: Pakistan & World Affairs"],
    Islamiat: ["قرآن مجید کی تعلیمات", "حدیث شریف", "سیرتِ طیبہ", "اسلامی معاشرت", "عبادات و معاملات"],
  },
  "11": {
    "Pak Studies": ["Ch 1: Ideological Basis", "Ch 2: Pakistan Movement", "Ch 3: Federalism & Provinces", "Ch 4: Balochistan Studies", "Ch 5: Economic Development"],
  },
  "12": {
    "Pak Studies": ["Ch 1: Constitution of Pakistan", "Ch 2: Foreign Policy", "Ch 3: Provincial Autonomy", "Ch 4: Balochistan Development", "Ch 5: National Integration"],
  },
};

// Fallback (general) — agar class match na ho
const CHAPTERS: Record<string, string[]> = {
  Physics: ["Measurement", "Motion & Force", "Work & Energy", "Waves", "Electricity", "Magnetism"],
  Chemistry: ["Basic Concepts", "Atomic Structure", "Periodic Table", "Bonding", "Acids & Bases", "Organic Chemistry"],
  Mathematics: ["Algebra", "Equations", "Trigonometry", "Geometry", "Calculus", "Statistics"],
  Biology: ["Cell Biology", "Genetics", "Human Body", "Plants", "Ecology", "Evolution"],
  English: ["Grammar", "Tenses", "Writing", "Comprehension"],
  Urdu: ["نثر", "نظم", "غزل", "قواعد"],
};

// Course name se class number nikalो (jaise "9th Class" → "9")
function getClassNum(name: string): string {
  if (name.includes("9")) return "9";
  if (name.includes("10")) return "10";
  if (name.includes("11")) return "11";
  if (name.includes("12")) return "12";
  return "10";
}

export default function CourseModal({ course, board = "quetta", onClose, onStartQuiz, onAskTutor, onQAPractice }: CourseModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const icons: Record<string, string> = {
    Physics: "⚛️", Chemistry: "🧪", Mathematics: "📐", Biology: "🧬",
    English: "✍️", Urdu: "📜", "Computer Science": "💻", "Pak Studies": "🇵🇰",
    Computer: "💻", Statistics: "📊", Islamiat: "🕌",
  };

  // Class number nikaalो (9/10/11/12) aur us class ke asli chapters lो
  const classNum = getClassNum(course.name);
  const classChapters = CHAPTERS_BY_CLASS[classNum] || {};
  // Balochistan board ke liye specific overrides (Pak Studies, Islamiat)
  const balochOverride = board === "quetta" ? (BALOCHISTAN_OVERRIDES[classNum] || {}) : {};
  const chapters = selectedSubject
    ? balochOverride[selectedSubject] ||
      classChapters[selectedSubject] ||
      CHAPTERS[selectedSubject] ||
      ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5"]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 w-full max-w-3xl overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        {/* Smart Back button — subject mein ho to subjects par wapas, warna band */}
        <button
          onClick={() => { if (selectedSubject) { setSelectedSubject(null); setSelectedChapter(null); } else { onClose(); } }}
          className="absolute left-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          ← Back
        </button>
        <button onClick={onClose} className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        {/* Header */}
        <div className="mt-12 flex items-center gap-4 border-b border-white/10 pb-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${course.color} text-4xl shadow-xl`}>
            {course.icon}
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{course.name}</h3>
            <p className="mt-1 text-sm text-violet-200/80">{course.fullName}</p>
            {/* Board badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
              🏛️ {BOARD_NAMES[board] || "Board"}
            </div>
            <div className="mt-2 flex gap-3 text-xs text-violet-200/70">
              <span>📚 {course.subjects.length} Subjects</span>
              <span>📖 {course.chapters} Chapters</span>
            </div>
          </div>
        </div>

        {!selectedSubject ? (
          /* ===== Subjects list ===== */
          <div className="mt-6">
            <h4 className="font-display text-lg font-bold text-white">📚 Subject chunें</h4>
            <p className="mt-1 text-sm text-violet-200/70">Kisi bhi subject par click karke uske chapters dekhें</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {course.subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setSelectedChapter(null); }}
                  className="glass-card lift group flex flex-col items-center rounded-2xl p-5 text-center transition hover:-translate-y-1"
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">{icons[sub] || "📘"}</span>
                  <span className="mt-2 text-sm font-bold text-white">{sub}</span>
                  <span className="mt-0.5 text-[10px] text-violet-200/60">
                    {(CHAPTERS[sub]?.length || 8)} chapters
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ===== Chapters list ===== */
          <div className="mt-6">
            <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }} className="mb-3 flex items-center gap-1 text-sm font-semibold text-violet-300 transition hover:text-white">
              ← Wapas subjects par
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icons[selectedSubject] || "📘"}</span>
              <h4 className="font-display text-xl font-bold text-white">{selectedSubject} — Chapters</h4>
            </div>

            <p className="mb-2 text-xs text-violet-200/60">👆 Kisi chapter par click karें</p>
            <div className="mt-1 max-h-72 space-y-2 overflow-y-auto scrollbar-hide pr-2">
              {chapters.map((ch, i) => {
                const active = selectedChapter === ch;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedChapter(active ? null : ch)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-amber-300/50 bg-amber-400/15 ring-1 ring-amber-300/40"
                        : "glass-card border-transparent hover:bg-white/10"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${active ? "bg-amber-500" : "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20"}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-white" dir={/[\u0600-\u06FF]/.test(ch) ? "rtl" : "ltr"}>{ch}</span>
                    <span className="text-xs">{active ? "✅ Chuna" : "📖"}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected chapter info */}
            {selectedChapter && (
              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 animate-scale-in">
                <div className="text-xs font-bold text-amber-300">📚 Chuna gaya chapter:</div>
                <div className="mt-1 text-sm font-semibold text-white" dir={/[\u0600-\u06FF]/.test(selectedChapter) ? "rtl" : "ltr"}>{selectedChapter}</div>
              </div>
            )}

            {/* Actions — 3 tarah ki practice */}
            <div className="mt-5">
              <p className="mb-2 text-xs text-violet-200/60">
                {selectedChapter ? `"${selectedChapter}" ke liye:` : "Ya poore subject ke liye:"}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button onClick={() => { const ctx = selectedSubject && selectedChapter ? { subject: selectedSubject, chapter: selectedChapter, classLevel: course.name } : undefined; onClose(); onStartQuiz(ctx); }} className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600">
                  📝 MCQ Quiz
                </button>
                <button onClick={() => { const ctx = selectedSubject && selectedChapter ? { subject: selectedSubject, chapter: selectedChapter, classLevel: course.name } : undefined; onClose(); onQAPractice(ctx); }} className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:from-amber-600 hover:to-orange-600">
                  ✍️ Answer Questions
                </button>
                <button onClick={() => { onClose(); onAskTutor(); }} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  🤖 AI Tutor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
