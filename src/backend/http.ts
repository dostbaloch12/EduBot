// ============================================
// HTTP Client - Backend API se baat karne ke liye
// Agar real backend (localhost:5000) na mile to
// khud-ba-khud DEMO MODE (mock) par switch ho jata hai.
// ============================================

import { mockBackend } from "./mock";

// Backend ka URL (frontend .env mein VITE_API_URL set karein)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "edubot_token";

// Demo mode flag — true hone par mock backend use hoga
let useDemoMode = false;

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    mockBackend.setToken(token);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    mockBackend.setToken(null);
  },
};

// Page load par agar token hai to mock ko bata dein
mockBackend.setToken(tokenStore.get());

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Demo mode check ho gaya hai? (taake baar baar fetch fail na ho)
let demoChecked = false;

async function tryRealBackend<T>(
  endpoint: string,
  method: string,
  body: unknown,
  auth: boolean
): Promise<ApiResponse<T> | null> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    // AI jawab mein 5-10s lag sakte hain → 30s timeout
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null; // backend nahi mila
  }
}

async function request<T>(
  endpoint: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true } = options;

  // Agar pehle se demo mode hai to seedha mock use karein
  if (useDemoMode) {
    return mockBackend.handle<T>(endpoint, method, body);
  }

  // Real backend try karein
  const real = await tryRealBackend<T>(endpoint, method, body, auth);

  if (real !== null) {
    demoChecked = true;
    return real;
  }

  // Real backend nahi mila → DEMO MODE on karein
  if (!demoChecked) {
    console.warn("⚠️ Real backend (localhost:5000) nahi mila — DEMO MODE on. Data browser mein save hoga.");
  }
  useDemoMode = true;
  demoChecked = true;
  return mockBackend.handle<T>(endpoint, method, body);
}

export const http = {
  get: <T>(endpoint: string, auth = true) => request<T>(endpoint, { method: "GET", auth }),
  post: <T>(endpoint: string, body?: unknown, auth = true) =>
    request<T>(endpoint, { method: "POST", body, auth }),
  put: <T>(endpoint: string, body?: unknown, auth = true) =>
    request<T>(endpoint, { method: "PUT", body, auth }),
};

// Demo mode status check karne ke liye
export const isDemoMode = () => useDemoMode;
