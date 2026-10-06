import { useSyncExternalStore } from "react";
import type { Movie } from "../api/types";

export type RecentMovie = {
  id: number;
  slug: string;
  title: string;
  posterUrl: string | null;
  runtimeMinutes: number;
  ageCode: string;
  genre: string | null;
};

const KEY = "recently-viewed";
const MAX = 8;
const listeners = new Set<() => void>();

function read(): RecentMovie[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

let snapshot = read();

export function addRecentlyViewed(movie: Movie) {
  const item: RecentMovie = {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    posterUrl: movie.posterUrl,
    runtimeMinutes: movie.runtimeMinutes,
    ageCode: movie.ageRating.code,
    genre: movie.genres[0]?.name ?? null,
  };
  snapshot = [item, ...snapshot.filter((m) => m.id !== movie.id)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage მიუწვდომელია, სიას მხოლოდ მეხსიერებაში ვინახავთ
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const useRecentlyViewed = () =>
  useSyncExternalStore(subscribe, () => snapshot);