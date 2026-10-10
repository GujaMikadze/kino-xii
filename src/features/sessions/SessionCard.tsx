import Ticket from "../../components/icons/Ticket";
import type { Session } from "../../api/types";

const LOW_SEATS = 5; // ამ რაოდენობამდე "X left" წითლად ჩანს

type Props = { session: Session; onSelect: (session: Session) => void };

export default function SessionCard({ session, onSelect }: Props) {
  const soldOut = session.isSoldOut;
  const low = session.seatsLeft <= LOW_SEATS;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect(session)}
      className={`flex w-63 shrink-0 flex-col gap-2 cursor-pointer rounded-xl bg-[#1E2031] p-3.75 text-left transition ${
        soldOut ? "cursor-not-allowed opacity-40" : "hover:bg-[#2A2C3D]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold">{session.time}</span>
        <span className="rounded-full bg-[#2A2C3D] px-2.5 py-1.5 text-xs font-semibold">
          {session.format.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-[#A9A9A9]">{session.language.name}</span>
        {soldOut ? (
          <span className="shrink-0 font-bold text-white/60">Sold out</span>
        ) : (
          <span
            className={`flex shrink-0 items-center gap-1 font-bold ${
              low ? "text-accent" : "text-success"
            }`}
          >
            <Ticket size={16} color={low ? "#ec3013" : "#3ddc84"} /> {session.seatsLeft} left
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs font-bold">
        <span className="truncate">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="shrink-0 text-sm">₾{session.price}</span>
      </div>
    </button>
  );
}