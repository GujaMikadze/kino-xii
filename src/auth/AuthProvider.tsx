import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { ApiResponse, User } from "../api/types";
import { AuthContext, type AuthModalMode } from "./context";

type AuthPayload = ApiResponse<{ user: User; token: string }>;

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isBooting, setIsBooting] = useState(() => !!getToken());
  const [authModal, setAuthModal] = useState<AuthModalMode | null>(null);
  const pending = useRef<((ok: boolean) => void) | null>(null);

  // ხურავს მოდალს და ასრულებს "შევიდა თუ არა" დაპირებას
  const settle = useCallback((ok: boolean) => {
    pending.current?.(ok);
    pending.current = null;
    setAuthModal(null);
  }, []);

  const openAuthModal = useCallback((mode: AuthModalMode = "login") => {
    pending.current?.(false);
    setAuthModal(mode);
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
    });
  }, []);

  const closeAuthModal = useCallback(() => settle(false), [settle]);

  // 401-ზე api client გახსნის login მოდალს და შესვლის შემდეგ მოთხოვნას გაიმეორებს
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      return openAuthModal("login");
    });
  }, [openAuthModal]);

  // გვერდის გახსნისას შენახული ტოკენით სესიის აღდგენა
  useEffect(() => {
    if (!getToken()) return;
    api<ApiResponse<User>>("/me", { skipAuthRetry: true })
      .then((res) => setUser(res.data))
      .catch(() => setToken(null))
      .finally(() => setIsBooting(false));
  }, []);

  const finishAuth = (payload: AuthPayload) => {
    setToken(payload.data.token);
    setUser(payload.data.user);
    queryClient.invalidateQueries();
    settle(true);
  };

  const login = async (email: string, password: string) => {
    finishAuth(
      await api<AuthPayload>("/login", {
        method: "POST",
        body: { email, password },
        skipAuthRetry: true,
      }),
    );
  };

  const register = async (form: FormData) => {
    finishAuth(
      await api<AuthPayload>("/register", {
        method: "POST",
        body: form,
        skipAuthRetry: true,
      }),
    );
  };

  const logout = async () => {
    try {
      await api("/logout", { method: "POST", skipAuthRetry: true });
    } catch {
      // ტოკენს მაინც ვშლით
    }
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isBooting,
        authModal,
        openAuthModal,
        switchAuthModal: setAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}