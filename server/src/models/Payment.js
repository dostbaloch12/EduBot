import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["basic", "premium"], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["easypaisa", "jazzcash", "card"], default: "easypaisa" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: { type: String, required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
