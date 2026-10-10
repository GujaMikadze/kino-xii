import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, MovieDetail, VenueSessions } from "../api/types";

export function useMovieDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["movie", slug],
    queryFn: async () => (await api<ApiResponse<MovieDetail>>(`/movies/${slug}`)).data,
    enabled: !!slug,
  });
}

export function useMovieSessions(slug: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["movie-sessions", slug, date],
    queryFn: async () =>
      (await api<ApiResponse<VenueSessions[]>>(`/movies/${slug}/sessions`, { params: { date } }))
        .data,
    enabled: !!slug && !!date,
  });
}