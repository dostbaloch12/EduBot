// ============================================
// EDUBOT API — Real Backend (Node + Express + MongoDB)
// Yeh layer HTTP requests bhejti hai real backend ko.
// Components ka interface same rakha gaya hai.
// ============================================

import { http } from "./http";
import type { PublicUser, Assignment, SubjectProgress, QuizResult } from "./types";

export const backend = {
  TRIAL_TOTAL_LIMIT: 35,

  // ---- Plan & quota helpers (local calculation user object se) ----
  trialInfo(user: PublicUser) {
    if (user.plan !== "free") return { active: false, daysLeft: 0 };
    const created = new Date(user.createdAt).getTime();
    const diffDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - diffDays);
    return { active: daysLeft > 0, daysLeft };
  },

  planInfo(user: PublicUser) {
    if (user.plan === "free") return { active: false, daysLeft: 0 };
    if (!user.planExpiresAt) return { active: true, daysLeft: 30 };
    const diffDays = Math.max(
      0,
      Math.floor((new Date(user.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    return { active: diffDays > 0, daysLeft: diffDays };
  },

  dailyQuota(user: PublicUser) {
    const today = new Date().toISOString().split("T")[0];
    let used = user.dailyUsed;
    if (user.lastUsedDate !== today && user.plan !== "free") used = 0;

    if (user.plan === "free") {
      return { remaining: Math.max(0, this.TRIAL_TOTAL_LIMIT - used), limit: this.TRIAL_TOTAL_LIMIT };
    } else if (user.plan === "basic") {
      return { remaining: Math.max(0, 100 - used), limit: 100 };
    } else {
      return { remaining: Math.max(0, 250 - used), limit: 250 };
    }
  },

  // ---- Assignments ----
  assignments: {
    async list(_userId: string): Promise<Assignment[]> {
      const res = await http.get<Assignment[]>("/assignments");
      return res.success && res.data ? res.data : [];
    },

    async submit(id: string): Promise<{ ok: boolean; data: { marks: number; obtainedMarks: number } }> {
      const res = await http.post<{ assignment: { marks: number; obtainedMarks: number } }>(
        `/assignments/${id}/submit`
      );
      if (res.success && res.data) {
        return { ok: true, data: { marks: res.data.assignment.marks, obtainedMarks: res.data.assignment.obtainedMarks } };
      }
      return { ok: false, data: { marks: 0, obtainedMarks: 0 } };
    },
  },

  // ---- Progress ----
  progress: {
    async list(_userId: string): Promise<SubjectProgress[]> {
      const res = await http.get<SubjectProgress[]>("/progress");
      return res.success && res.data ? res.data : [];
    },
  },

  // ---- Quizzes ----
  quizzes: {
    async results(_userId: string): Promise<QuizResult[]> {
      const res = await http.get<QuizResult[]>("/quiz/results");
      return res.success && res.data ? res.data : [];
    },

    async saveResult(
      _userId: string,
      data: { subject: string; score: number; total: number; xpEarned: number }
    ): Promise<void> {
      await http.post("/quiz/submit", {
        subject: data.subject,
        score: data.score,
        total: data.total,
      });
    },
  },

  // ---- Users ----
  users: {
    async getUser(_userId: string): Promise<PublicUser | null> {
      const res = await http.get<{ user: PublicUser }>("/auth/me");
      return res.success && res.data ? res.data.user : null;
    },

    async upgradePlan(_userId: string, plan: "basic" | "premium"): Promise<PublicUser | null> {
      const res = await http.post<{ user: PublicUser }>("/payments/checkout", { plan });
      return res.success && res.data ? res.data.user : null;
    },

    async checkAndDecrementQuota(_userId: string): Promise<{ allowed: boolean; reason?: string; reply?: string }> {
      // Yeh AI tutor ke saath integrate hai — TutorChat iss ko call karta hai
      // Lekin actual sawal chat/ask endpoint se jaata hai. Yahan sirf allow check.
      return { allowed: true };
    },
  },

  // ---- AI Tutor Chat ----
  chat: {
    async ask(message: string, subject?: string): Promise<{ ok: boolean; reply?: string; remaining?: number; error?: string }> {
      const res = await http.post<{ reply: string; remaining: number }>("/chat/ask", { message, subject });
      if (res.success && res.data) {
        return { ok: true, reply: res.data.reply, remaining: res.data.remaining };
      }
      return { ok: false, error: res.error || "Failed to get AI response" };
    },

    // Q&A answer ko AI se grade karें
    async grade(
      question: string,
      answer: string,
      idealAnswer: string
    ): Promise<{ ok: boolean; score?: number; strengths?: string; improvement?: string; error?: string }> {
      const res = await http.post<{ score: number; strengths: string; improvement: string }>(
        "/chat/grade",
        { question, answer, idealAnswer }
      );
      if (res.success && res.data) {
        return { ok: true, ...res.data };
      }
      return { ok: false, error: res.error || "Grading failed" };
    },

    // Chapter-wise MCQ quiz AI se banवाo
    async generateQuiz(subject: string, chapter: string, classLevel: string) {
      const res = await http.post<{ quiz: any[] }>("/chat/generate-quiz", { subject, chapter, classLevel });
      return res.success && res.data?.quiz ? res.data.quiz : null;
    },

    // Chapter-wise descriptive questions AI se banवाo
    async generateQuestions(subject: string, chapter: string, classLevel: string) {
      const res = await http.post<{ questions: any[] }>("/chat/generate-questions", { subject, chapter, classLevel });
      return res.success && res.data?.questions ? res.data.questions : null;
    },
  },
};
