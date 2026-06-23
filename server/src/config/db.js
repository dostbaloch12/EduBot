import mongoose from "mongoose";

// MongoDB se connection establish karta hai
// Agar real MongoDB na mile to apne aap "in-memory MongoDB" use karta hai
// (taake backend bina kisi install/account ke chal jaye — crash na ho)
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // 1. Pehle real MongoDB try karें (agar URI diya ho)
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`⚠️ Real MongoDB nahi mila (${error.message})`);
      console.warn("   → In-memory database par switch kar raha hun...");
    }
  } else {
    console.warn("⚠️ MONGO_URI .env mein nahi mila → In-memory database use kar raha hun");
  }

  // 2. Real MongoDB na mile to In-Memory MongoDB chalाo (RAM mein)
  try {
    // Dynamic import — sirf zaroorat par load ho
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    const memUri = mem.getUri();
    await mongoose.connect(memUri);
    console.log("✅ In-Memory MongoDB Connected (data temporary — server band hone par mit jayega)");
    console.log("   💡 Permanent data ke liye MongoDB Atlas ka MONGO_URI .env mein daalें");
  } catch (error) {
    console.error(`❌ Database connect nahi hua: ${error.message}`);
    console.error("   → Chalाo: cd server && npm install mongodb-memory-server");
    process.exit(1);
  }
};
