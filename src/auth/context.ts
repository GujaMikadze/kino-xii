import { createContext } from "react";
import type { User } from "../api/types";

export type AuthModalMode = "login" | "register";

export type AuthContextValue = {
  user: User | null;
  isBooting: boolean;
  authModal: AuthModalMode | null;
  openAuthModal: (mode?: AuthModalMode) => Promise<boolean>;
  switchAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (form: FormData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);