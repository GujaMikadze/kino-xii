import type { Movie } from "../api/types";

export const metaLine = (m: Movie) =>
  [m.genres[0]?.name, `${m.runtimeMinutes} min`].filter(Boolean).join(" · ");

const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

export const premiereLabel = (date: string) =>
  `PREMIERE · WEEK OF ${fmt(date, { day: "numeric", month: "short" })}`.toUpperCase();

export const inCinemasLabel = (date: string) =>
  `IN CINEMAS ${fmt(date, { day: "numeric", month: "long" })}`.toUpperCase();