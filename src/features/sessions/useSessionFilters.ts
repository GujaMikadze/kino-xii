import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { FilterOptions } from "../../api/types";
import { nextDays } from "../../lib/dates";

export const DEFAULT_SORT = "time_asc";
const DAYS_AHEAD = 7;

export type Filters = {
  venues: string[];
  formats: string[];
  languages: string[];
  bands: string[];
  date: string;
  sort: string;
  page: number;
};
export type ListKey = "venues" | "formats" | "languages" | "bands";

const URL_KEY: Record<ListKey, string> = {
  venues: "venue",
  formats: "format",
  languages: "language",
  bands: "time",
};
const LIST_KEYS = Object.keys(URL_KEY) as ListKey[];

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const only = (raw: string[], valid: string[]) => raw.filter((x) => valid.includes(x));

// არჩეული დარბაზების ფორმატები (არჩევანის გარეშე ყველა ფორმატი)
export function availableFormats(options: FilterOptions, venues: string[]) {
  if (venues.length === 0) return options.formats;
  const allowed = new Set(
    options.venues
      .filter((v) => venues.includes(v.slug))
      .flatMap((v) => v.formats.map((f) => f.slug)),
  );
  return options.formats.filter((f) => allowed.has(f.slug));
}

export function useSessionFilters(options: FilterOptions | undefined) {
  const [params, setParams] = useSearchParams();
  const days = useMemo(() => nextDays(DAYS_AHEAD), []);
  const today = days[0].iso;

  // არასწორი მნიშვნელობები URL-იდან იგნორირდება
  const filters = useMemo<Filters | null>(() => {
    if (!options) return null;

    const venues = only(csv(params.get("venue")), options.venues.map((v) => v.slug));
    const formats = only(
      csv(params.get("format")),
      availableFormats(options, venues).map((f) => f.slug),
    );
    const languages = only(csv(params.get("language")), options.languages.map((l) => l.slug));
    const bands = only(csv(params.get("time")), options.timeBands.map((b) => b.id));

    const rawDate = params.get("date");
    const date = days.find((d) => d.iso === rawDate)?.iso ?? today;

    const rawSort = params.get("sort");
    const sort = options.sorts.some((s) => s.id === rawSort) ? (rawSort as string) : DEFAULT_SORT;

    const n = Number(params.get("page"));
    const page = Number.isInteger(n) && n >= 1 ? n : 1;

    return { venues, formats, languages, bands, date, sort, page };
  }, [options, params, days, today]);

  // ნებისმიერი ცვლილება გვერდს 1-ზე აბრუნებს, თუ page პირდაპირ არ იცვლება
  const update = useCallback(
    (changes: Partial<Filters>, replace = false) => {
      const next = new URLSearchParams(params);

      for (const key of LIST_KEYS) {
        const v = changes[key];
        if (v === undefined) continue;
        if (v.length) next.set(URL_KEY[key], v.join(","));
        else next.delete(URL_KEY[key]);
      }

      if (changes.date !== undefined) {
        if (changes.date === today) next.delete("date");
        else next.set("date", changes.date);
      }
      if (changes.sort !== undefined) {
        if (changes.sort === DEFAULT_SORT) next.delete("sort");
        else next.set("sort", changes.sort);
      }

      if (changes.page !== undefined && changes.page > 1) next.set("page", String(changes.page));
      else next.delete("page");

      setParams(next, { replace }); // push: Back ღილაკი წინა ფილტრებს აბრუნებს
    },
    [params, setParams, today],
  );

  const toggle = (key: ListKey, slug: string) => {
    if (!filters || !options) return;
    const current = filters[key];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];

    if (key === "venues") {
      // დარბაზის შეცვლისას აღარ არსებული ფორმატები ამოვარდება
      const allowed = availableFormats(options, next).map((f) => f.slug);
      update({ venues: next, formats: filters.formats.filter((f) => allowed.includes(f)) });
    } else {
      update({ [key]: next } as Partial<Filters>);
    }
  };

  // თარიღი და სორტი რჩება
  const clearAll = () => update({ venues: [], formats: [], languages: [], bands: [] });

  const activeCount = filters
    ? filters.venues.length + filters.formats.length + filters.languages.length + filters.bands.length
    : 0;

  return { filters, days, update, toggle, clearAll, activeCount };
}