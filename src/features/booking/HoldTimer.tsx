export default function HoldTimer({ seconds }: { seconds: number }) {
  const low = seconds <= 60;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div
      role="timer"
      className={`rounded-xl border bg-field/60 px-3 py-1.5 text-center ${
        low ? "border-accent/60" : "border-white/10"
      }`}
    >
      <p className="text-[9px] font-bold tracking-wider text-white/50">SEATS HELD</p>
      <p className={`text-sm font-extrabold tabular-nums ${low ? "text-accent" : ""}`}>
        {m}:{s}
      </p>
    </div>
  );
}