import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, MovieDetail } from "../api/types";
import { addRecentlyViewed } from "../lib/recentlyViewed";

export default function MovieDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie", slug],
    queryFn: async () =>
      (await api<ApiResponse<MovieDetail>>(`/movies/${slug}`)).data,
    enabled: !!slug,
  });

  useEffect(() => {
    if (data) addRecentlyViewed(data);
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Movie not found</p>;

  return <h1 className="text-2xl font-bold">{data.title}</h1>;
}