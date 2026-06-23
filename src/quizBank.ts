// ============================================
// QUIZ BANK — Board-aligned MCQs (Matric/Inter level)
// Har subject mein bohat se questions
// ============================================

export interface MCQ {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const QUIZ_BANK: Record<string, MCQ[]> = {
  Physics: [
    { q: "What is the SI unit of electric potential difference?", options: ["Ampere", "Volt", "Joule", "Coulomb"], answer: 1, explanation: "Voltage is measured in Volts (V) = Joules per Coulomb." },
    { q: "According to Newton's Second Law, if mass is constant, force is proportional to:", options: ["Velocity", "Displacement", "Acceleration", "Inertia"], answer: 2, explanation: "F = ma. Force is directly proportional to acceleration." },
    { q: "Work done by a centripetal force in uniform circular motion is:", options: ["Positive", "Zero", "Negative", "Infinite"], answer: 1, explanation: "Force ⟂ displacement (cos 90° = 0), so work done = 0." },
    { q: "Which electromagnetic wave has the highest frequency?", options: ["Radio waves", "Microwaves", "X-rays", "Gamma rays"], answer: 3, explanation: "Gamma rays have the shortest wavelength and highest frequency." },
    { q: "Escape velocity from Earth's surface is approximately:", options: ["11.2 km/s", "9.8 m/s", "3.0×10⁸ m/s", "7.9 km/s"], answer: 0, explanation: "Earth's escape velocity ≈ 11.2 km/s." },
    { q: "The SI unit of power is:", options: ["Joule", "Newton", "Watt", "Pascal"], answer: 2, explanation: "Power is measured in Watts (1 W = 1 J/s)." },
    { q: "Which quantity is a vector?", options: ["Speed", "Distance", "Velocity", "Mass"], answer: 2, explanation: "Velocity has both magnitude and direction, so it is a vector." },
    { q: "The acceleration due to gravity on Earth is about:", options: ["9.8 m/s²", "10 m/s", "6.4 m/s²", "11 m/s²"], answer: 0, explanation: "g ≈ 9.8 m/s² near Earth's surface." },
    { q: "Ohm's Law states V =", options: ["I/R", "IR", "R/I", "I²R"], answer: 1, explanation: "V = IR (Voltage = Current × Resistance)." },
    { q: "Which device converts electrical energy into mechanical energy?", options: ["Generator", "Motor", "Transformer", "Battery"], answer: 1, explanation: "An electric motor converts electrical energy to mechanical." },
    { q: "The unit of frequency is:", options: ["Second", "Hertz", "Meter", "Newton"], answer: 1, explanation: "Frequency is measured in Hertz (Hz) = cycles per second." },
    { q: "Sound cannot travel through:", options: ["Solids", "Liquids", "Gases", "Vacuum"], answer: 3, explanation: "Sound needs a medium; it cannot travel through vacuum." },
  ],
  Chemistry: [
    { q: "Which element has atomic number 6?", options: ["Oxygen", "Nitrogen", "Carbon", "Hydrogen"], answer: 2, explanation: "Carbon has 6 protons (atomic number 6)." },
    { q: "pH of a neutral aqueous solution at 25°C is:", options: ["7", "0", "14", "1"], answer: 0, explanation: "Neutral solution has pH exactly 7." },
    { q: "Which gas evolves when acid reacts with a metal?", options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon dioxide"], answer: 1, explanation: "Metals displace hydrogen gas (H₂) from dilute acids." },
    { q: "Formula of Acetic Acid:", options: ["HCOOH", "CH₃COOH", "C₂H₅OH", "CH₃CHO"], answer: 1, explanation: "Ethanoic (acetic) acid = CH₃COOH." },
    { q: "Oxidation involves:", options: ["Gain of electrons", "Loss of electrons", "Gain of protons", "No change"], answer: 1, explanation: "Oxidation is loss of electrons (OIL RIG)." },
    { q: "The most electronegative element is:", options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"], answer: 2, explanation: "Fluorine is the most electronegative element." },
    { q: "Common salt is chemically:", options: ["KCl", "NaCl", "CaCO₃", "NaHCO₃"], answer: 1, explanation: "Table salt = Sodium Chloride (NaCl)." },
    { q: "How many electrons fill the first shell (K)?", options: ["2", "8", "18", "32"], answer: 0, explanation: "The first shell (K) holds a maximum of 2 electrons." },
    { q: "Which is a noble gas?", options: ["Oxygen", "Helium", "Hydrogen", "Sodium"], answer: 1, explanation: "Helium is a noble (inert) gas." },
    { q: "Water is made of:", options: ["1 H + 2 O", "2 H + 1 O", "2 H + 2 O", "3 H + 1 O"], answer: 1, explanation: "Water = H₂O (2 hydrogen + 1 oxygen)." },
    { q: "An acid turns litmus:", options: ["Blue", "Red", "Green", "Yellow"], answer: 1, explanation: "Acids turn blue litmus red." },
    { q: "The smallest particle of an element is:", options: ["Molecule", "Atom", "Compound", "Mixture"], answer: 1, explanation: "An atom is the smallest particle of an element." },
  ],
  Mathematics: [
    { q: "Derivative of sin(x):", options: ["-cos(x)", "cos(x)", "-sin(x)", "tan(x)"], answer: 1, explanation: "d/dx sin(x) = cos(x)." },
    { q: "If x² - 9 = 0, x =", options: ["3 only", "-3 only", "3 and -3", "0 and 9"], answer: 2, explanation: "√9 = ±3, so x = 3 and -3." },
    { q: "Sum of angles in a triangle:", options: ["90°", "180°", "270°", "360°"], answer: 1, explanation: "Interior angles of a triangle sum to 180°." },
    { q: "Value of log₁₀(100):", options: ["1", "2", "10", "100"], answer: 1, explanation: "10² = 100, so log₁₀(100) = 2." },
    { q: "Pythagoras: hypotenuse² =", options: ["base² + perp²", "base² - perp²", "base × perp", "base / perp"], answer: 0, explanation: "Hyp² = Base² + Perpendicular²." },
    { q: "Value of π (pi) is approximately:", options: ["2.14", "3.14", "1.61", "4.13"], answer: 1, explanation: "π ≈ 3.14159." },
    { q: "What is 15% of 200?", options: ["20", "30", "15", "45"], answer: 1, explanation: "15% of 200 = 0.15 × 200 = 30." },
    { q: "Solve: 2x + 6 = 14, x =", options: ["2", "4", "6", "8"], answer: 1, explanation: "2x = 8, so x = 4." },
    { q: "Area of a circle is:", options: ["2πr", "πr²", "πd", "r²"], answer: 1, explanation: "Area = πr²." },
    { q: "The factorial 5! equals:", options: ["120", "20", "25", "60"], answer: 0, explanation: "5! = 5×4×3×2×1 = 120." },
    { q: "Square root of 144:", options: ["11", "12", "13", "14"], answer: 1, explanation: "12 × 12 = 144." },
    { q: "If sin(30°) = ?", options: ["1", "0.5", "0.86", "0"], answer: 1, explanation: "sin(30°) = 0.5." },
  ],
  Biology: [
    { q: "The powerhouse of the cell is:", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2, explanation: "Mitochondria produce ATP (energy) — powerhouse of the cell." },
    { q: "Photosynthesis occurs in the:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"], answer: 1, explanation: "Chloroplasts contain chlorophyll for photosynthesis." },
    { q: "Which blood group is the universal donor?", options: ["AB+", "O-", "A+", "B-"], answer: 1, explanation: "O-negative is the universal donor." },
    { q: "Humans have how many pairs of chromosomes?", options: ["21", "22", "23", "24"], answer: 2, explanation: "Humans have 23 pairs (46 total)." },
    { q: "The basic unit of life is:", options: ["Tissue", "Organ", "Cell", "Atom"], answer: 2, explanation: "The cell is the basic structural unit of life." },
    { q: "Which organ pumps blood?", options: ["Lungs", "Liver", "Heart", "Kidney"], answer: 2, explanation: "The heart pumps blood throughout the body." },
    { q: "Mitosis produces:", options: ["2 identical cells", "4 different cells", "1 cell", "8 cells"], answer: 0, explanation: "Mitosis = 2 genetically identical diploid cells." },
    { q: "Green pigment in plants is:", options: ["Hemoglobin", "Chlorophyll", "Melanin", "Carotene"], answer: 1, explanation: "Chlorophyll gives plants their green color." },
    { q: "The largest organ of the human body is:", options: ["Liver", "Brain", "Skin", "Heart"], answer: 2, explanation: "Skin is the largest organ." },
    { q: "Insulin is produced by the:", options: ["Liver", "Pancreas", "Kidney", "Stomach"], answer: 1, explanation: "The pancreas produces insulin." },
  ],
  English: [
    { q: "Choose the correct sentence:", options: ["He don't like tea", "He doesn't likes tea", "He doesn't like tea", "He not like tea"], answer: 2, explanation: "'He doesn't like tea' is grammatically correct." },
    { q: "Plural of 'child' is:", options: ["childs", "childes", "children", "childrens"], answer: 2, explanation: "The plural of child is 'children'." },
    { q: "Synonym of 'happy':", options: ["Sad", "Joyful", "Angry", "Tired"], answer: 1, explanation: "'Joyful' means happy." },
    { q: "Antonym of 'brave':", options: ["Bold", "Courageous", "Cowardly", "Strong"], answer: 2, explanation: "'Cowardly' is the opposite of brave." },
    { q: "Which is a noun?", options: ["Run", "Beautiful", "Honesty", "Quickly"], answer: 2, explanation: "'Honesty' is an abstract noun." },
    { q: "Past tense of 'go':", options: ["goed", "went", "gone", "going"], answer: 1, explanation: "The past tense of 'go' is 'went'." },
    { q: "Identify the verb: 'She sings well.'", options: ["She", "sings", "well", "none"], answer: 1, explanation: "'Sings' is the action word (verb)." },
    { q: "Choose correct article: '___ apple a day...'", options: ["A", "An", "The", "No article"], answer: 1, explanation: "'An' is used before vowel sounds (apple)." },
  ],
  Urdu: [
    { q: "علامہ اقبال کو کس نام سے یاد کیا جاتا ہے؟", options: ["شاعرِ مشرق", "بابائے قوم", "قائدِ اعظم", "شاعرِ انقلاب"], answer: 0, explanation: "علامہ اقبال کو 'شاعرِ مشرق' کہا جاتا ہے۔" },
    { q: "'کتاب' کی جمع کیا ہے؟", options: ["کتابیں", "کتابات", "کُتب", "کتابہ"], answer: 2, explanation: "'کتاب' کی عربی جمع 'کُتب' ہے۔" },
    { q: "مرزا غالب کا اصل نام کیا تھا؟", options: ["اسد اللہ خان", "نظام الدین", "میر تقی", "ذوق"], answer: 0, explanation: "غالب کا اصل نام مرزا اسد اللہ خان تھا۔" },
    { q: "'خوشی' کا متضاد کیا ہے؟", options: ["مسرت", "غم", "راحت", "سکون"], answer: 1, explanation: "'خوشی' کا متضاد 'غم' ہے۔" },
    { q: "اسم کی کتنی اقسام ہیں؟", options: ["دو", "تین", "چار", "پانچ"], answer: 1, explanation: "اسم کی تین بنیادی اقسام ہیں (اسمِ نکرہ، اسمِ معرفہ، وغیرہ)۔" },
    { q: "'دن' کا متضاد کیا ہے؟", options: ["صبح", "شام", "رات", "دوپہر"], answer: 2, explanation: "'دن' کا متضاد 'رات' ہے۔" },
  ],
};

// Subject ke icons
export const SUBJECT_ICONS: Record<string, string> = {
  Physics: "⚛️",
  Chemistry: "🧪",
  Mathematics: "📐",
  Biology: "🧬",
  English: "✍️",
  Urdu: "📜",
};

// Array ko shuffle karें (har baar naya order)
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
