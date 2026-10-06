import { Link } from "react-router-dom";
import AgeBadge from "../../components/AgeBadge";
import { useRecentlyViewed } from "../../lib/recentlyViewed";

export default function RecentlyViewed() {
  const items = useRecentlyViewed();
  if (items.length === 0) return null;

  return (
    <section className="pt-8">
      <h2 className="mb-4 px-30 text-sm font-extrabold">Recently viewed</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-30">
        {items.map((m) => (
          <Link
            key={m.id}
            to={`/movies/${m.slug}`}
            className="flex w-[300px] shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-2.5 hover:bg-white/[0.08]"
          >
            {m.posterUrl ? (
              <img src={m.posterUrl} alt="" className="h-14 w-10 rounded object-cover" />
            ) : (
              <div className="h-14 w-10 rounded bg-field" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{m.title}</p>
              <p className="my-1 text-[11px] text-white/50">
                {[m.genre, `${m.runtimeMinutes} min`].filter(Boolean).join(" · ")}
              </p>
              <AgeBadge code={m.ageCode} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}