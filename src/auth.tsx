import React, { createContext, useContext, useState, useEffect } from "react";
import type { PublicUser } from "./backend/types";
import { http, tokenStore } from "./backend/http";

interface LoginResult {
  ok: boolean;
  error?: string;
  otpRequired?: boolean;
  maskedPhone?: string;
  devOtp?: string; // demo ke liye
}

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyLoginOtp: (email: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  resendLoginOtp: (email: string) => Promise<{ ok: boolean; devOtp?: string; maskedPhone?: string }>;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ ok: boolean; error?: string; phoneRequired?: boolean }>;
  sendPhoneOtp: (phone: string) => Promise<{ ok: boolean; error?: string; maskedPhone?: string; devOtp?: string }>;
  confirmPhone: (otp: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ ok: boolean; error?: string; devOtp?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  classLevel: string;
  board: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // App load par token check karein — agar valid hai to user fetch karein
  useEffect(() => {
    const load = async () => {
      const token = tokenStore.get();
      if (token) {
        const res = await http.get<{ user: PublicUser }>("/auth/me");
        if (res.success && res.data) {
          setUser(res.data.user);
        } else {
          tokenStore.clear();
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    const res = await http.post<{
      user?: PublicUser;
      token?: string;
      otpRequired?: boolean;
      maskedPhone?: string;
      devOtp?: string;
    }>("/auth/login", { email, password }, false);
    setLoading(false);

    if (!res.success || !res.data) {
      return { ok: false, error: res.error || "Login failed" };
    }

    // 10 din trial khatam → OTP required (number par)
    if (res.data.otpRequired) {
      return {
        ok: false,
        otpRequired: true,
        maskedPhone: res.data.maskedPhone,
        devOtp: res.data.devOtp,
      };
    }

    // Normal login
    if (res.data.user && res.data.token) {
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: "Login failed" };
  };

  // OTP verify karke login complete karें
  const verifyLoginOtp = async (email: string, otp: string) => {
    setLoading(true);
    const res = await http.post<{ user: PublicUser; token: string }>(
      "/auth/login-otp",
      { email, otp },
      false
    );
    setLoading(false);
    if (res.success && res.data) {
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error || "OTP verification failed" };
  };

  // OTP dobara bhejें
  const forgotPassword = async (email: string) => {
    const res = await http.post<{ message: string }>("/auth/forgot-password", { email }, false);
    return { ok: res.success, message: res.message };
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    const res = await http.post("/auth/reset-password", { email, token, newPassword }, false);
    return { ok: res.success, error: res.error };
  };

  const googleLogin = async (credential: string) => {
    setLoading(true);
    const res = await http.post<{ user?: PublicUser; token?: string; phoneRequired?: boolean; tempToken?: string }>(
      "/auth/google",
      { credential },
      false
    );
    setLoading(false);
    if (res.success && res.data) {
      // Phone verify zaroori → temp token rakhें, login complete na karें
      if (res.data.phoneRequired && res.data.tempToken) {
        tokenStore.set(res.data.tempToken);
        return { ok: false, phoneRequired: true };
      }
      if (res.data.user && res.data.token) {
        tokenStore.set(res.data.token);
        setUser(res.data.user);
        return { ok: true };
      }
    }
    return { ok: false, error: res.error || "Google login failed" };
  };

  // Phone OTP bhejें (Google/naye users)
  const sendPhoneOtp = async (phone: string) => {
    const res = await http.post<{ maskedPhone: string; devOtp?: string }>("/auth/send-phone-otp", { phone });
    return { ok: res.success, error: res.error, maskedPhone: res.data?.maskedPhone, devOtp: res.data?.devOtp };
  };

  // Phone OTP confirm → login complete
  const confirmPhone = async (otp: string) => {
    const res = await http.post<{ user: PublicUser; token: string }>("/auth/confirm-phone", { otp });
    if (res.success && res.data) {
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error || "Phone verification failed" };
  };

  const resendLoginOtp = async (email: string) => {
    const res = await http.post<{ devOtp?: string; maskedPhone?: string }>(
      "/auth/resend-otp",
      { email },
      false
    );
    if (res.success && res.data) {
      return { ok: true, devOtp: res.data.devOtp, maskedPhone: res.data.maskedPhone };
    }
    return { ok: false };
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    const res = await http.post<{ user: PublicUser; token: string; devOtp?: string }>(
      "/auth/signup",
      data,
      false
    );
    setLoading(false);
    if (res.success && res.data) {
      tokenStore.set(res.data.token);
      setUser(res.data.user);
      return { ok: true, devOtp: res.data.devOtp };
    }
    return { ok: false, error: res.error || "Signup failed" };
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const refresh = async () => {
    const res = await http.get<{ user: PublicUser }>("/auth/me");
    if (res.success && res.data) {
      setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLoginOtp, resendLoginOtp, forgotPassword, resetPassword, googleLogin, sendPhoneOtp, confirmPhone, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
