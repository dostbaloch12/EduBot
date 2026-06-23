# 🚀 EduBot — Sabse Aasan Setup (Shuru se Aakhir tak)

Yeh guide aap ko bilkul shuru se sikhati hai. Sab kuch urdu mein, asaan steps.

---

## ✅ ZAROORI: Pehle yeh install karें

1. **Node.js** → [nodejs.org](https://nodejs.org) → "LTS" download → install
2. **VS Code** → [code.visualstudio.com](https://code.visualstudio.com) → install

Check karें (VS Code terminal mein):
```bash
node -v
```
Version dikhe to ready hai ✅

---

## 📂 STEP 1: Project kholें

1. ZIP file extract karें
2. VS Code → File → Open Folder → wahi folder chunें

---

## 🎨 STEP 2: FRONTEND chalाo (Terminal 1)

VS Code mein: **Terminal → New Terminal**, phir:

```bash
npm install
npm run dev
```

➡️ `http://localhost:5173` par website khul jayegi! ✅

> **Sirf frontend chalाo to bhi website POORI kaam karegi** (demo mode).
> Login, quiz, AI tutor — sab! Data browser mein save hoga.

---

## 🔧 STEP 3: BACKEND chalाo (Terminal 2) — Optional

⚠️ Frontend band mat karें. Naya terminal kholें (terminal mein "+" button), phir:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```
*(Windows par `cp` na chale to: `copy .env.example .env`)*

### ✨ KHUSHKHABRI: Ab MongoDB ki ZAROORAT NAHI!

Maine backend aisa banaya hai ke:
- ✅ Agar MongoDB ho → woh use karega
- ✅ Agar MongoDB **na ho** → khud "in-memory database" chalाega (RAM mein)

**Matlab backend ab kabhi crash nahi hoga** — bina kuch install kiye chal jayega! 🎉

➡️ `🚀 EduBot Server running on http://localhost:5000` dikhega ✅

> ⚠️ **Note:** In-memory database mein data **temporary** hota hai
> (server band karne par mit jata hai). Permanent data ke liye → STEP 5

---

## 🔗 STEP 4: Frontend + Backend CONNECT karें

Project ke **main folder** (root) mein nayi file banao: **`.env`**

1. VS Code left side → root par right-click → **New File**
2. Naam: `.env`
3. Andar likhें:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Save (Ctrl+S)
5. Frontend terminal band karें (Ctrl+C) → dobara `npm run dev`

✅ **Ab dono connected hain!**

---

## 💾 STEP 5: Permanent Data (MongoDB Atlas — FREE) — Baad mein

Jab aap chahein ke data permanent save ho (kabhi na mite):

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → free account
2. **"Go to Advanced Configuration"** → **M0 (FREE)** chunें
   ⚠️ M30/M10/Flex MAT chuno (woh paid hain!)
3. Username/password banao
4. Network Access → "Allow from Anywhere"
5. Connect → Drivers → string copy karें
6. `server/.env` mein daalो:
   ```
   MONGO_URI=mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/edubot
   ```
7. Backend restart: `npm run dev`

✅ Ab data permanent save hoga!

---

## 🤖 STEP 6: Real AI, SMS, Payment — Baad mein

`server/SETUP-REAL.md` file mein detail hai. Khulasa:

| Cheez | Kahan se | Kharcha |
|---|---|---|
| Real AI | Gemini ([aistudio.google.com](https://aistudio.google.com/app/apikey)) | **FREE** ⭐ |
| Real SMS | Twilio | Paid |
| Real Payment | JazzCash merchant | Business account |

Sab keys `server/.env` mein daalो → automatically chालू ho jayengi.

---

## 🎯 SABSE ASAAN (sirf yeh karें abhi):

```bash
# Terminal 1
npm install
npm run dev
```

Browser → `http://localhost:5173` → **Website ready!** 🎉

Baqi cheezein (backend, MongoDB, AI) baad mein zaroorat ke mutabiq.

---

## ❓ Masail aur Hal

| Problem | Hal |
|---|---|
| `npm not found` | Node.js install karें |
| Backend crash (MongoDB error) | Ab nahi hoga! Naya code in-memory DB use karta hai |
| Website blank | Browser refresh (F5) |
| `cp` na chale | `copy .env.example .env` (Windows) |
| Port busy | Dusra terminal band karें |
