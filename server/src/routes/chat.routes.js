import express from "express";
import { askTutor, getHistory, gradeAnswer, generateQuiz, generateQuestions } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/ask", protect, askTutor);
router.post("/grade", protect, gradeAnswer);
router.post("/generate-quiz", protect, generateQuiz);
router.post("/generate-questions", protect, generateQuestions);
router.get("/history", protect, getHistory);

export default router;
