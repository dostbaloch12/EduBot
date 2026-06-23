# 🔐 EduBot Security Guide

Yeh document har attack ke against EduBot ki protection bayan karta hai.

---

## ✅ Protections Implemented

| # | Attack | Protection | File |
|---|--------|-----------|------|
| 1 | **SQL Injection** | MongoDB use hota hai (SQL nahi) + Mongoose schema typing | models/ |
| 2 | **NoSQL Injection** | `express-mongo-sanitize` ($gt, $where strip) + input validation (string type check) | server.js, middleware/validate.js |
| 3 | **Secret Key Leak** | `validateEnv.js` weak/default JWT secret par server start hi nahi hone deta. Fallback secret hata diya. `devOtp` production mein hidden. | config/validateEnv.js, utils/otp.js |
| 4 | **Brute Force / LPDoS** | Login: 8 attempts / 15 min. OTP: 5 attempts / 10 min + per-user OTP attempt counter (5 ke baad block) | server.js, controllers/auth.controller.js |
| 5 | **DDoS / DoS** | Global rate-limit (200/15min) + body size limit (10kb) + per-route strict limits | server.js |
| 6 | **Replay Attack** | OTP sahi hote hi turant invalidate (dobara use nahi ho sakta). JWT short expiry + issuer/audience claims. | controllers/auth.controller.js, utils/generateToken.js |
| 7 | **Clipboard Attack** | OTP/password fields par `autoComplete="off"`. Frontend par sensitive data clipboard mein store nahi hota. | frontend |
| 8 | **XSS** | Helmet CSP headers + React JSX auto-escaping + httpOnly cookie option | server.js, auth.middleware.js |
| 9 | **Clickjacking** | Helmet `frameAncestors: 'none'` (X-Frame-Options) | server.js |
| 10 | **User Enumeration** | Login/OTP par generic error messages ("Invalid or expired") | controllers/auth.controller.js |
| 11 | **OTP DB Leak** | OTP SHA-256 hashed store hota hai (plain text nahi) | utils/otp.js |
| 12 | **Predictable OTP** | `crypto.randomInt` use hota hai (Math.random nahi — woh predictable hai) | utils/otp.js |
| 13 | **CORS abuse** | Strict origin whitelist (sirf apna frontend) | server.js |
| 14 | **HTTP Param Pollution** | `hpp` middleware | server.js |
| 15 | **Info Leak (errors)** | Production mein stack trace/internal errors hidden | server.js |
| 16 | **Password Theft** | bcrypt hashing (10 rounds), kabhi plain text store nahi | models/User.js |

---

## ⚠️ Production Deploy karne se PEHLE yeh ZAROOR karें

1. **`.env` set karें** — strong `JWT_SECRET` (32+ chars):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **`NODE_ENV=production`** set karें (errors + devOtp hide ho jate hain).
3. **HTTPS lagायें** — Let's Encrypt / Cloudflare / hosting ka SSL. (HTTP par data plain text jaata hai!)
4. **Real SMS gateway** lagायें OTP ke liye (Twilio / Pakistan local gateway). Abhi `// TODO` hai.
5. **MongoDB Atlas** par IP whitelist + strong DB password + network encryption.
6. **`npm audit fix`** chalायें regularly (vulnerable dependencies).
7. **Redis-backed rate limiting** lagायें agar multiple servers hon (`rate-limit-redis`).
8. **Backup** — MongoDB ka automated backup on karें.
9. **Frontend token** — abhi localStorage mein hai. Zyada secure ke liye httpOnly cookie use karें
   (backend `auth.middleware.js` already cookie support karta hai).

---

## 🧪 Test karne ke liye

```bash
# NoSQL injection test (block hona chahiye)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'
# → "Sahi email daalें" (validation block kar dega)

# Rate limit test (9th attempt par block)
for i in $(seq 1 10); do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong"}'; done
# → 9th par "Too many login attempts"
```
