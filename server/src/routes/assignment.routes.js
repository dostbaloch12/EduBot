import express from "express";
import { getAssignments, submitAssignment } from "../controllers/assignment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAssignments);
router.post("/:id/submit", protect, submitAssignment);

export default router;
