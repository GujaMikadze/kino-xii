import type { UseQueryResult } from "@tanstack/react-query";
import Ticket from "../../components/icons/Ticket";
import type { MovieDetail, Session, VenueSessions } from "../../api/types";
import DateStrip from "../../components/DateStrip";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import { formatLongDate, type Day } from "../../lib/dates";
import { money } from "../../lib/money";

const LOW_SEATS = 5;

function groupByHall(sessions: Session[]) {
  const map = new Map<number, { name: string; sessions: Session[] }>();
  for (const s of sessions) {
    const entry = map.get(s.hall.id) ?? { name: s.hall.name, sessions: [] };
    entry.sessions.push(s);
    map.set(s.hall.id, entry);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

type CardProps = {
  session: Session;
  blockedMessage: string | null;
  onSelect: (s: Session) => void;
};

function MiniSessionCard({ session, blockedMessage, onSelect }: CardProps) {
  const disabled = session.isSoldOut || !!blockedMessage;
  const low = session.seatsLeft <= LOW_SEATS;

  return (
    <button
      type="button"
      disabled={disabled}
      title={blockedMessage ?? undefined}
      onClick={() => onSelect(session)}
      className={`cursor-pointer ticket-bg flex h-20.25 w-51.75 shrink-0 text-left ${disabled ? "cursor-not-allowed opacity-40" : ""
        }`}
    >
      {/* left part: 124px, ends at the notch center */}
      <div className="flex w-31 flex-col items-center justify-center gap-1.5">
        <p className="text-xl font-extrabold">{session.time}</p>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-white/60">{session.language.code}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">{session.format.name}</span>
        </div>
      </div>

      <span aria-hidden="true" className="ticket-divider" />

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
        {session.isSoldOut ? (
          <span className="text-xs font-bold text-white/60">Sold out</span>
        ) : (
          <>
            <span className="text-lg font-extrabold text-accent">{money(session.price)}</span>
            <span
              className={`flex items-center gap-1 text-xs font-bold ${low ? "text-accent" : "text-white/60"
                }`}
            >
              <Ticket size={11} color="currentColor" /> {session.seatsLeft} left
            </span>
          </>
        )}
      </div>
    </button>
  );
}

type Props = {
  movie: MovieDetail;
  days: Day[];
  date: string;
  onDate: (iso: string) => void;
  query: UseQueryResult<VenueSessions[]>;
  blockedMessage: string | null;
  onSelect: (s: Session) => void;
};

export default function SessionsSection({
  movie,
  days,
  date,
  onDate,
  query,
  blockedMessage,
  onSelect,
}: Props) {
  let content;

  if (movie.isComingSoon) {
    content = (
      <EmptyState
        title="Not in cinemas yet"
        text={`Sessions will be available after the release on ${formatLongDate(movie.releaseDate)}.`}
      />
    );
  } else if (query.isLoading || !query.data) {
    content = query.isError ? (
      <ErrorState message="Couldn't load sessions" onRetry={query.refetch} />
    ) : (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-28 w-[420px]" />
      </div>
    );
  } else if (query.data.length === 0) {
    content = (
      <EmptyState title="No sessions on this date" text="Try picking another day." />
    );
  } else {
    content = (
      <div className="space-y-8">
        {query.data.map(({ venue, sessions }) => (
          <div key={venue.id}>
            <h3 className="mb-4 text-sm font-extrabold">{venue.name}</h3>
            <div className="grid grid-cols-2 gap-2.5 max-w-229.5">
              {groupByHall(sessions).map((hall) => (
                <div key={hall.name} className="rounded-2xl bg-[#1E2031] p-4">
                  <p className="mb-2 text-xs font-semibold text-white">Hall {hall.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {hall.sessions.map((s) => (
                      <MiniSessionCard
                        key={s.id}
                        session={s}
                        blockedMessage={blockedMessage}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="min-w-0 flex-1">
      <h2 className="mb-4 text-lg font-extrabold">Sessions</h2>
      <DateStrip customClassName="h-20 w-20" days={days} value={date} onChange={onDate} />

      {blockedMessage && (
        <p className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
          {blockedMessage}
        </p>
      )}

      <div className="mt-8">{content}</div>
    </section>
  );
}