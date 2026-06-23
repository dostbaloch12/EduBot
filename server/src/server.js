import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();

// ✅ Server start hone se pehle zaroori env variables check karें (secret leak/weak secret se bachao)
validateEnv();

// Database connect karें
connectDB();

const app = express();

// Trust proxy (rate-limit ke liye sahi IP milta hai jab Nginx/Heroku ke peeche ho)
app.set("trust proxy", 1);

// ---------- 1. SECURITY HEADERS (Helmet) ----------
// XSS, clickjacking, MIME-sniffing, HSTS — 15 security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"], // clickjacking se bachao
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "no-referrer" },
  })
);

// ---------- 2. STRICT CORS (sirf apne frontend ko allow) ----------
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Server-to-server / mobile apps (no origin) allow, baqi whitelist check
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS: Origin allowed nahi hai"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- 3. BODY PARSING (size limit — DoS se bachao) ----------
app.use(express.json({ limit: "10kb" })); // bara payload reject (memory DoS)
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ---------- 4. NoSQL INJECTION protection ----------
// $gt, $where, $ne jaise operators ko user input se hata deta hai
app.use(mongoSanitize());

// ---------- 5. HTTP Parameter Pollution (HPP) protection ----------
app.use(hpp());

// ---------- 6. RATE LIMITING ----------
// General API limit (DDoS / abuse se bachao)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Bohat zyada requests. Thori der baad koshish karें." },
});
app.use("/api", apiLimiter);

// Strict limit AUTH par (Brute-force / LPDoS / login spam se bachao)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8, // 15 min mein sirf 8 login/signup attempts
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // kamyab login count nahi hota
  message: { success: false, error: "Bohat zyada login attempts. 15 minute baad koshish karें." },
});

// OTP par aur bhi strict (OTP spam/brute se bachao)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Bohat zyada OTP attempts. Thori der intzaar karें." },
});

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.json({ success: true, message: "🕌 EduBot API is running securely!" });
});

// Auth routes par strict limiters lagao
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/login-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ---------- Global Error Handler (stack trace leak nahi hota) ----------
app.use((err, req, res, next) => {
  // CORS error
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }
  // Production mein internal error details chupayें (info leak se bachao)
  const isDev = process.env.NODE_ENV !== "production";
  console.error("🔥 Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduBot Server running securely on http://localhost:${PORT}`);
});
