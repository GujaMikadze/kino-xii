import { useEffect, useMemo, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { Session } from "../api/types";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Skeleton from "../components/Skeleton";
import BookingFlow from "../features/booking/BookingFlow";
import MovieDetails from "../features/movie/MovieDetails";
import MovieHero from "../features/movie/MovieHero";
import SessionsSection from "../features/movie/SessionsSection";
import { useMovieDetail, useMovieSessions } from "../hooks/useMovie";
import { nextDays } from "../lib/dates";
import { addRecentlyViewed } from "../lib/recentlyViewed";

export default function MovieDetailPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { user, isBooting, openAuthModal } = useAuth();

  const movie = useMovieDetail(slug);
  const data = movie.data;

  const days = useMemo(() => nextDays(7), []);
  const today = days[0].iso;

  // თარიღი URL-იდან, სხვა შემთხვევაში დღეს (ან პირველი დღე, როცა სეანსი აქვს)
  const urlDate = days.find((d) => d.iso === params.get("date"))?.iso;
  const fallbackDate = data
    ? data.availableDates.includes(today)
      ? today
      : (days.find((d) => data.availableDates.includes(d.iso))?.iso ?? today)
    : today;
  const date = urlDate ?? fallbackDate;

  const sessions = useMovieSessions(slug, data ? date : undefined);

  const sessionId = Number(params.get("session")) || null;

  useEffect(() => {
    if (data) addRecentlyViewed(data);
  }, [data]);

  const setDate = (iso: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("date", iso);
        return next;
      },
      { replace: true },
    );

  // push: Back ღილაკი მოდალს ხურავს
  const openBooking = (s: Session) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("date", s.date);
      next.set("session", String(s.id));
      return next;
    });

  const closeBooking = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("session");
        return next;
      },
      { replace: true },
    );

    
  const asked = useRef<number | null>(null);
  useEffect(() => {
    if (!sessionId) {
      asked.current = null;
      return;
    }
    if (isBooting || user || asked.current === sessionId) return;
    asked.current = sessionId;
    openAuthModal("login").then((ok) => {
      if (!ok) closeBooking();
    });
  }, [sessionId, isBooting, user]);

  if (movie.isError) {
    const notFound = movie.error instanceof ApiError && movie.error.status === 404;
    return (
      <div className="px-30 pt-32">
        {notFound ? (
          <EmptyState title="Movie not found" text="This film doesn't exist or was removed.">
            <Link
              to="/sessions"
              className="inline-flex h-10 items-center rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
            >
              Browse sessions
            </Link>
          </EmptyState>
        ) : (
          <ErrorState message="Couldn't load this film" onRetry={movie.refetch} />
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-130 rounded-none" />
        <div className="space-y-4 px-30 py-12">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-120" />
        </div>
      </div>
    );
  }

  const blockedMessage =
    user && user.age !== null && user.age < data.ageRating.minAge
      ? `This film is rated ${data.ageRating.code}. You cannot buy tickets for it with this account.`
      : null;

  return (
    <>
      <MovieHero movie={data} />

      <div className="flex gap-16 px-15 py-8.5">
        <SessionsSection
          movie={data}
          days={days}
          date={date}
          onDate={setDate}
          query={sessions}
          blockedMessage={blockedMessage}
          onSelect={openBooking}
        />
        <MovieDetails movie={data} />
      </div>

      {sessionId && user && <BookingFlow sessionId={sessionId} onClose={closeBooking} />}
    </>
  );
}