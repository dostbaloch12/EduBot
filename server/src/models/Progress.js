import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    icon: { type: String, default: "📘" },
    color: { type: String, default: "from-violet-500 to-fuchsia-500" },
    classLevel: { type: String, default: "" },
    board: { type: String, default: "" },
    completedChapters: { type: [String], default: [] },
    totalChapters: { type: Number, default: 10 },
    progress: { type: Number, default: 0 }, // percentage 0-100
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
