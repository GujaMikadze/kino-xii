import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, SeatMap } from "../api/types";

export function useSeatMap(sessionId: number) {
  return useQuery({
    queryKey: ["seats", sessionId],
    queryFn: async () =>
      (await api<ApiResponse<SeatMap>>(`/sessions/${sessionId}/seats`)).data,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}