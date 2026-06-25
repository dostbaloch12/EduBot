// ============================================
// REAL AI SERVICE — Gemini / OpenAI
// AI Tutor aur Q&A grading ke liye asli AI
//
// FREE option: Google Gemini (1500 requests/din muft, koi credit card nahi)
//   → https://aistudio.google.com/app/apikey se key lो
// PAID option: OpenAI (gpt-4o-mini)
//   → https://platform.openai.com se key lो
//
// Agar koi key na ho to "smart fallback" chalega (testing ke liye).
// ============================================

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// EduBot ka system instruction (AI ko bata deta hai ke woh kya hai)
const SYSTEM_PROMPT = `Tum "EduBot" ho — Pakistan ke students ka AI ustaad (tutor).
Tum board exams (FBISE, Punjab, Sindh, KPK, Balochistan) aur competitive
exams (CSS, MDCAT, ECAT, PPSC) ki tayari mein madad karte ho.
- Jawab clear, concise aur exam-focused do.
- Jahan zaroori ho formula, definition, ya example do.
- Student ki zubaan (Urdu/English) ke mutabiq jawab do.
- High-yield exam tips do taake achay marks aayein.`;

// ---------- Gemini se jawab (429 par auto-retry) ----------
async function askGemini(userMessage, system = SYSTEM_PROMPT, retries = 2) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    }),
  });

  // 429 (rate limit) → thoda ruk kar dobara koshish
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 2500));
    return askGemini(userMessage, system, retries - 1);
  }

  if (!res.ok) throw new Error("Gemini API error " + res.status);
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// ---------- OpenAI se jawab ----------
async function askOpenAI(userMessage, system = SYSTEM_PROMPT) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error("OpenAI API error " + res.status);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() || "";
}

// ---------- Smart fallback (jab koi AI key na ho) ----------
const FALLBACK = {
  newton: "Newton's Second Law: F = ma. Board exam mein pehle definition, phir formula, SI unit (Newton), aur real-life example likhें — full marks ke liye!",
  css: "CSS Essay tips: 1) Clear thesis. 2) Detailed outline. 3) UN/World Bank reports se arguments support karें.",
  default: "Bohat acha sawal! Isay definitions, core principles, aur examples mein torें. Diagram ya formula zaroor add karें marks ke liye. (Asli AI jawab ke liye GEMINI_API_KEY .env mein daalें)",
};
function fallbackReply(msg) {
  const t = msg.toLowerCase();
  if (t.includes("newton") || t.includes("force")) return FALLBACK.newton;
  if (t.includes("css") || t.includes("essay")) return FALLBACK.css;
  return FALLBACK.default;
}

export const aiService = {
  isLive: () => Boolean(GEMINI_KEY || OPENAI_KEY),
  provider: () => (GEMINI_KEY ? "gemini" : OPENAI_KEY ? "openai" : "fallback"),

  // AI Tutor — student ke sawal ka jawab
  async askTutor(message) {
    try {
      if (GEMINI_KEY) return await askGemini(message);
      if (OPENAI_KEY) return await askOpenAI(message);
      return fallbackReply(message);
    } catch (err) {
      console.error("AI error:", err.message);
      return fallbackReply(message);
    }
  },

  // Q&A grading — student ke jawab ko score karें
  async gradeAnswer(question, studentAnswer, idealAnswer) {
    const prompt = `Tum ek examiner ho. Yeh sawal hai: "${question}".
Ideal answer: "${idealAnswer}".
Student ka jawab: "${studentAnswer}".

Student ke jawab ko 10 mein se score do aur JSON format mein jawab do:
{"score": <number 0-10>, "strengths": "<student ki achi baatein>", "improvement": "<kaise behtar kare>"}
Sirf JSON do, koi aur text nahi.`;

    try {
      let raw = "";
      if (GEMINI_KEY) raw = await askGemini(prompt, "Tum ek strict but helpful examiner ho.");
      else if (OPENAI_KEY) raw = await askOpenAI(prompt, "Tum ek strict but helpful examiner ho.");
      else throw new Error("no key");

      // JSON nikaalें (kabhi kabhi AI extra text deta hai)
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error("bad json");
    } catch {
      // Fallback grading (word count based)
      const words = studentAnswer.trim().split(/\s+/).length;
      const score = words > 30 ? 9 : words > 10 ? 7 : 4;
      return {
        score,
        strengths: "Aap ne sawal ko address kiya.",
        improvement: "Zyada technical detail aur examples add karें. (Asli AI grading ke liye GEMINI_API_KEY daalें)",
      };
    }
  },

  // ---- Chapter-wise MCQ Quiz banाo (AI se) ----
  async generateQuiz(subject, chapter, classLevel) {
    const prompt = `Tum ek Pakistani board exam teacher ho.
Subject: ${subject}, Chapter: "${chapter}", Class: ${classLevel || "Matric"}.
Iss chapter ke 5 multiple-choice questions (MCQs) banाo jo board exam level ke hon.
Sirf JSON array do is format mein (koi aur text nahi):
[{"q":"sawal","options":["A","B","C","D"],"answer":<0-3 index>,"explanation":"short reason"}]`;

    try {
      let raw = "";
      if (GEMINI_KEY) raw = await askGemini(prompt, "Tum board exam MCQs banane wale teacher ho.");
      else if (OPENAI_KEY) raw = await askOpenAI(prompt, "Tum board exam MCQs banane wale teacher ho.");
      else throw new Error("no key");
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error("bad json");
    } catch {
      return null; // frontend apna fallback bank use karega
    }
  },

  // ---- Chapter-wise descriptive Q&A banाo (AI se) ----
  async generateQuestions(subject, chapter, classLevel) {
    const prompt = `Tum ek Pakistani board exam teacher ho.
Subject: ${subject}, Chapter: "${chapter}", Class: ${classLevel || "Matric"}.
Iss chapter ke 5 descriptive (long/short answer) questions banाo jo board exam mein aate hain.
Sirf JSON array do is format mein (koi aur text nahi):
[{"q":"sawal","hint":"short hint","idealAnswer":"model answer 2-3 sentences"}]`;

    try {
      let raw = "";
      if (GEMINI_KEY) raw = await askGemini(prompt, "Tum board exam questions banane wale teacher ho.");
      else if (OPENAI_KEY) raw = await askOpenAI(prompt, "Tum board exam questions banane wale teacher ho.");
      else throw new Error("no key");
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error("bad json");
    } catch {
      return null;
    }
  },
};
