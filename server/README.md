# 🕌 EduBot Backend — Node.js + Express + MongoDB

Yeh EduBot ka **asal backend** hai. Real database (MongoDB), JWT authentication,
OTP verification, payments, quizzes, progress aur AI tutor — sab kuch.

---

## 📁 Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/                   # Database schemas
│   │   ├── User.js
│   │   ├── Progress.js
│   │   ├── QuizResult.js
│   │   ├── Assignment.js
│   │   ├── Payment.js
│   │   └── ChatMessage.js
│   ├── controllers/              # Business logic
│   │   ├── auth.controller.js
│   │   ├── quiz.controller.js
│   │   ├── progress.controller.js
│   │   ├── assignment.controller.js
│   │   ├── payment.controller.js
│   │   └── chat.controller.js
│   ├── routes/                   # API endpoints
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT protect
│   ├── utils/
│   │   └── generateToken.js
│   └── server.js                 # Entry point
├── .env.example
└── package.json
```

---

## 🚀 Setup (Step by Step)

### 1. MongoDB install karein
- **Local:** [MongoDB Community](https://www.mongodb.com/try/download/community) download karein
- **Ya Cloud (free):** [MongoDB Atlas](https://www.mongodb.com/atlas) par account banayein

### 2. Dependencies install karein
```bash
cd server
npm install
```

### 3. Environment file banayein
```bash
cp .env.example .env
```
Phir `.env` file kholें aur values bharें (khaas kar `MONGO_URI` aur `JWT_SECRET`).

### 4. Server chalayein
```bash
npm run dev      # development (auto-restart)
# ya
npm start        # production
```

Server chalega: **http://localhost:5000** 🚀

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Naya account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | OTP verify |
| GET | `/api/auth/me` | Current user (🔒 token) |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/results` | Saare results (🔒) |
| POST | `/api/quiz/submit` | Quiz save karein (🔒) |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Subjects progress (🔒) |
| PUT | `/api/progress` | Update progress (🔒) |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | Saare assignments (🔒) |
| POST | `/api/assignments/:id/submit` | Submit (🔒) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Plan upgrade (🔒) |
| GET | `/api/payments/history` | History (🔒) |

### AI Tutor Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/ask` | Sawal poochें (quota check) (🔒) |
| GET | `/api/chat/history` | Chat history (🔒) |

🔒 = JWT token chahiye. Header mein bhejें:
```
Authorization: Bearer <token>
```

---

## 🔗 Frontend se Connect karna

Frontend (React) ke root mein `.env` file banायें:
```
VITE_API_URL=http://localhost:5000/api
```

Phir `src/backend/api.ts` ko `localStorage` ki bajaye `fetch()` se backend
call karne ke liye update karें (instructions main chat mein de raha hun).

---

## ⚠️ Production Notes
- `JWT_SECRET` ko strong random string banayें
- Real SMS gateway lagायें OTP ke liye (Twilio / Pakistan local gateway)
- Real payment gateway lagायें (EasyPaisa / JazzCash merchant API)
- AI tutor ke liye OpenAI API key lagायें (`chat.controller.js` mein)
