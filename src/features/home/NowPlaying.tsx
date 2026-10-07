import { Link } from "react-router-dom";
import AgeBadge from "../../components/AgeBadge";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import type { MovieWithSynopsis } from "../../api/types";
import { useNowPlaying } from "../../hooks/useMovies";
import { metaLine } from "../../lib/movie";
import SectionHeader from "./SectionHeader";
import { useDragScroll } from "../../hooks/useDragScroll";

function NowPlayingCard({ movie }: { movie: MovieWithSynopsis }) {
  return (
    <article className="w-[280px] shrink-0 rounded-3xl border border-white/5 bg-white/[0.04] p-3">
      <Link to={`/movies/${movie.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-field">
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="size-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <h3 className="mt-4 truncate text-sm font-bold">{movie.title}</h3>
      </Link>
      <p className="mt-1 text-[11px] text-white/50">{metaLine(movie)}</p>
      <div className="mt-2">
        <AgeBadge code={movie.ageRating.code} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs">
          <span className="text-white/60">From</span>{" "}
          <span className="font-bold">₾ {movie.fromPrice}</span>
        </p>
        <Link
          to={`/movies/${movie.slug}`}
          className="flex h-9 items-center rounded-full bg-accent px-5 text-xs font-bold hover:bg-accent-hover"
        >
          Buy Ticket
        </Link>
      </div>
    </article>
  );
}

export default function NowPlaying() {
  const { data, isLoading, isError, refetch } = useNowPlaying();
  const dragRef = useDragScroll();

  return (
    <section className="py-8 relative">
      <SectionHeader title="Now playing" to="/sessions" />

      {isLoading ? (
        <div className="no-scrollbar flex gap-5 overflow-x-auto px-15" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[470px] w-[280px] shrink-0 rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Couldn't load films" onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Nothing is playing right now" text="Check back soon." />
      ) : (
        <div className="no-scrollbar flex drag-scroll gap-5 overflow-x-auto px-15 pb-2" ref={dragRef}>
          {data.map((movie) => (
            <NowPlayingCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      <div className="absolute right-0 top-0 h-full w-75 bg-[linear-gradient(to_right,transparent_0%,#070C1C_100%)]" />
    </section>
  );
}