import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 }, // Google login walon ka nahi hota
    phone: { type: String, trim: true }, // Google walon ka baad mein verify hoga
    phoneVerified: { type: Boolean, default: false }, // OTP se verify hua?
    city: { type: String, default: "Lahore" },
    classLevel: { type: String, default: "10th Class" },
    board: { type: String, default: "lahore" },

    plan: { type: String, enum: ["free", "basic", "premium"], default: "free" },
    planExpiresAt: { type: Date },

    xp: { type: Number, default: 100 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 1 },
    lastLoginDate: { type: String, default: "" },

    // Daily AI quota tracking
    dailyQuestionsUsed: { type: Number, default: 0 },
    lastQuestionDate: { type: String, default: "" },

    // OTP verification
    otpCode: { type: String }, // SHA-256 hashed (plain text nahi)
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 }, // brute-force counter
    isVerified: { type: Boolean, default: false },

    // Email verification + password reset (hashed tokens)
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    resetToken: { type: String },
    resetExpiry: { type: Date },

    // OAuth (Google)
    googleId: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Password ko save karne se pehle hash karein
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match karne ka method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Frontend ko bhejne ke liye safe user object (password/otp ke bina)
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.fullName,
    email: this.email,
    phone: this.phone,
    city: this.city,
    className: this.classLevel,
    board: this.board,
    plan: this.plan,
    planExpiresAt: this.planExpiresAt,
    xp: this.xp,
    level: this.level,
    streak: this.streak,
    dailyUsed: this.dailyQuestionsUsed,
    lastUsedDate: this.lastQuestionDate,
    createdAt: this.createdAt,
    isVerified: this.isVerified,
  };
};

export default mongoose.model("User", userSchema);
