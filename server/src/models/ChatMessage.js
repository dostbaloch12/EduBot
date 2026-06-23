import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    message: { type: String, required: true },
    subject: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
