/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = "https://pursue-today-api.onrender.com/api"; 
// "https://pursue-today-api.onrender.com/api"
// "http://localhost:5000/api"

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include", 
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await request(`${API_BASE}/auth/me`);
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  async function signup(name, email, password) {
    return request(`${API_BASE}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async function login(email, password) {
    const data = await request(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data;
  }

  async function logout() {
    await request(`${API_BASE}/auth/logout`, { method: "POST" });
    setUser(null);
  }

  async function resendVerification(email) {
    return request(`${API_BASE}/auth/resend-verification`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async function verifyEmail(token) {
    return request(`${API_BASE}/auth/verify-email?token=${token}`);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, resendVerification, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { API_BASE };
