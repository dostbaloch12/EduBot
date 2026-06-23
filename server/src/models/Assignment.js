import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "📝" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "submitted", "overdue"],
      default: "pending",
    },
    questions: { type: Number, default: 10 },
    marks: { type: Number, default: 50 },
    obtainedMarks: { type: Number },
    due: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
