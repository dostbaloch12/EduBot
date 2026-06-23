import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    chapter: { type: String, default: "" },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
    answers: { type: [Number], default: [] },
    takenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
