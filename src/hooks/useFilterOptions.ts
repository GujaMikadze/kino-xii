import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, FilterOptions } from "../api/types";

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () =>
      (await api<ApiResponse<FilterOptions>>("/filter-options")).data,
    staleTime: Infinity,
  });
}