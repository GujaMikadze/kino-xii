import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { SessionsResponse } from "../../api/types";
import type { Filters } from "./useSessionFilters";

export function useSessions(filters: Filters | null) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => {
      const f = filters as Filters;
      return api<SessionsResponse>("/sessions", {
        params: {
          date: f.date,
          venues: f.venues,
          formats: f.formats,
          languages: f.languages,
          bands: f.bands,
          sort: f.sort,
          page: f.page,
        },
      });
    },
    enabled: filters !== null, // ჯერ filter-options უნდა ჩაიტვირთოს
  });
}