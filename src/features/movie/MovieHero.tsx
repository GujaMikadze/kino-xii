import { Clock } from "lucide-react";
import type { MovieDetail } from "../../api/types";
import AgeBadge from "../../components/AgeBadge";

const chip = "rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-semibold backdrop-blur";

export default function MovieHero({ movie }: { movie: MovieDetail }) {
  const backdrop = movie.backdropUrl ?? movie.posterUrl;

  return (
    <section className="relative min-h-141.75 overflow-hidden">
      {backdrop && (
        <img src={backdrop} alt="" className="absolute inset-0 size-full object-cover" />
      )}

      <div className="relative flex items-end gap-8.5 px-15 pb-10 pt-38">
        <div className="aspect-289/374 w-72.25 shrink-0 overflow-hidden rounded-[0.875rem] bg-field shadow-2xl">
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={movie.title} className="size-full object-cover" />
          )}
        </div>

        <div className="max-w-[560px]">
          {movie.genres.length > 0 && (
            <p className="text-xs font-semibold tracking-wider text-accent px-2.5 py-1.5 rounded-full bg-accent/10 inline-block">
              {movie.genres.map((g) => g.name.toUpperCase()).join(" · ")}
            </p>
          )}
          <h1 className="mt-4 text-[40px] font-extrabold uppercase leading-none">
            {movie.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white">{movie.synopsis}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <AgeBadge code={movie.ageRating.code} className="px-2.5 py-1.5" />
            <span className={`${chip} flex items-center gap-1.5`}>
              <Clock size={12} /> {movie.runtimeMinutes} Min
            </span>
            {movie.formats.map((f) => (
              <span key={f.id} className={chip}>
                {f.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}