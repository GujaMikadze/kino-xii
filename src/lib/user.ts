import type { User } from "../api/types";

export const displayName = (user: User) => user.fullName ?? user.username;

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}