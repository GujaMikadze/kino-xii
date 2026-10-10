import { Check } from "lucide-react";
import type { Order } from "../../api/types";
import { money } from "../../lib/money";
import { shortLine, ticketSummary } from "./utils";

type Props = { order: Order; onTickets: () => void; onHome: () => void };

export default function Confirmation({ order, onTickets, onHome }: Props) {
  const { session } = order;

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-success text-bg">
        <Check size={28} strokeWidth={3} />
      </div>
      <h2 className="mt-5 text-xl font-extrabold">Booking confirmed!</h2>
      <p className="mt-2 max-w-[320px] text-xs text-white/60">
        Your tickets are ready. We've sent the confirmation to your email.
      </p>
      <span className="mt-4 rounded-full bg-field px-4 py-1.5 text-[11px] font-bold tracking-wider">
        ORDER #{order.reference}
      </span>

      <div className="mt-6 w-full rounded-xl bg-field/70 p-4 text-left text-xs">
        <div className="flex items-center gap-3">
          <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-bg">
            {session.movie.posterUrl && (
              <img src={session.movie.posterUrl} alt="" className="size-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-extrabold">{session.movie.title}</p>
            <p className="mt-0.5 text-white/50">{shortLine(session)}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 border-t border-white/10 pt-3">
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Seats</dt>
            <dd className="font-bold">{order.tickets.map((t) => t.seatCode).join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/50">Tickets</dt>
            <dd className="font-bold">
              {ticketSummary(order.tickets.map((t) => t.ticketType.name))}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
            <dt className="text-[10px] font-bold tracking-wider text-white/50">TOTAL PAID</dt>
            <dd className="text-lg font-extrabold">{money(order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onTickets}
          className="h-11 rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
        >
          View my tickets
        </button>
        <button
          type="button"
          onClick={onHome}
          className="h-11 rounded-full bg-white/15 px-6 text-xs font-bold hover:bg-white/25"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}