import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popcorn, Search, TriangleAlert, X } from "lucide-react";
import type { Movie } from "../api/types";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";

// ნაპოვნი ნაწილი გამოყოფილია (თეთრი, მსხვილი), დანარჩენი მქრქალია
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <span className="text-white">{text}</span>;

  return (
    <>
      <span className="text-white/70">{text.slice(0, i)}</span>
      <span className="font-bold text-white">{text.slice(i, i + query.length)}</span>
      <span className="text-white/70">{text.slice(i + query.length)}</span>
    </>
  );
}

function MessagePanel({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-field">
        {icon}
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-white/60">{text}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

const pillButton =
  "h-10 rounded-full bg-field px-6 text-xs font-bold hover:bg-white/15";

function ResultRow({
  movie,
  query,
  onSelect,
}: {
  movie: Movie;
  query: string;
  onSelect: () => void;
}) {
  return (
    <Link
      to={`/movies/${movie.slug}`}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
    >
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt="" className="h-12 w-9 rounded object-cover" />
      ) : (
        <div className="h-12 w-9 rounded bg-field" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <Highlight text={movie.title} query={query} />
        </p>
        <p className="text-[11px] text-white/50">
          {movie.kind === "film" ? "Film" : "Event"} · {movie.ageRating.code} ·{" "}
          {movie.runtimeMinutes} min
        </p>
      </div>

      {movie.isComingSoon ? (
        <span className="text-xs font-bold text-warning">Coming Soon</span>
      ) : (
        <span className="text-xs font-bold">from ₾{movie.fromPrice}</span>
      )}
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-1 p-3" aria-busy="true" aria-label="Loading results">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-2 py-2">
          <div className="h-12 w-9 rounded bg-field" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-field" />
            <div className="h-2.5 w-1/3 rounded bg-field" />
          </div>
          <div className="h-3 w-12 rounded bg-field" />
        </div>
      ))}
    </div>
  );
}

export default function SearchBox() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const query = value.trim();
  const debounced = useDebounce(query, 300);
  const { data, isLoading, isError, refetch } = useSearch(debounced);
  const waiting = query !== debounced; // მომხმარებელი ჯერ კიდევ წერს

  // დახურვა გარეთ დაჭერით და Escape-ით
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setValue("");
  };

  const browseAll = () => {
    close();
    navigate("/sessions");
  };

  const browseButton = (
    <button type="button" onClick={browseAll} className={pillButton}>
      Browse all sessions
    </button>
  );

  let panel: React.ReactNode;

  if (!query) {
    panel = (
      <MessagePanel
        icon={<Popcorn size={18} />}
        title="What do you want to watch?"
        text="Search by title, director or cast"
      >
        {browseButton}
      </MessagePanel>
    );
  } else if (waiting || isLoading) {
    panel = <SkeletonRows />;
  } else if (isError) {
    panel = (
      <MessagePanel
        icon={<TriangleAlert size={18} />}
        title="Something went wrong"
        text="We couldn't load the results."
      >
        <button type="button" onClick={() => refetch()} className={pillButton}>
          Try again
        </button>
      </MessagePanel>
    );
  } else if (!data || data.length === 0) {
    panel = (
      <MessagePanel
        icon={<Search size={18} />}
        title={`No results for “${query}”`}
        text="Check the spelling or try another film or live event."
      >
        {browseButton}
      </MessagePanel>
    );
  } else {
    panel = (
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-bold tracking-wider text-white/50">
          <span>FILMS &amp; EVENTS</span>
          <span>
            {data.length} {data.length === 1 ? "result" : "results"}
          </span>
        </div>
        {data.map((movie) => (
          <ResultRow key={movie.id} movie={movie} query={query} onSelect={close} />
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative ml-auto w-120">
      <Search
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search films and live events"
        aria-label="Search films and live events"
        className="h-10 w-full rounded-full bg-white/10 pl-9 pr-10 text-xs outline-none placeholder:text-white/70 focus:bg-white/15"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          <X size={12} />
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
          {panel}
        </div>
      )}
    </div>
  );
}