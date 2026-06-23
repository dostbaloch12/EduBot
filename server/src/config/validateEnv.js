// ============================================
// ENV VALIDATOR — server start se pehle secrets check
// Weak/missing JWT secret par server start hi nahi hoga
// ============================================

export const validateEnv = () => {
  const errors = [];

  // JWT_SECRET zaroori hai aur kam az kam 32 characters
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    errors.push("JWT_SECRET set nahi hai (.env mein daalें)");
  } else if (secret.length < 32) {
    errors.push("JWT_SECRET kamzor hai — kam az kam 32 characters ka strong random string daalें");
  } else if (
    ["change_this", "secret", "fallback_secret", "123456", "your_secret"].some((weak) =>
      secret.toLowerCase().includes(weak)
    )
  ) {
    errors.push("JWT_SECRET default/guessable hai — koi unique random string daalें");
  }

  // MongoDB URI zaroori
  if (!process.env.MONGO_URI) {
    errors.push("MONGO_URI set nahi hai");
  }

  if (errors.length > 0) {
    console.error("\n❌ SECURITY CONFIG ERRORS:");
    errors.forEach((e) => console.error("   - " + e));
    console.error("\n💡 Tip: strong secret banane ke liye chalayें:");
    console.error('   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
    process.exit(1); // server start NAHI hoga
  }

  console.log("✅ Environment security check passed");
};
