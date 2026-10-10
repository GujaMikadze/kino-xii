import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Session } from "../api/types";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import Skeleton from "../components/Skeleton";
import FilterPanel from "../features/sessions/FilterPanel";
import MovieSessions from "../features/sessions/MovieSessions";
import SessionsSkeleton from "../features/sessions/SessionSkeleton";
import { useSessionFilters } from "../features/sessions/useSessionFilters";
import { useSessions } from "../features/sessions/useSession";
import { useFilterOptions } from "../hooks/useFilterOptions";
import { useNavigate } from "react-router-dom";

export default function SessionsPage() {
  
  const {
    data: options,
    isError: optionsError,
    refetch: refetchOptions,
  } = useFilterOptions();
  const { filters, days, update, toggle, clearAll, activeCount } = useSessionFilters(options);
  const sessions = useSessions(filters);

  const meta = sessions.data?.meta;
  const groups = sessions.data?.data ?? [];

  // ძველი/ხელით ჩაწერილი page=99 ბოლო არსებულ გვერდზე გადადის
  useEffect(() => {
    if (!filters || !meta) return;
    const last = Math.max(1, meta.lastPage);
    if (filters.page > last) update({ page: last }, true);
  }, [filters, meta, update]);

  const navigate = useNavigate();

  const handleSelect = (session: Session) =>
    navigate(`/movies/${session.movie.slug}?date=${session.date}&session=${session.id}`);

  const countText = !meta
    ? null
    : meta.totalSessions === 0
      ? "No sessions found"
      : `Showing ${meta.totalSessions} ${meta.totalSessions === 1 ? "session" : "sessions"}`;

  let content;
  if (optionsError || (sessions.isError && !sessions.data)) {
    content = (
      <ErrorState
        message="Couldn't load sessions"
        onRetry={() => (optionsError ? refetchOptions() : sessions.refetch())}
      />
    );
  } else if (!filters || !sessions.data) {
    content = <SessionsSkeleton />;
  } else if (groups.length === 0) {
    content = (
      <EmptyState
        title="No sessions match these filters"
        text="Try another date or remove some filters."
      >
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
          >
            Clear All Filters
          </button>
        )}
      </EmptyState>
    );
  } else {
    content = (
      <>
        <div>
          {groups.map((g) => (
            <MovieSessions key={g.movie.id} group={g} onSelect={handleSelect} />
          ))}
        </div>
        <div className="mt-8">
          <Pagination
            page={filters.page}
            lastPage={sessions.data.meta.lastPage}
            onChange={(p) => {
              update({ page: p });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Sessions</h1>
      <p className="mt-1.5 text-sm text-[#A9A9A9]">Browse showtimes across all venues</p>

      <div className="mt-9 flex items-start gap-12.5">
        <aside className="sticky no-scrollbar top-6 max-h-[calc(100vh-3rem)] w-[320px] shrink-0 overflow-y-auto rounded-2xl bg-[#1E2031] p-6">
          {optionsError ? (
            <ErrorState message="Couldn't load filters" onRetry={refetchOptions} />
          ) : !options || !filters ? (
            <div className="space-y-4" aria-busy="true">
              <Skeleton className="h-5 w-20" />
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <FilterPanel
              options={options}
              filters={filters}
              days={days}
              activeCount={activeCount}
              onToggle={toggle}
              onDate={(date) => update({ date })}
              onClear={clearAll}
            />
          )}
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 flex h-4.5 items-center justify-between">
            {countText ? (
              <p className="text-sm font-semibold" aria-live="polite">
                {countText}
              </p>
            ) : (
              <Skeleton className="h-4 w-36" />
            )}

            {options && filters && (
              <label className="flex items-center gap-2 text-sm text-[#A9A9A9]">
                Sort:
                <span className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => update({ sort: e.target.value })}
                    className="cursor-pointer appearance-none bg-transparent pr-6 text-sm font-extrabold text-white outline-none"
                  >
                    {options.sorts.map((s) => (
                      <option key={s.id} value={s.id} className="bg-surface">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
                  />
                </span>
              </label>
            )}
          </div>

          {content}
        </section>
      </div>
    </div>
  );
}