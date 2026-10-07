import { Link } from "react-router-dom";
import AgeBadge from "../../components/AgeBadge";
import { useRecentlyViewed } from "../../lib/recentlyViewed";

export default function RecentlyViewed() {
  const items = useRecentlyViewed();
  if (items.length === 0) return null;

  return (
    <section className="pt-8">
      <h2 className="mb-5 px-15 text-[1.5rem] font-extrabold">Recently viewed</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-15">
        {items.map((m) => (
          <Link
            key={m.id}
            to={`/movies/${m.slug}`}
            className="flex w-82.5 shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/4 p-2.5 hover:bg-white/8"
          >
            {m.posterUrl ? (
              <img src={m.posterUrl} alt="" className="h-16.75 w-21.75 rounded object-cover" />
            ) : (
              <div className="h-16.75 w-21.75 rounded bg-field" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{m.title}</p>
              <p className="my-1 text-xs text-[#A9A9A9]">
                {[m.genre, `${m.runtimeMinutes} min`].filter(Boolean).join(" · ")}
              </p>
              <AgeBadge code={m.ageCode} className="py-1 px-2" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}