import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { aiService } from "../services/aiService.js";

// Quota limits per plan
const QUOTA = { free: 35, basic: 100, premium: 250 };

// @route POST /api/chat/ask  (AI tutor se sawal poochein - quota check ke saath)
export const askTutor = async (req, res, next) => {
  try {
    const { message, subject } = req.body;

    // Input validation (NoSQL/bad input se bachao)
    if (typeof message !== "string" || message.length < 1 || message.length > 2000) {
      return res.status(400).json({ success: false, error: "Sahi sawal likhें (max 2000 chars)" });
    }

    const user = await User.findById(req.user._id);

    // Quota check
    const today = new Date().toISOString().split("T")[0];
    let used = user.dailyQuestionsUsed;
    if (user.lastQuestionDate !== today && user.plan !== "free") used = 0;

    const limit = QUOTA[user.plan];
    if (used >= limit) {
      return res.status(403).json({
        success: false,
        error: `${user.plan === "free" ? "Free trial" : "Daily"} limit reached (${limit} questions). Please upgrade!`,
      });
    }

    // Quota decrement
    user.dailyQuestionsUsed = used + 1;
    user.lastQuestionDate = today;
    await user.save();

    // User message save
    await ChatMessage.create({ userId: user._id, role: "user", message, subject });

    // ✅ REAL AI reply (Gemini/OpenAI) generate + save
    const reply = await aiService.askTutor(message);
    await ChatMessage.create({ userId: user._id, role: "assistant", message: reply, subject });

    res.json({
      success: true,
      data: {
        reply,
        remaining: limit - user.dailyQuestionsUsed,
        user: user.toPublic(),
        aiProvider: aiService.provider(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/chat/history
export const getHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 }).limit(50);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/chat/grade  (Q&A answer ko AI se grade karें)
export const gradeAnswer = async (req, res, next) => {
  try {
    const { question, answer, idealAnswer } = req.body;
    if (typeof answer !== "string" || answer.length < 1 || answer.length > 5000) {
      return res.status(400).json({ success: false, error: "Sahi jawab likhें" });
    }
    const result = await aiService.gradeAnswer(question || "", answer, idealAnswer || "");
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/chat/generate-quiz  (chapter-wise MCQ banाo)
export const generateQuiz = async (req, res, next) => {
  try {
    const { subject, chapter, classLevel } = req.body;
    const quiz = await aiService.generateQuiz(subject || "", chapter || "", classLevel || "");
    res.json({ success: true, data: { quiz } });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/chat/generate-questions  (chapter-wise Q&A banाo)
export const generateQuestions = async (req, res, next) => {
  try {
    const { subject, chapter, classLevel } = req.body;
    const questions = await aiService.generateQuestions(subject || "", chapter || "", classLevel || "");
    res.json({ success: true, data: { questions } });
  } catch (error) {
    next(error);
  }
};
