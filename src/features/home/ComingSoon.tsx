import { useMutation } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import { api, ApiError } from "../../api/client";
import type { Movie } from "../../api/types";
import AgeBadge from "../../components/AgeBadge";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import { useComingSoon } from "../../hooks/useMovies";
import { inCinemasLabel, metaLine } from "../../lib/movie";
import SectionHeader from "./SectionHeader";
import { useDragScroll } from "../../hooks/useDragScroll";

function NotifyButton({ slug }: { slug: string }) {
  const mutation = useMutation({
    mutationFn: () => api(`/movies/${slug}/notify`, { method: "POST" }),
  });

  // 401-ზე api client თავად ხსნის login მოდალს და შესვლის შემდეგ მოთხოვნას იმეორებს
  const failed =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.status === 401);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={mutation.isPending || mutation.isSuccess}
        onClick={() => mutation.mutate()}
        className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 px-4 text-[11px] font-bold hover:bg-white/10 disabled:cursor-default disabled:opacity-70"
      >
        {mutation.isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : mutation.isSuccess ? (
          <>
            <Check size={12} className="text-success" /> We'll let you know
          </>
        ) : (
          <>
            <Bell size={12} /> Notify Me
          </>
        )}
      </button>
      {failed && (
        <p className="mt-1 text-[10px] text-accent">Couldn't subscribe. Try again.</p>
      )}
    </div>
  );
}

function ComingSoonCard({ movie }: { movie: Movie }) {
  const image = movie.backdropUrl ?? movie.posterUrl;

  return (
    <article className="flex w-[520px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04]">
      <div className="w-[200px] shrink-0 bg-field">
        {image && (
          <img src={image} alt="" className="size-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center p-4">
        <p className="text-[10px] font-bold tracking-wider text-accent">
          {inCinemasLabel(movie.releaseDate)}
        </p>
        <h3 className="mt-1 truncate text-sm font-bold">{movie.title}</h3>
        <p className="mt-1 text-[11px] text-white/50">{metaLine(movie)}</p>
        <div className="mt-2">
          <AgeBadge code={movie.ageRating.code} />
        </div>
        <NotifyButton slug={movie.slug} />
      </div>
    </article>
  );
}

export default function ComingSoon() {
  const { data, isLoading, isError, refetch } = useComingSoon();
  const dragRef = useDragScroll();
  return (
    <section className="py-8 relative">
      <SectionHeader title="Coming soon..." to="/sessions"/>

      {isLoading ? (
        <div className="no-scrollbar flex gap-5 overflow-x-auto px-15" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[160px] w-[520px] shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Couldn't load upcoming films" onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No upcoming films yet" text="New releases will appear here." />
      ) : (
        <div className="no-scrollbar flex drag-scroll gap-5 overflow-x-auto px-15 pb-2" ref={dragRef}>
          {data.map((movie) => (
            <ComingSoonCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      <div className="absolute right-0 top-0 h-full w-75 bg-[linear-gradient(to_right,transparent_0%,#070C1C_100%)]" />
    </section>
  );
}