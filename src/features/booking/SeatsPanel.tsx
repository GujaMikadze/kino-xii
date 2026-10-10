import { Loader2, X } from "lucide-react";
import type { TicketType, TicketTypeSlug } from "../../api/types";
import { money } from "../../lib/money";

export type SelectedRow = {
  seatId: number;
  code: string;
  ticketType: TicketTypeSlug;
  price: number;
};

type Props = {
  rows: SelectedRow[];
  allowedTypes: TicketType[];
  max: number;
  subtotal: number;
  alerts: string[];
  pending: boolean;
  canContinue: boolean;
  onType: (seatId: number, slug: TicketTypeSlug) => void;
  onRemove: (seatId: number) => void;
  onNext: () => void;
};

export default function SeatsPanel({
  rows,
  allowedTypes,
  max,
  subtotal,
  alerts,
  pending,
  canContinue,
  onType,
  onRemove,
  onNext,
}: Props) {
  const disabled = !canContinue || pending;

  return (
    <div className="flex min-h-110 flex-col">
      <h3 className="text-sm font-bold">Your seats · Max {max}</h3>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="text-xs text-[#A9A9A9]">
            Pick up to {max} seats from the map. Each seat can carry its own ticket type.
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.seatId} className="rounded-2xl bg-[#1E2031] p-3.75">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9A9A9] flex gap-3">
                  Seat <strong className="text-white">{r.code}</strong>
                </span>
                <span className="flex items-center gap-4 font-semibold">
                  {money(r.price)}
                  <button
                    type="button"
                    aria-label={`Remove seat ${r.code}`}
                    onClick={() => onRemove(r.seatId)}
                    className="rounded-full p-0.5 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#2A2C3D] flex gap-1.5">
                {allowedTypes.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    aria-pressed={r.ticketType === t.slug}
                    onClick={() => onType(r.seatId, t.slug)}
                    className={`flex-1 rounded-full px-2 py-1.5 text-xs font-regular transition ${
                      r.ticketType === t.slug
                        ? "bg-accent text-white"
                        : "bg-[#2A2C3D] text-white hover:bg-accent cursor-pointer"
                    }`}
                  >
                    {t.name} {Math.round(t.priceRatio * 100)}%
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div role="alert" className="mt-3 space-y-1 text-xs text-warning">
          {alerts.map((a) => (
            <p key={a}>{a}</p>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-white">SUBTOTAL</span>
        <span className="text-2xl font-extrabold">{money(subtotal)}</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onNext}
        className={`mt-3 flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
          disabled
            ? "cursor-not-allowed bg-[#4a4c63] text-white/60"
            : "bg-accent text-white hover:bg-accent-hover cursor-pointer"
        } ${pending ? "cursor-wait" : ""}`}
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Next: Checkout
      </button>
    </div>
  );
}