import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, Movie } from "../api/types";

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: async () =>
      (await api<ApiResponse<Movie[]>>("/search", { params: { q } })).data,
    enabled: q.length > 0,
    staleTime: 60_000,
  });
}