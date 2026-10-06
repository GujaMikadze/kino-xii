import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, Movie, MovieWithSynopsis } from "../api/types";

export const useFeatured = () =>
  useQuery({
    queryKey: ["movies", "featured"],
    queryFn: async () =>
      (await api<ApiResponse<MovieWithSynopsis[]>>("/movies/featured")).data,
  });

export const useNowPlaying = () =>
  useQuery({
    queryKey: ["movies", "now-playing"],
    queryFn: async () =>
      (await api<ApiResponse<MovieWithSynopsis[]>>("/movies/now-playing")).data,
  });

export const useComingSoon = () =>
  useQuery({
    queryKey: ["movies", "coming-soon"],
    queryFn: async () =>
      (await api<ApiResponse<Movie[]>>("/movies/coming-soon")).data,
  });