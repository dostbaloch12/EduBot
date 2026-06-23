import express from "express";
import { getResults, submitResult } from "../controllers/quiz.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/results", protect, getResults);
router.post("/submit", protect, submitResult);

export default router;
