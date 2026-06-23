import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protected routes ke liye - JWT token verify karta hai
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // httpOnly cookie support (XSS-safe option)
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Not authorized, no token" });
    }

    // Token verify (issuer/audience bhi match hona chahiye = tampering se bachao)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "edubot",
      audience: "edubot-app",
    });

    const user = await User.findById(decoded.id).select("-password -otpCode -otpExpiry");
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // expired / invalid / tampered token — sab ek hi generic message (info leak se bachao)
    return res.status(401).json({ success: false, error: "Not authorized, token failed" });
  }
};
