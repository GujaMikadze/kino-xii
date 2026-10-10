import { Link } from "react-router-dom";
import type { Session, SessionGroup } from "../../api/types";
import AgeBadge from "../../components/AgeBadge";
import { useDragScroll } from "../../hooks/useDragScroll";
import SessionCard from "./SessionCard";

type Props = { group: SessionGroup; onSelect: (session: Session) => void };

export default function MovieSessions({ group, onSelect }: Props) {
  const dragRef = useDragScroll();
  const { movie, sessions } = group;

  return (
    <section className="border-b border-[#2A2C3D] py-8 first:pt-0 last:border-0">
      <div className="mb-3.5 flex items-center gap-4">
        <Link
          to={`/movies/${movie.slug}`}
          className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-field"
        >
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={movie.title} className="size-full object-cover" />
          )}
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/movies/${movie.slug}`} className="text-lg font-extrabold hover:underline">
              {movie.title}
            </Link>
            <AgeBadge code={movie.ageRating.code} className="py-1 px-2" />
          </div>
          <p className="mt-3 text-sm text-[#A9A9A9]">{movie.runtimeMinutes} min</p>
        </div>
      </div>

      <div ref={dragRef} className="drag-scroll no-scrollbar flex gap-3 overflow-x-auto">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}