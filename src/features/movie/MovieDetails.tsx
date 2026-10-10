import type { ReactNode } from "react";
import type { MovieDetail } from "../../api/types";
import { formatLongDate } from "../../lib/dates";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4.5">
      <dt className="text-xs font-semibold tracking-wider text-[#A9A9A9]">{label}</dt>
      <dd className="mt-1.75 text-sm font-semibold text-white">{children}</dd>
    </div>
  );
}

export default function MovieDetails({ movie }: { movie: MovieDetail }) {
  const { ageRating } = movie;

  return (
    <aside className="max-w-110.25 px-6.5 shrink-0">
      <h2 className="mb-4.5 text-xl font-extrabold">Details</h2>
      <dl>
        {movie.director && <Row label="DIRECTOR">{movie.director}</Row>}
        {movie.cast && <Row label="MAIN CAST">{movie.cast}</Row>}
        <Row label="DURATION">{movie.runtimeMinutes} minutes</Row>
        <Row label="RELEASE DATE">{formatLongDate(movie.releaseDate)}</Row>
        {movie.formats.length > 0 && (
          <Row label="FORMATS">{movie.formats.map((f) => f.name).join(", ")}</Row>
        )}
        <Row label="FROM">₾{movie.fromPrice}</Row>
      </dl>

      <div className="mt-2.5 rounded-xl bg-[#e27e04]/10 px-3.25 py-2.25">
        <p className="text-xs font-semibold mb-1.75 tracking-wider text-[#E27E04]">RATING NOTE</p>
        <p className="mt-1.5 text-xs text-[#E27E04] flex gap-1.75">
          <strong>{ageRating.code}</strong> {ageRating.description}
          {ageRating.minAge >= 16 &&
            ` Tickets require an account aged ${ageRating.minAge} or over.`}
        </p>
      </div>
    </aside>
  );
}