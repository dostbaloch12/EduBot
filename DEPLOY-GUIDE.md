# 🚀 EduBot — LIVE Karne ki Complete Guide (Frontend + Backend + AI)

Client ko REAL AI aur data dikhane ke liye. Sab kuch asaan steps mein.

```
Frontend → Vercel        (website)
Backend  → Railway       (server + AI)
Database → MongoDB Atlas (real data)
```

---

# 📦 PART 0: Pehle 3 cheezein taiyar karें

## A. MongoDB Atlas (FREE — permanent data)
1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → free account
2. "Build a Database" → **M0 (FREE)** chunें (M30/M10 NAHI!)
3. Username + password banao (yaad rakhो!)
4. "Network Access" → "Allow from Anywhere" (0.0.0.0/0)
5. "Connect" → "Drivers" → connection string copy karें:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/edubot
   ```

## B. Gemini API Key (FREE — real AI)
1. [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. "Create API Key" → copy karें (AIzaSy...)

## C. GitHub par code daalो
```bash
# Root folder mein (VS Code terminal):
git init
git add .
git commit -m "EduBot ready"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/edubot.git
git push -u origin main
```

---

# 🖥️ PART 1: BACKEND ko Railway par live karें

1. [railway.app](https://railway.app) → "Login with GitHub"
2. **"New Project"** → "Deploy from GitHub repo" → `edubot` chunें
3. Railway project khulega → **Settings** mein jao:
   - **Root Directory:** `server` likhें ⚠️ (ZAROORI!)
   - **Start Command:** `npm start`
4. **"Variables"** tab → yeh sab add karें:
   ```
   MONGO_URI = mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/edubot
   JWT_SECRET = koi_lamba_random_string_32_characters_se_zyada
   GEMINI_API_KEY = AIzaSy...your-key...
   NODE_ENV = production
   CLIENT_URL = https://temporary.vercel.app
   ```
   *(CLIENT_URL baad mein update karenge jab Vercel URL milega)*
5. Railway khud deploy karega → ek URL milega:
   ```
   https://edubot-backend-production.up.railway.app
   ```
   **Yeh URL copy karें!** (backend ka address)

✅ Test: us URL ko browser mein kholें → `{"success":true,"message":"EduBot API is running securely!"}` dikhega

---

# 🌐 PART 2: FRONTEND ko Vercel par live karें

1. [vercel.com](https://vercel.com) → "Sign up with GitHub"
2. **"Add New Project"** → `edubot` repository → "Import"
3. Settings (auto-detect honge, check karें):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `./` (root, server nahi)
4. **"Environment Variables"** expand karें → add karें:
   ```
   VITE_API_URL = https://edubot-backend-production.up.railway.app/api
   ```
   *(Part 1 mein jo Railway URL mila, uske aage `/api` lagao)*
   ```
   VITE_GA_ID = (optional - Google Analytics ke liye)
   ```
5. **"Deploy"** dabायें

⏳ 1-2 minute → Vercel ek link dega:
```
https://edubot-xyz.vercel.app
```

---

# 🔗 PART 3: Dono ko Connect karें (ZAROORI!)

Ab backend ko bata dें ke frontend kahan hai (warna CORS block karega):

1. **Railway** par wapas jao → Variables
2. `CLIENT_URL` update karें apne Vercel URL se:
   ```
   CLIENT_URL = https://edubot-xyz.vercel.app
   ```
3. Railway khud redeploy ho jayega

✅ **Bas! Ab dono connected hain aur real AI/data chal raha hai!**

---

# 🎉 PART 4: Client ko Link Bhejो!

```
https://edubot-xyz.vercel.app
```

Yeh link client ko bhej dें. Ab unhe dikhega:
- ✅ Real signup/login (data MongoDB mein save)
- ✅ Real AI Tutor (Gemini se asli jawab)
- ✅ Chapter-wise AI quiz
- ✅ Sab features live!

---

## 📋 Checklist

- [ ] MongoDB Atlas — connection string mila
- [ ] Gemini API key mili
- [ ] Code GitHub par push hua
- [ ] Railway par backend deploy (Root: server)
- [ ] Railway Variables daale (MONGO_URI, JWT_SECRET, GEMINI_API_KEY, NODE_ENV)
- [ ] Railway URL mila
- [ ] Vercel par frontend deploy
- [ ] Vercel mein VITE_API_URL daala (Railway URL + /api)
- [ ] Railway mein CLIENT_URL update kiya (Vercel URL)
- [ ] Client ko link bheja ✅

---

## ⚠️ Common Masail aur Hal

| Problem | Hal |
|---|---|
| Login/AI kaam nahi karta | VITE_API_URL sahi hai? (Railway URL + /api) |
| CORS error | Railway mein CLIENT_URL = Vercel URL hai? |
| Backend crash | Railway Variables mein JWT_SECRET + MONGO_URI hai? |
| AI demo jawab deta hai | GEMINI_API_KEY Railway mein daali? |
| "Site can't be reached" | Vercel/Railway deploy complete hua? |

---

## 💰 Kharcha:

| Service | Cost |
|---|---|
| Vercel | **FREE** |
| Railway | **FREE** ($5 credit/mahina) |
| MongoDB Atlas | **FREE** (M0) |
| Gemini AI | **FREE** (1500/din) |

**Sab muft! Client ko professional live app dikha sakte hain.** 🎉
