import { useDragScroll } from "../hooks/useDragScroll";
import type { Day } from "../lib/dates";

type Props = {
  days: Day[];
  value: string;
  onChange: (iso: string) => void;
  disabledDates?: string[];
  customClassName?: string;
};

export default function DateStrip({ days, value, onChange, disabledDates = [], customClassName }: Props) {
  const dragRef = useDragScroll();

  return (
    <div
      ref={dragRef}
      role="radiogroup"
      aria-label="Date"
      className="drag-scroll no-scrollbar flex gap-1.5 overflow-x-auto"
    >
      {days.map((d) => {
        const selected = d.iso === value;
        const disabled = disabledDates.includes(d.iso);

        return (
          <button
            key={d.iso}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(d.iso)}
            className={`${customClassName || ""} flex h-13.5 w-9.25 shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-xs transition ${
              selected
                ? "bg-accent text-white"
                : "bg-[#2A2C3D] text-white hover:bg-accent cursor-pointer"
            } ${disabled ? "cursor-not-allowed opacity-30 hover:bg-white/5" : ""}`}
          >
            <span className="text-xs font-semibold">{d.weekday}</span>
            <span className={`leading-none font-semibold ${customClassName ? "text-lg" : "text-xs"}`}>{d.day}</span>
          </button>
        );
      })}
    </div>
  );
}