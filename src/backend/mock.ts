// ============================================
// MOCK BACKEND (Demo Mode) — localStorage based
// Jab real backend (localhost:5000) na chal raha ho,
// to app khud-ba-khud iss demo mode par switch ho jata hai.
// Yeh exactly waise hi responses deta hai jaise real backend.
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const DB_KEY = "edubot_mock_db";

interface MockUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  classLevel: string;
  board: string;
  plan: "free" | "basic" | "premium";
  planExpiresAt?: string;
  xp: number;
  level: number;
  streak: number;
  dailyUsed: number;
  lastUsedDate: string;
  createdAt: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiry?: number;
}

// Trial kitne din ka hai (iss ke baad har login par OTP zaroori)
const TRIAL_DAYS = 10;

// Account kitne din purana hai (whole days)
const accountAgeDays = (createdAt: string) =>
  Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

interface MockDB {
  users: MockUser[];
  progress: Record<string, any[]>;
  assignments: Record<string, any[]>;
  results: Record<string, any[]>;
}

const DEFAULT_SUBJECTS = [
  { subject: "Physics", icon: "⚛️", color: "from-violet-500 to-fuchsia-500", progress: 35 },
  { subject: "Chemistry", icon: "🧪", color: "from-emerald-500 to-teal-500", progress: 20 },
  { subject: "Mathematics", icon: "📐", color: "from-sky-500 to-blue-600", progress: 55 },
  { subject: "Biology", icon: "🧬", color: "from-amber-400 to-orange-500", progress: 40 },
  { subject: "English", icon: "✍️", color: "from-purple-500 to-indigo-500", progress: 70 },
  { subject: "Urdu", icon: "📜", color: "from-pink-500 to-rose-500", progress: 50 },
];

const DEFAULT_ASSIGNMENTS = [
  { id: "a1", subject: "Physics", title: "Newton's Laws & Kinematics", description: "Derive equations of motion and solve friction problems.", icon: "⚛️", difficulty: "Medium", questions: 10, marks: 50, due: "Tomorrow, 11:59 PM", status: "pending" },
  { id: "a2", subject: "Chemistry", title: "Organic Functional Groups", description: "IUPAC naming of alkanes, alcohols, esters.", icon: "🧪", difficulty: "Hard", questions: 15, marks: 75, due: "Friday, 5:00 PM", status: "in-progress" },
  { id: "a3", subject: "Mathematics", title: "Quadratic Equations & Matrices", description: "Completing the square and Cramer's rule.", icon: "📐", difficulty: "Easy", questions: 8, marks: 40, due: "Next Monday", status: "pending" },
  { id: "a4", subject: "Biology", title: "Cellular Respiration", description: "Glycolysis cycle and ATP generation.", icon: "🧬", difficulty: "Medium", questions: 12, marks: 60, obtainedMarks: 56, due: "Submitted 2 days ago", status: "submitted" },
  { id: "a5", subject: "English", title: "Direct & Indirect Speech", description: "Narrative tense conversion rules.", icon: "✍️", difficulty: "Easy", questions: 20, marks: 40, due: "Thursday, 8:00 AM", status: "pending" },
  { id: "a6", subject: "Urdu", title: "Ghazal & Ashaar Explanation", description: "Mirza Ghalib and Allama Iqbal verses.", icon: "📜", difficulty: "Medium", questions: 5, marks: 30, due: "Yesterday", status: "overdue" },
];

const DEFAULT_RESULTS = [
  { id: "r1", subject: "Mathematics", score: 10, total: 10, xpEarned: 50, takenAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "r2", subject: "Physics", score: 8, total: 10, xpEarned: 40, takenAt: new Date(Date.now() - 86400000).toISOString() },
];

const loadDB = (): MockDB => {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  return { users: [], progress: {}, assignments: {}, results: {} };
};

const saveDB = (db: MockDB) => localStorage.setItem(DB_KEY, JSON.stringify(db));

const toPublic = (u: MockUser) => ({
  id: u.id,
  name: u.fullName,
  city: u.city,
  board: u.board,
  className: u.classLevel,
  plan: u.plan,
  planExpiresAt: u.planExpiresAt,
  xp: u.xp,
  level: u.level,
  streak: u.streak,
  dailyUsed: u.dailyUsed,
  lastUsedDate: u.lastUsedDate,
  createdAt: u.createdAt,
  isVerified: u.isVerified,
});

const SMART_REPLIES: Record<string, string> = {
  newton: "Newton's Second Law states F = ma. Pakistan board exams mein: pehle definition, phir formula, phir SI unit (Newton), aur ek real-life example likhें — full marks!",
  css: "High-scoring CSS Essay: 1) Clear thesis statement. 2) Detailed outline with headings. 3) Arguments ko UN/World Bank reports se support karें.",
  mitosis: "Mitosis se do identical diploid cells bante hain (growth), Meiosis se chaar diverse haploid cells (gametes). Labeled diagram banayें top marks ke liye.",
  default: "Bohat acha sawal! Isay definitions, core principles, aur examples mein torें. Diagram ya formula zaroor add karें marks ke liye.",
};

const getReply = (msg: string) => {
  const t = msg.toLowerCase();
  if (t.includes("newton") || t.includes("force")) return SMART_REPLIES.newton;
  if (t.includes("css") || t.includes("essay")) return SMART_REPLIES.css;
  if (t.includes("mitosis") || t.includes("cell")) return SMART_REPLIES.mitosis;
  return SMART_REPLIES.default;
};

const QUOTA: Record<string, number> = { free: 35, basic: 100, premium: 250 };

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Current logged-in user ki id (token = userId in demo)
let currentToken: string | null = null;

export const mockBackend = {
  setToken: (t: string | null) => { currentToken = t; },

  async handle<T>(endpoint: string, method: string, body?: any): Promise<ApiResponse<T>> {
    await delay();
    const db = loadDB();

    const getCurrentUser = () => db.users.find((u) => u.id === currentToken);

    // ---- AUTH ----
    if (endpoint === "/auth/signup" && method === "POST") {
      if (db.users.some((u) => u.email === body.email.toLowerCase())) {
        return { success: false, error: "Email already registered" } as ApiResponse<T>;
      }
      const id = "u_" + Date.now();
      const today = new Date().toISOString().split("T")[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser: MockUser = {
        id, fullName: body.fullName, email: body.email.toLowerCase(), password: body.password,
        phone: body.phone, city: body.city || "Lahore", classLevel: body.classLevel || "10th Class",
        board: body.board || "lahore", plan: "free", xp: 100, level: 1, streak: 1,
        dailyUsed: 0, lastUsedDate: today, createdAt: new Date().toISOString(), isVerified: false,
      };
      db.users.push(newUser);
      db.progress[id] = DEFAULT_SUBJECTS.map((s) => ({ ...s }));
      db.assignments[id] = DEFAULT_ASSIGNMENTS.map((a) => ({ ...a }));
      db.results[id] = DEFAULT_RESULTS.map((r) => ({ ...r }));
      saveDB(db);
      currentToken = id;
      return { success: true, data: { user: toPublic(newUser), token: id, devOtp: otp } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/login" && method === "POST") {
      // Input safai — sirf string allow (NoSQL-style injection vector block)
      if (typeof body.email !== "string" || typeof body.password !== "string") {
        return { success: false, error: "Invalid input" } as ApiResponse<T>;
      }

      // Client-side brute-force throttle (demo) — 8 ghalat attempts / 15 min
      const bfKey = "edubot_login_attempts";
      const now = Date.now();
      let bf = { count: 0, until: 0 };
      try { bf = JSON.parse(localStorage.getItem(bfKey) || "{}"); } catch { /* */ }
      if (bf.until && now < bf.until) {
        return { success: false, error: "Bohat zyada login attempts. Thori der baad koshish karें." } as ApiResponse<T>;
      }

      const user = db.users.find((u) => u.email === body.email?.toLowerCase());
      if (!user || user.password !== body.password) {
        const count = (bf.count || 0) + 1;
        const until = count >= 8 ? now + 15 * 60 * 1000 : 0; // 8 ke baad 15 min block
        localStorage.setItem(bfKey, JSON.stringify({ count, until }));
        return { success: false, error: "Invalid email or password" } as ApiResponse<T>;
      }
      // Kamyab login → counter reset
      localStorage.removeItem(bfKey);

      // 10 din trial khatam → free user ko har login par phone OTP zaroori
      const needsOtp = user.plan === "free" && accountAgeDays(user.createdAt) >= TRIAL_DAYS;

      if (needsOtp) {
        // OTP generate karें (5 min valid)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        saveDB(db);
        // Login abhi NAHI hoga — pehle OTP verify karna hoga
        return {
          success: true,
          data: {
            otpRequired: true,
            phone: user.phone,
            maskedPhone: user.phone.replace(/.(?=.{3})/g, "*"),
            devOtp: otp, // ⚠️ sirf demo — real app mein SMS jayega
            message: "Trial khatam ho gaya. Aap ke number par OTP bheja gaya hai.",
          },
        } as ApiResponse<T>;
      }

      // Normal login (trial ke andar ya paid user)
      currentToken = user.id;
      return { success: true, data: { user: toPublic(user), token: user.id, otpRequired: false } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/login-otp" && method === "POST") {
      // OTP verify karke login complete karें
      const user = db.users.find((u) => u.email === body.email?.toLowerCase());
      if (!user) return { success: false, error: "User not found" } as ApiResponse<T>;
      if (!user.otpCode || user.otpExpiry! < Date.now()) {
        return { success: false, error: "OTP expire ho gaya. Dobara login karें." } as ApiResponse<T>;
      }
      if (user.otpCode !== body.otp) {
        return { success: false, error: "Ghalat OTP. Dobara koshish karें." } as ApiResponse<T>;
      }
      // OTP sahi → login complete
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      currentToken = user.id;
      saveDB(db);
      return { success: true, data: { user: toPublic(user), token: user.id } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/resend-otp" && method === "POST") {
      const user = db.users.find((u) => u.email === body.email?.toLowerCase());
      if (!user) return { success: false, error: "User not found" } as ApiResponse<T>;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;
      saveDB(db);
      return { success: true, data: { devOtp: otp, maskedPhone: user.phone.replace(/.(?=.{3})/g, "*") } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/me" && method === "GET") {
      const user = getCurrentUser();
      if (!user) return { success: false, error: "Not authorized" } as ApiResponse<T>;
      return { success: true, data: { user: toPublic(user) } } as ApiResponse<T>;
    }

    // ---- Password reset (demo) ----
    if (endpoint === "/auth/forgot-password" && method === "POST") {
      const user = db.users.find((u) => u.email === body.email?.toLowerCase());
      if (user) {
        (user as any).resetToken = "demo-reset-token";
        saveDB(db);
      }
      // Demo: token wapas bhejें taake test ho sake
      return { success: true, message: "Demo: reset link generate hua", data: { devToken: "demo-reset-token" } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/reset-password" && method === "POST") {
      const user = db.users.find((u) => u.email === body.email?.toLowerCase());
      if (!user || (user as any).resetToken !== body.token) {
        return { success: false, error: "Reset link invalid" } as ApiResponse<T>;
      }
      if (!body.newPassword || body.newPassword.length < 6) {
        return { success: false, error: "Password kam az kam 6 characters" } as ApiResponse<T>;
      }
      user.password = body.newPassword;
      (user as any).resetToken = undefined;
      saveDB(db);
      return { success: true, message: "Password reset ho gaya!" } as ApiResponse<T>;
    }

    // ---- Google login (demo) ----
    if (endpoint === "/auth/google" && method === "POST") {
      const email = "google.user@gmail.com";
      let user = db.users.find((u) => u.email === email);
      if (!user) {
        const id = "u_google_" + Date.now();
        const today = new Date().toISOString().split("T")[0];
        user = {
          id, fullName: "Google User", email, password: "", phone: "",
          city: "Lahore", classLevel: "10th Class", board: "lahore",
          plan: "free", xp: 100, level: 1, streak: 1, dailyUsed: 0,
          lastUsedDate: today, createdAt: new Date().toISOString(), isVerified: true,
        };
        (user as any).phoneVerified = false;
        db.users.push(user);
        db.progress[id] = DEFAULT_SUBJECTS.map((s) => ({ ...s }));
        db.assignments[id] = DEFAULT_ASSIGNMENTS.map((a) => ({ ...a }));
        db.results[id] = DEFAULT_RESULTS.map((r) => ({ ...r }));
        saveDB(db);
      }
      currentToken = user.id;
      // ⚠️ Phone verify zaroori → login complete nahi
      if (!(user as any).phoneVerified) {
        return { success: true, data: { phoneRequired: true, tempToken: user.id, message: "Phone verify karें" } } as ApiResponse<T>;
      }
      return { success: true, data: { user: toPublic(user), token: user.id } } as ApiResponse<T>;
    }

    // ---- Phone OTP bhejें (Google/naye users) ----
    if (endpoint === "/auth/send-phone-otp" && method === "POST") {
      const u = getCurrentUser();
      if (!u) return { success: false, error: "Not authorized" } as ApiResponse<T>;
      // Ek phone = ek account
      const used = db.users.find((x) => x.phone === body.phone && (x as any).phoneVerified && x.id !== u.id);
      if (used) return { success: false, error: "Yeh phone pehle se kisi account par verified hai" } as ApiResponse<T>;
      u.phone = body.phone;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      u.otpCode = otp;
      u.otpExpiry = Date.now() + 10 * 60 * 1000;
      saveDB(db);
      return { success: true, data: { maskedPhone: body.phone.replace(/.(?=.{3})/g, "*"), devOtp: otp, message: "OTP bheja gaya" } } as ApiResponse<T>;
    }

    // ---- Phone OTP confirm → login complete ----
    if (endpoint === "/auth/confirm-phone" && method === "POST") {
      const u = getCurrentUser();
      if (!u) return { success: false, error: "Not authorized" } as ApiResponse<T>;
      if (u.otpCode !== body.otp) return { success: false, error: "Ghalat OTP" } as ApiResponse<T>;
      (u as any).phoneVerified = true;
      u.otpCode = undefined;
      u.otpExpiry = undefined;
      saveDB(db);
      return { success: true, data: { user: toPublic(u), token: u.id } } as ApiResponse<T>;
    }

    // ---- Subscription cancel/change (demo) ----
    if (endpoint === "/payments/cancel" && method === "POST") {
      const u = getCurrentUser();
      if (!u) return { success: false, error: "Not authorized" } as ApiResponse<T>;
      if (u.plan === "free") return { success: false, error: "Aap pehle se free plan par hain" } as ApiResponse<T>;
      return { success: true, message: "Subscription cancel ho gaya (cycle ke aakhir tak active rahega).", data: { user: toPublic(u) } } as ApiResponse<T>;
    }

    if (endpoint === "/auth/verify-otp" && method === "POST") {
      const user = db.users.find((u) => u.phone === body.phone);
      if (user) { user.isVerified = true; saveDB(db); }
      return { success: true, data: { user: user ? toPublic(user) : null } } as ApiResponse<T>;
    }

    // ---- DATA (need current user) ----
    const user = getCurrentUser();
    if (!user) return { success: false, error: "Not authorized" } as ApiResponse<T>;

    if (endpoint === "/progress" && method === "GET") {
      return { success: true, data: db.progress[user.id] || [] } as ApiResponse<T>;
    }

    if (endpoint === "/assignments" && method === "GET") {
      return { success: true, data: db.assignments[user.id] || [] } as ApiResponse<T>;
    }

    if (endpoint.startsWith("/assignments/") && endpoint.endsWith("/submit") && method === "POST") {
      const id = endpoint.split("/")[2];
      const list = db.assignments[user.id] || [];
      const a = list.find((x: any) => x.id === id);
      if (!a) return { success: false, error: "Assignment not found" } as ApiResponse<T>;
      a.status = "submitted";
      a.obtainedMarks = Math.round(a.marks * 0.9);
      a.due = "Submitted just now";
      user.xp += 15;
      user.level = Math.floor(user.xp / 100) + 1;
      saveDB(db);
      return { success: true, data: { assignment: { marks: a.marks, obtainedMarks: a.obtainedMarks }, user: toPublic(user) } } as ApiResponse<T>;
    }

    if (endpoint === "/quiz/results" && method === "GET") {
      return { success: true, data: db.results[user.id] || [] } as ApiResponse<T>;
    }

    if (endpoint === "/quiz/submit" && method === "POST") {
      const xpEarned = body.score * 10;
      const result = { id: "r_" + Date.now(), subject: body.subject, score: body.score, total: body.total, xpEarned, takenAt: new Date().toISOString() };
      db.results[user.id] = [result, ...(db.results[user.id] || [])];
      user.xp += xpEarned;
      user.level = Math.floor(user.xp / 100) + 1;
      saveDB(db);
      return { success: true, data: { result, user: toPublic(user) } } as ApiResponse<T>;
    }

    if (endpoint === "/payments/checkout" && method === "POST") {
      const days = body.plan === "basic" ? 15 : 30;
      const exp = new Date(); exp.setDate(exp.getDate() + days);
      user.plan = body.plan;
      user.planExpiresAt = exp.toISOString();
      user.dailyUsed = 0;
      user.lastUsedDate = new Date().toISOString().split("T")[0];
      saveDB(db);
      return { success: true, data: { payment: { id: "p_" + Date.now(), transactionId: "TXN" + Date.now() }, user: toPublic(user) } } as ApiResponse<T>;
    }

    if (endpoint === "/chat/ask" && method === "POST") {
      const today = new Date().toISOString().split("T")[0];
      let used = user.dailyUsed;
      if (user.lastUsedDate !== today && user.plan !== "free") used = 0;
      const limit = QUOTA[user.plan];
      if (used >= limit) {
        return { success: false, error: `${user.plan === "free" ? "Free trial" : "Daily"} limit reached (${limit} questions). Please upgrade!` } as ApiResponse<T>;
      }
      user.dailyUsed = used + 1;
      user.lastUsedDate = today;
      saveDB(db);
      return { success: true, data: { reply: getReply(body.message), remaining: limit - user.dailyUsed, user: toPublic(user) } } as ApiResponse<T>;
    }

    // Chapter quiz/questions (demo — null, frontend apna bank use karega)
    if (endpoint === "/chat/generate-quiz" && method === "POST") {
      return { success: true, data: { quiz: null } } as ApiResponse<T>;
    }
    if (endpoint === "/chat/generate-questions" && method === "POST") {
      return { success: true, data: { questions: null } } as ApiResponse<T>;
    }

    // Q&A grading (demo) — word count based
    if (endpoint === "/chat/grade" && method === "POST") {
      const words = (body.answer || "").trim().split(/\s+/).filter(Boolean).length;
      const score = words > 30 ? 9 : words > 12 ? 7.5 : words > 4 ? 5.5 : 3;
      return {
        success: true,
        data: {
          score,
          strengths: words > 12 ? "Aap ne acha structure aur depth dikhai." : "Aap ne sawal ko address kiya.",
          improvement: "Zyada technical keywords, definitions aur examples add karें. (Asli AI grading ke liye backend par GEMINI_API_KEY daalें)",
        },
      } as ApiResponse<T>;
    }

    return { success: false, error: "Mock endpoint not found: " + endpoint } as ApiResponse<T>;
  },
};
