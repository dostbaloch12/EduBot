export type BoardId = "fbise" | "lahore" | "karachi" | "peshawar" | "quetta";

export interface Board {
  id: BoardId;
  name: string;
  fullName: string;
  icon: string;
  color: string;
}

export interface Course {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  subjects: string[];
  chapters: number;
}

export interface TestPrep {
  id: string;
  name: string;
  fullName: string;
  category: string;
  desc: string;
  icon: string;
  color: string;
  totalMcqs: number;
  pastPapers: string[];
  enrolled: string;
  sampleQuestions: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

export const BOARDS: Board[] = [
  { id: "fbise", name: "FBISE", fullName: "Federal Board Islamabad", icon: "🏛️", color: "from-sky-500 to-blue-600" },
  { id: "lahore", name: "BISE Lahore", fullName: "Board of Intermediate & Secondary Education Lahore", icon: "🕌", color: "from-amber-500 to-orange-600" },
  { id: "karachi", name: "BSEK/BIEK Karachi", fullName: "Karachi Secondary & Intermediate Board", icon: "🌊", color: "from-emerald-500 to-teal-600" },
  { id: "peshawar", name: "BISE Peshawar", fullName: "Peshawar Education Board", icon: "🏔️", color: "from-rose-500 to-red-600" },
  { id: "quetta", name: "BISE Quetta", fullName: "Balochistan Board Quetta", icon: "🌄", color: "from-purple-500 to-fuchsia-600" },
];

const STANDARD_COURSES: Course[] = [
  {
    id: "c_9",
    name: "9th Class",
    fullName: "Matriculation Part-I (Science & General)",
    icon: "🎒",
    color: "from-violet-500 to-fuchsia-500",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu", "Islamiat"],
    chapters: 42,
  },
  {
    id: "c_10",
    name: "10th Class",
    fullName: "Matriculation Part-II (SSC Examination)",
    icon: "🎓",
    color: "from-emerald-500 to-teal-500",
    subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science", "English", "Urdu", "Pak Studies"],
    chapters: 48,
  },
  {
    id: "c_11",
    name: "11th Class (FSc/ICS)",
    fullName: "Intermediate Part-I (Pre-Med, Pre-Eng, ICS)",
    icon: "📐",
    color: "from-sky-500 to-blue-600",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer", "English"],
    chapters: 54,
  },
  {
    id: "c_12",
    name: "12th Class (FSc/ICS)",
    fullName: "Intermediate Part-II (HSSC Examination)",
    icon: "🔬",
    color: "from-amber-400 to-orange-500",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer", "Statistics"],
    chapters: 60,
  },
];

export const BOARD_COURSES: Record<BoardId, Course[]> = {
  fbise: STANDARD_COURSES.map(c => ({ ...c, fullName: `${c.fullName} - FBISE Syllabus` })),
  lahore: STANDARD_COURSES.map(c => ({ ...c, fullName: `${c.fullName} - Punjab Textbooks` })),
  karachi: STANDARD_COURSES.map(c => ({ ...c, fullName: `${c.fullName} - Sindh Board Syllabus` })),
  peshawar: STANDARD_COURSES.map(c => ({ ...c, fullName: `${c.fullName} - KPK Textbooks` })),
  quetta: STANDARD_COURSES.map(c => ({ ...c, fullName: `${c.fullName} - Balochistan Textbooks` })),
};

export const TEST_PREP: TestPrep[] = [
  {
    id: "tp_css",
    name: "CSS Exam Prep",
    fullName: "Central Superior Services Pakistan",
    category: "Civil Services",
    desc: "Master compulsory & optional subjects with high-scoring vocabulary, current affairs analyses, and past papers.",
    icon: "🇵🇰",
    color: "from-emerald-500 to-teal-600",
    totalMcqs: 12500,
    pastPapers: ["CSS 2025 General Science", "CSS 2024 Current Affairs", "CSS 2023 English Précis", "CSS 2022 Pakistan Affairs"],
    enrolled: "14.2k",
    sampleQuestions: [
      {
        q: "Which article of the Constitution of Pakistan 1973 deals with the Right to Fair Trial?",
        options: ["Article 10A", "Article 19", "Article 25", "Article 14"],
        answer: 0,
        explanation: "Article 10A was inserted by the 18th Amendment in 2010, ensuring the right to a fair trial and due process."
      },
      {
        q: "Who was the first President of the Constituent Assembly of Pakistan?",
        options: ["Liaquat Ali Khan", "Quaid-e-Azam Muhammad Ali Jinnah", "Maulvi Tamizuddin", "Khawaja Nazimuddin"],
        answer: 1,
        explanation: "Quaid-e-Azam Muhammad Ali Jinnah was elected as the first President of the Constituent Assembly on 11 August 1947."
      },
      {
        q: "Which of the following greenhouse gases has the highest global warming potential per molecule?",
        options: ["Carbon Dioxide (CO2)", "Methane (CH4)", "Nitrous Oxide (N2O)", "Sulfur Hexafluoride (SF6)"],
        answer: 3,
        explanation: "Sulfur Hexafluoride (SF6) is an extremely potent greenhouse gas with a global warming potential 23,500 times that of CO2."
      },
      {
        q: "What is the primary objective of the FATF (Financial Action Task Force)?",
        options: ["Combat money laundering and terrorism financing", "Regulate international trade tariffs", "Provide structural adjustment loans", "Oversee bilateral currency swaps"],
        answer: 0,
        explanation: "FATF is an inter-governmental body established in 1989 to set standards and promote effective implementation of legal, regulatory and operational measures for combating money laundering and terrorist financing."
      }
    ]
  },
  {
    id: "tp_mdcat",
    name: "MDCAT Preparation",
    fullName: "Medical & Dental College Admission Test",
    category: "Medical Entry Test",
    desc: "Biology, Chemistry, Physics, and English MCQs formulated strictly according to PMDC guidelines.",
    icon: "🩺",
    color: "from-rose-500 to-pink-600",
    totalMcqs: 18000,
    pastPapers: ["MDCAT 2025 Paper", "MDCAT 2024 Past MCQs", "MDCAT 2023 PMDC Sample", "NUMS Entry Test Past Paper"],
    enrolled: "28.5k",
    sampleQuestions: [
      {
        q: "Where does the light-dependent reaction of photosynthesis occur?",
        options: ["Stroma", "Thylakoid membrane", "Outer chloroplast membrane", "Mitochondrial matrix"],
        answer: 1,
        explanation: "The light-dependent reactions take place in the thylakoid membranes of chloroplasts, where chlorophyll absorbs light energy."
      },
      {
        q: "Which blood group is known as the universal recipient in ABO system?",
        options: ["O negative", "A positive", "B negative", "AB positive"],
        answer: 3,
        explanation: "AB positive individuals have both A and B antigens on red blood cells and lack antibodies against A and B, making them universal recipients."
      },
      {
        q: "What is the hybridization of carbon in a benzene ring?",
        options: ["sp3", "sp2", "sp", "dsp2"],
        answer: 1,
        explanation: "Each carbon atom in benzene is sp2 hybridized, forming three sigma bonds with planar geometry and one unhybridized p-orbital for delocalized pi bonding."
      }
    ]
  },
  {
    id: "tp_ecat",
    name: "ECAT Engineering Prep",
    fullName: "Engineering College Admission Test (UET / NUST / GIKI)",
    category: "Engineering Entry Test",
    desc: "Rigorous analytical math, advanced kinematics, circuit analysis, and logical reasoning for top engineering varsities.",
    icon: "⚙️",
    color: "from-amber-400 to-orange-500",
    totalMcqs: 15400,
    pastPapers: ["UET ECAT 2025", "NUST NET 3 Mock", "GIKI Practice Paper", "FAST NU Sample Test"],
    enrolled: "22.1k",
    sampleQuestions: [
      {
        q: "If the velocity of a body is doubled, what happens to its kinetic energy?",
        options: ["Remains same", "Doubles", "Increases by 4 times", "Halves"],
        answer: 2,
        explanation: "Kinetic energy equals 0.5 * m * v^2. If v becomes 2v, then (2v)^2 = 4v^2, so KE increases by a factor of 4."
      },
      {
        q: "What is the derivative of x^x with respect to x?",
        options: ["x^x(1 + ln x)", "x^x ln x", "x*x^(x-1)", "1"],
        answer: 0,
        explanation: "Using logarithmic differentiation: y = x^x => ln y = x ln x. Differentiating both sides gives (1/y) dy/dx = 1*ln x + x*(1/x) = 1 + ln x. Thus dy/dx = x^x(1 + ln x)."
      }
    ]
  },
  {
    id: "tp_ppsc",
    name: "PPSC / FPSC / NTS",
    fullName: "Provincial & Federal Service Commissions / NTS Prep",
    category: "Govt Jobs & Scholarships",
    desc: "General Knowledge, Pakistan Affairs, Everyday Science, Islamiat, and Quantitative Aptitude for 16th/17th grade positions.",
    icon: "💼",
    color: "from-sky-400 to-blue-600",
    totalMcqs: 25000,
    pastPapers: ["PPSC Tehsildar Paper", "FPSC Custom Inspector 2024", "NTS GAT General Sample", "PPSC Lecturer Physics"],
    enrolled: "35.8k",
    sampleQuestions: [
      {
        q: "Which pass connects Pakistan with Afghanistan?",
        options: ["Khunjerab Pass", "Khyber Pass", "Bolan Pass", "Lowari Pass"],
        answer: 1,
        explanation: "The Khyber Pass is a mountain pass in the Khyber Pakhtunkhwa province of Pakistan, on the border with Nangarhar Province of Afghanistan."
      },
      {
        q: "What is the chemical formula of Table Salt?",
        options: ["KCl", "NaCl", "Na2CO3", "NaHCO3"],
        answer: 1,
        explanation: "Sodium chloride (NaCl) is commonly known as salt or table salt."
      }
    ]
  }
];
