import jwt from "jsonwebtoken";

// User ke liye JWT token generate karें
// (issuer + audience claims = token misuse/replay se bachao)
export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET configured nahi hai");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "edubot",
    audience: "edubot-app",
  });
};
