import { useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../api/types";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import { useTickets } from "../../hooks/useTickets";
import RefundDialog from "./RefundDialog";
import TicketCard from "./TicketCard";

export type TicketList = "upcoming" | "past";

type Props = { list: TicketList; onListChange: (list: TicketList) => void };

export default function MyTickets({ list, onListChange }: Props) {
  const { data, isLoading, isError, refetch } = useTickets(true);
  const [target, setTarget] = useState<Order | null>(null);

  const upcoming = data?.filter((o) => o.isUpcoming) ?? [];
  const past = data?.filter((o) => !o.isUpcoming) ?? [];
  const shown = list === "upcoming" ? upcoming : past;

  const tabs: { id: TicketList; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
  ];

  return (
    <div>
      <div className="mb-4 inline-flex rounded-xl bg-[#1E2031] p-1.25" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={list === t.id}
            onClick={() => onListChange(t.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.75 text-sm font-semibold ${
              list === t.id ? "bg-[#2A2C3D] text-white" : "text-white"
            }`}
          >
            {t.label}
            {data && <span className="text-sm text-white">{t.count}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-38 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Couldn't load your tickets" onRetry={refetch} />
      ) : shown.length === 0 ? (
        list === "upcoming" ? (
          <EmptyState
            title="No upcoming tickets"
            text="Book a session and your tickets will show up here."
          >
            <Link
              to="/sessions"
              className="inline-flex h-10 items-center rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
            >
              Browse sessions
            </Link>
          </EmptyState>
        ) : (
          <EmptyState
            title="No past tickets"
            text="Tickets for finished or refunded sessions will appear here."
          />
        )
      ) : (
        <div className="space-y-4">
          {shown.map((order) => (
            <TicketCard key={order.id} order={order} onRefund={setTarget} />
          ))}
        </div>
      )}

      {target && <RefundDialog order={target} onClose={() => setTarget(null)} />}
    </div>
  );
}