import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { FilterOptions } from "../../api/types";
import DateStrip from "../../components/DateStrip";
import type { Day } from "../../lib/dates";
import { availableFormats, type Filters, type ListKey } from "./useSessionFilters";

// "Evening (after 18:00)" -> სახელი + მქრქალი მინიშნება
const splitLabel = (label: string) => {
  const m = label.match(/^(.*?)\s*\((.*)\)$/);
  return m ? { name: m[1], hint: m[2] } : { name: label, hint: undefined };
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#2A2C3D] py-6">
      <h3 className="mb-3 text-sm font-semibold tracking-wider text-[#A9A9A9]">{title}</h3>
      {children}
    </div>
  );
}

type RowProps = { label: string; hint?: string; checked: boolean; onChange: () => void };

function CheckboxRow({ label, hint, checked, onChange }: RowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-[#505261] text-transparent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/60">
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="font-semibold">{label}</span>
      {hint && <span className="text-xs text-[#A9A9A9]"><span className="mr-2 text-[#A9A9A9]">·</span>{ hint}</span>}
    </label>
  );
}

type Props = {
  options: FilterOptions;
  filters: Filters;
  days: Day[];
  activeCount: number;
  onToggle: (key: ListKey, slug: string) => void;
  onDate: (iso: string) => void;
  onClear: () => void;
};

export default function FilterPanel({
  options,
  filters,
  days,
  activeCount,
  onToggle,
  onDate,
  onClear,
}: Props) {
  const formats = availableFormats(options, filters.venues);

  return (
    <div>
      <h2 className="mb-6 text-[1.125rem] font-extrabold">Filters</h2>

      <Section title="VENUE">
        {options.venues.map((v) => (
          <CheckboxRow
            key={v.id}
            label={v.name}
            hint={v.city}
            checked={filters.venues.includes(v.slug)}
            onChange={() => onToggle("venues", v.slug)}
          />
        ))}
      </Section>

      <Section title="DATE">
        <DateStrip days={days} value={filters.date} onChange={onDate} />
      </Section>

      <Section title="FORMAT">
        {formats.map((f) => (
          <CheckboxRow
            key={f.id}
            label={f.name}
            checked={filters.formats.includes(f.slug)}
            onChange={() => onToggle("formats", f.slug)}
          />
        ))}
      </Section>

      <Section title="LANGUAGE">
        {options.languages.map((l) => (
          <CheckboxRow
            key={l.id}
            label={l.name}
            checked={filters.languages.includes(l.slug)}
            onChange={() => onToggle("languages", l.slug)}
          />
        ))}
      </Section>

      <Section title="TIME OF DAY">
        {options.timeBands.map((b) => {
          const { name, hint } = splitLabel(b.label);
          return (
            <CheckboxRow
              key={b.id}
              label={name}
              hint={hint}
              checked={filters.bands.includes(b.id)}
              onChange={() => onToggle("bands", b.id)}
            />
          );
        })}
      </Section>

      <div className="pt-5 text-center">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="mb-3 h-10 w-full rounded-full border border-white/20 text-xs font-bold hover:bg-white/10"
          >
            Clear All Filters
          </button>
        )}
        <p className="text-xs text-white/50" aria-live="polite">
          {activeCount} {activeCount === 1 ? "filter" : "filters"} active
        </p>
      </div>
    </div>
  );
}