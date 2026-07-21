import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { loginUser, registerUser } from "../services/authService";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; company?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("veridian_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("veridian_token"));

  const persist = (accessToken: string, nextUser: User) => {
    localStorage.setItem("veridian_token", accessToken);
    localStorage.setItem("veridian_user", JSON.stringify(nextUser));
    setToken(accessToken);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    persist(data.access_token, data.user);
  };

  const register = async (payload: { email: string; password: string; full_name: string; company?: string }) => {
    const data = await registerUser(payload);
    persist(data.access_token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("veridian_token");
    localStorage.removeItem("veridian_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
