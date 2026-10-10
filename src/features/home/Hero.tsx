import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock} from "lucide-react";
import AgeBadge from "../../components/AgeBadge";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { useFeatured } from "../../hooks/useMovies";
import { premiereLabel } from "../../lib/movie";
import Ticket from "../../components/icons/Ticket";

const SLIDE_MS = 6000;
const chip =
  "rounded-full bg-white/10 px-3 py-2 text-[12px] font-semibold backdrop-blur-2xl min-w-11.5 text-center";

export default function Hero() {
  const { data, isLoading, isError, refetch } = useFeatured();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  if (isLoading) {
    return <div className="h-190 animate-pulse bg-field" aria-busy="true" />;
  }
  if (isError) {
    return (
      <div className="flex h-100 items-center justify-center bg-surface">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  const movies = (data ?? []).slice(0, 4);
  const count = movies.length;

  if (count === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-surface">
        <EmptyState title="No featured films yet" text="Check back soon." />
      </div>
    );
  }

  const active = index % count;
  const movie = movies[active];
  const next = () => setIndex((active + 1) % count);
  const prev = () => setIndex((active - 1 + count) % count);

  return (
    <section
      className="relative h-[800px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {movies.map((m, i) => {
        const src = m.backdropUrl ?? m.posterUrl;
        return src ? (
          <img
            key={m.id}
            src={src}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null;
      })}
      <div className="absolute inset-0 bg-linear-to-r from-bg/90 via-bg/20 to-transparent" />

      <div key={movie.id} className="fade-up absolute inset-x-0 bottom-36 px-15">
        <span className="inline-block rounded-full bg-accent/10 px-2 py-1 text-[12px] font-bold tracking-wider text-accent">
          {premiereLabel(movie.releaseDate)}
        </span>
        <h1 className="mt-4 text-[40px] font-extrabold uppercase leading-none">
          {movie.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <AgeBadge code={movie.ageRating.code} />
          <span className={`${chip} flex items-center gap-1.5`}>
            <Clock size={12} /> {movie.runtimeMinutes} Min
          </span>
          {movie.formats.map((f) => (
            <span key={f.id} className={chip}>
              {f.name}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-130 text-sm leading-relaxed text-white/80">
          {movie.synopsis}
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            to={`/movies/${movie.slug}`}
            className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold hover:bg-accent-hover"
          >
            <Ticket size={16} />

             Buy tickets
          </Link>
          <Link
            to="/sessions"
            className="flex h-11 items-center rounded-full bg-white/15 px-6 text-sm font-extrabold backdrop-blur hover:bg-white/25"
          >
            All sessions
          </Link>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-10 flex items-center gap-8 px-15">
          <div className="flex flex-1 gap-1">
            {movies.map((m, i) => (
              <button
                key={m.id}
                type="button"
                aria-label={`Show ${m.title}`}
                onClick={() => setIndex(i)}
                className="flex-1 py-3"
              >
                <span className={`relative block h-0.5 overflow-hidden ${i === active ? 'bg-white' : 'bg-white/40'}`}>
                  {i === active && (
                    <span
                      key={index}
                      className="absolute inset-0 origin-left bg-accent"
                      style={{
                        animation: `progress ${SLIDE_MS}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={next}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {[
              { label: "Previous", onClick: prev, Icon: ChevronLeft },
              { label: "Next", onClick: next, Icon: ChevronRight },
            ].map(({ label, onClick, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={onClick}
                className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}