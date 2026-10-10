import type { ReactNode } from "react";
import type { Order } from "../../api/types";
import AgeBadge from "../../components/AgeBadge";
import { formatDay, refundDeadline } from "../../lib/dates";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wider text-[#A9A9A9] mb-2">{label}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}

type Props = { order: Order; onRefund: (order: Order) => void };

export default function TicketCard({ order, onRefund }: Props) {
  const { session } = order;
  const { movie } = session;

  // ღილაკს isRefundable მართავს, cutoff-ს კლიენტზე არ ვითვლით
  let caption: string;
  if (order.isRefundable) {
    caption = `Refundable until ${refundDeadline(session.date, session.time)}`;
  } else if (order.status === "refunded") {
    caption = "This order was refunded";
  } else if (order.isUpcoming) {
    caption = "Refund window has closed";
  } else {
    caption = "This session has ended";
  }

  return (
    <article className="flex overflow-hidden rounded-2xl bg-field/80">
      <div className="flex min-w-0 flex-1 gap-5 p-6 pl-7.5">
        <div className="h-full w-25 shrink-0 overflow-hidden rounded-[0.625rem] bg-bg">
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={movie.title} className="size-full object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-[1.25rem] font-extrabold">{movie.title}</h3>
            <AgeBadge code={movie.ageRating.code} className="px-2 py-0.75" />
            <span className="text-sm text-[#A9A9A9]">{movie.runtimeMinutes} min</span>
          </div>

          <dl className="mt-3 flex gap-10">
            <Field label="DATE">
              {formatDay(session.date)} · {session.time}
            </Field>
            <Field label="VENUE">
              {session.venue.name} · Hall {session.hall.name}
            </Field>
            <Field label="FORMAT">
              {session.format.name} · {session.language.name}
            </Field>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#A9A9A9]">SEATS</span>
            {order.tickets.map((t) => (
              <span
                key={t.id}
                className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-semibold"
              >
                {t.seatCode} · {t.ticketType.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex w-75 shrink-0 flex-col justify-between gap-2.5 py-5 px-6 dashed-left">
        <div className="mb-1">
          <p className="text-xs font-semibold tracking-wider text-[#A9A9A9]">ORDER</p>
          <p className="text-sm font-semibold">#{order.reference}</p>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-sm text-[#A9A9A9]">Total paid</span>
          <span className="text-2xl font-extrabold">₾{order.totalPrice}</span>
        </div>
        <button
          type="button"
          disabled={!order.isRefundable}
          onClick={() => onRefund(order)}
          className="h-9 rounded-full bg-white/10 text-xs font-bold hover:bg-white/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#A9A9A9] hover:backdrop-blur-3xl"
        >
          Refund
        </button>
        <p className="text-center text-xs text-[#A9A9A9]">{caption}</p>
      </aside>
    </article>
  );
}