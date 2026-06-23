import express from "express";
import { getProgress, updateProgress } from "../controllers/progress.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProgress);
router.put("/", protect, updateProgress);

export default router;
