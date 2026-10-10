import type { Session } from "../../api/types";
import { formatDay, formatLong } from "../../lib/dates";

export const sessionSubtitle = (s: Session) =>
  `${s.venue.name} · Hall ${s.hall.name} · ${formatLong(s.date)} · ${s.time} · ${s.format.name} · ${s.language.name}`;

export const shortLine = (s: Session) =>
  `Hall ${s.hall.name} · ${formatDay(s.date)} · ${s.time}`;

// ["Adult","Adult","Child"] -> "2 × Adult, 1 × Child"
export function ticketSummary(names: string[]) {
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts].map(([n, c]) => `${c} × ${n}`).join(", ");
}