import { ChevronLeft, ChevronRight } from "lucide-react";

// 1 2 [3] 4 … 10, ცალი გამოტოვებული გვერდისთვის "…" არ ჩანს
function pageItems(current: number, last: number): (number | string)[] {
  const pages = [...new Set([1, last, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const items: (number | string)[] = [];
  pages.forEach((p, i) => {
    const prev = pages[i - 1];
    if (prev !== undefined) {
      if (p - prev === 2) items.push(prev + 1);
      else if (p - prev > 2) items.push(`gap-${p}`);
    }
    items.push(p);
  });
  return items;
}

type Props = { page: number; lastPage: number; onChange: (page: number) => void };

const base = "flex size-10 items-center justify-center rounded-full text-sm font-semibold";

export default function Pagination({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${base} bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/10`}
        >
          <ChevronLeft size={16} />
        </button>

        {pageItems(page, lastPage).map((item) =>
          typeof item === "string" ? (
            <span key={item} className="w-6 text-center text-white/40">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onChange(item)}
              className={`${base} ${
                item === page ? "bg-accent text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className={`${base} bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/10`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}