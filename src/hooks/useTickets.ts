import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, Order } from "../api/types";

export function useTickets(enabled: boolean) {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => (await api<ApiResponse<Order[]>>("/tickets")).data,
    enabled,
  });
}