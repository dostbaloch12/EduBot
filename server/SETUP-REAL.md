# 🚀 EduBot — Sab Cheezein REAL Karne ki Guide

Yeh guide aap ko batati hai ke **data save, real OTP SMS, aur real payment**
kaise chालू karें. Har step asaan urdu mein.

---

## ⚙️ Pehle: Backend chalाo

```bash
cd server
npm install
cp .env.example .env    # phir .env edit karें (neeche steps)
npm run dev
```

---

## 1️⃣ DATA SAVE (Database) — FREE ✅

**Kya:** Users, quiz, payments — sab permanently save honge (kabhi gaayab nahi).

**Kaise:**
1. [mongodb.com/atlas](https://www.mongodb.com/atlas) par jao → free account banao
2. "Create Cluster" (FREE M0 chuno)
3. Database user banao (username + password)
4. "Connect" → "Drivers" → connection string copy karो
5. `.env` mein daalो:
   ```
   MONGO_URI=mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/edubot
   ```
6. Network Access → "Allow from anywhere" (0.0.0.0/0)

✅ **Bas! Ab data permanently save hoga.**

---

## 2️⃣ REAL OTP SMS (Twilio) 💰

**Kya:** OTP asli SMS ban kar student ke phone par jayega.

**Kaise:**
1. [twilio.com](https://www.twilio.com/try-twilio) par account banao (free trial credit milta hai)
2. Console → **Verify** → "Create Service" → naam "EduBot"
3. 3 cheezें copy karो:
   - Account SID (console par)
   - Auth Token (console par)
   - Verify Service SID (Verify service page par, "VA..." se shuru)
4. `.env` mein daalो:
   ```
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_VERIFY_SID=VAxxxx
   ```

✅ **Ab login par asli SMS jayega!**

> 💡 **Note:** Twilio free trial mein sirf "verified" numbers par SMS jaata hai.
> Production ke liye paid plan + Pakistan number approval chahiye.
> **Sasta option:** Pakistani SMS gateways (Veevotech, BulkSMS Pakistan) bhi hain.

---

## 3️⃣ REAL PAYMENT (JazzCash / EasyPaisa) 📋

**Kya:** Students ke asli paise aap ke account mein aayenge.

**Kaise (JazzCash):**
1. JazzCash **Business/Merchant account** banao
   (CNIC + business detail chahiye — [jazzcash.com.pk](https://www.jazzcash.com.pk/corporate/digital-payment-solution/))
2. Merchant portal se 3 cheezें milengi:
   - Merchant ID
   - Password
   - Integrity Salt
3. `.env` mein daalो:
   ```
   JAZZCASH_MERCHANT_ID=xxxx
   JAZZCASH_PASSWORD=xxxx
   JAZZCASH_SALT=xxxx
   JAZZCASH_RETURN_URL=https://aapki-website.com/api/payments/callback
   ```
4. Pehle **sandbox** (testing) par check karो, phir live URL par switch karो

✅ **Ab asli paise aayenge!**

> 💡 EasyPaisa ke liye bhi merchant account chahiye (similar process).

---

## 4️⃣ REAL AI (AI Tutor + Q&A Grading) 🤖

**Kya:** AI Tutor har sawal ka asli jawab dega (sirf 4 ratte hue nahi).
Q&A practice mein student ke jawab ko asli AI grade karega.

**Kaise (Google Gemini — FREE, sabse asaan):**
1. [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) par jao
2. Google account se login → "Create API Key" dabाo
3. Key copy karो
4. `.env` mein daalो:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```

✅ **Bas! Ab AI Tutor asli jawab dega — 1500 sawal/din MUFT!**

> 💡 **Gemini free hai** (credit card bhi nahi chahiye). 1500 requests/din.
> Agar OpenAI chahiye to `OPENAI_API_KEY` daalो (par $5 deposit chahiye).

---

## ✅ Test karne ke liye

```bash
npm run dev
```
Console par dekho:
- `✅ MongoDB Connected` → data save chालू
- `✅ Twilio SMS service active` → real SMS chालू
- (payment automatically detect ho jata hai)

Agar koi key na ho → woh feature "dev/simulated mode" mein chalega
(testing theek hai, par real users ke liye keys daalो).

---

## 🌐 Website Live Karna (Deploy)

1. **Frontend** → Vercel/Netlify (free):
   - GitHub par code push karो
   - Vercel par import karो → auto deploy
   - Environment variable: `VITE_API_URL=https://aapka-backend.com/api`

2. **Backend** → Railway / Render / DigitalOcean:
   - GitHub se deploy
   - `.env` ki saari values wahan daalो
   - HTTPS automatically milta hai ✅

---

## 📋 Quick Checklist

- [ ] MongoDB Atlas account + `MONGO_URI`
- [ ] Strong `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] Twilio account + 3 keys (real SMS)
- [ ] JazzCash merchant + 3 keys (real payment)
- [ ] Gemini API key (real AI) — FREE
- [ ] Frontend Vercel par deploy
- [ ] Backend Railway/Render par deploy
- [ ] HTTPS on dono par
```
