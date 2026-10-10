import { Fragment } from "react";
import type { Seat, SeatMap } from "../../api/types";

const seatBase =
  "flex aspect-square min-w-0 max-w-10 flex-1 items-center justify-center rounded-lg border text-xs font-bold transition";

type SeatButtonProps = {
  seat: Seat;
  selected: boolean;
  lost: boolean;
  onToggle: (seat: Seat) => void;
};

function SeatButton({ seat, selected, lost, onToggle }: SeatButtonProps) {
  if (seat.state === "unavailable") {
    return <span aria-hidden="true" className={`${seatBase} border-transparent`} />;
  }

  const state = lost ? "sold" : seat.state;
  const style =
  state === "sold"
    ? "seat-sold cursor-not-allowed"
    : state === "held"
      ? "seat-held cursor-not-allowed"
      : selected
        ? "border-[#070C1C] bg-[#EC3013] text-white cursor-pointer hover:bg-[#1E2031]"
        : "border-[#505261] bg-[#1E2031] hover:bg-[#EC3013] cursor-pointer";
  
  return (
    <button
      type="button"
      disabled={state !== "available"}
      aria-pressed={selected}
      aria-label={`Seat ${seat.code}, ${selected ? "selected" : state}`}
      onClick={() => onToggle(seat)}
      className={`${seatBase} ${style}`}
    >
      {seat.label}
    </button>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`size-5 rounded-md border ${className}`} />
      {label}
    </span>
  );
}

type Props = {
  map: SeatMap;
  selectedIds: Set<number>;
  lostCodes: Set<string>;
  onToggle: (seat: Seat) => void;
};

export default function HallMap({ map, selectedIds, lostCodes, onToggle }: Props) {
  return (
    <div>
      <div className="mb-6 rounded-bl-[20px] rounded-br-[20px] bg-white/10 py-1.5 text-center text-xs  font-semibold text-white">
        SCREEN
      </div>

      <div className="space-y-6">
        {map.sections.map((section) => {
          const first = section.rows[0]?.label;
          const last = section.rows[section.rows.length - 1]?.label;

          return (
            <div key={section.name}>
              <p className="mb-6 text-xs font-semibold text-[#A9A9A9]">
                {section.name.toUpperCase()} ·{" "}
                {first === last ? `ROW ${first}` : `ROWS ${first}-${last}`}
              </p>
              <div className="space-y-1.5">
                {section.rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-xs text-white font-semibold">
                      {row.label}
                    </span>
                    <div className="flex flex-1 items-center justify-center gap-1.5">
                      {row.seats.map((seat, i) => (
                        <Fragment key={seat.id}>
                          <SeatButton
                            seat={seat}
                            selected={selectedIds.has(seat.id)}
                            lost={lostCodes.has(seat.code)}
                            onToggle={onToggle}
                          />
                          {seat.aisleAfter && i < row.seats.length - 1 && (
                            <span aria-hidden="true" className="w-4 shrink-0" />
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3 text-xs text-white/70">
        <LegendItem className="border-white/25 bg-field" label="Available" />
        <LegendItem className="border-accent bg-accent" label="Selected" />
        <LegendItem className="seat-sold" label="Sold" />
        <LegendItem className="seat-held" label="Held by another user" />
      </div>
    </div>
  );
}