type Props = { step: "seats" | "checkout"; onSeats?: () => void };

const base = "flex-1 rounded-full py-2.5 text-center text-xs font-semibold tracking-wider";

export default function StepTabs({ step, onSeats }: Props) {
  return (
    <div className="flex gap-1 rounded-full bg-[#1E2031]">
      <button
        type="button"
        disabled={!onSeats}
        onClick={onSeats}
        aria-current={step === "seats" ? "step" : undefined}
        className={`${base} ${
          step === "seats" ? "bg-accent text-white" : "text-white/70 hover:bg-white/10"
        } disabled:cursor-default`}
      >
        SEATS
      </button>
      <span
        aria-current={step === "checkout" ? "step" : undefined}
        className={`${base} ${step === "checkout" ? "bg-accent text-white" : "text-white/70"}`}
      >
        CHECKOUT
      </span>
    </div>
  );
}